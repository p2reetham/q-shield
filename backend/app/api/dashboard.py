"""Dashboard summary + the end-to-end 'Simulate Attack' demo pipeline."""
import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database import models
from app.schemas.schemas import DashboardSummary, SimulateAttackResponse, ThreatAnalyzeRequest
from app.api.threats import _run_analysis
from app.services.blockchain_service import verify_chain
from app.services import threat_service

router = APIRouter(prefix="/api", tags=["dashboard"])

SCENARIO_WEIGHTS = {
    "normal": 0.55, "suspicious": 0.18, "replay_attack": 0.09,
    "key_compromise": 0.05, "anomalous_signing": 0.08, "invalid_signature": 0.05,
}


def _security_score(events: list[models.SecurityEvent]) -> int:
    if not events:
        return 92
    recent = events[:50]
    avg_threat = sum(e.threat_score for e in recent) / len(recent)
    score = 100 - avg_threat * 0.6
    return int(max(10, min(99, round(score))))


@router.get("/dashboard/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db)):
    sigs = db.query(models.Signature).all()
    valid = [s for s in sigs if s.verification_status == "VALID"]
    suspicious = [s for s in sigs if s.verification_status != "VALID"]
    events = db.query(models.SecurityEvent).order_by(models.SecurityEvent.created_at.desc()).all()
    blocked = [e for e in events if e.status == "BLOCKED"]
    threats = [e for e in events if e.threat_level not in ("NORMAL",)]
    active_keys = db.query(models.Key).filter(models.Key.status == "ACTIVE").count()
    blocks = db.query(models.BlockchainBlock).count()

    dist = {"NORMAL": 0, "LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for e in events:
        dist[e.threat_level] = dist.get(e.threat_level, 0) + 1

    return DashboardSummary(
        total_signatures=len(sigs),
        valid_signatures=len(valid),
        suspicious_signatures=len(suspicious),
        blocked_requests=len(blocked),
        threats_detected=len(threats),
        active_keys=active_keys,
        blockchain_records=blocks,
        security_score=_security_score(events),
        threat_distribution=dist,
        recent_events=events[:10],
    )


@router.post("/demo/simulate-attack", response_model=SimulateAttackResponse)
def simulate_attack(db: Session = Depends(get_db)):
    scenario = random.choices(
        list(SCENARIO_WEIGHTS.keys()), weights=list(SCENARIO_WEIGHTS.values())
    )[0]
    # Bias the demo button toward an interesting (non-normal) outcome most of the time
    if scenario == "normal" and random.random() < 0.7:
        scenario = random.choice(["suspicious", "replay_attack", "key_compromise", "anomalous_signing"])

    req = ThreatAnalyzeRequest(scenario=scenario)
    analysis = _run_analysis(db, req)

    event = db.query(models.SecurityEvent).filter(models.SecurityEvent.event_id == analysis.event_id).first()
    block = db.query(models.BlockchainBlock).order_by(models.BlockchainBlock.index.desc()).first()
    alert = db.query(models.Alert).filter(models.Alert.related_event_id == analysis.event_id).first()

    from app.quantum.optimizer import simulated_annealing_qubo
    from ml.generate_dataset import FEATURES
    q_result = simulated_annealing_qubo(n_features=len(FEATURES), target_k=8, iterations=200)

    from app.schemas.schemas import QuantumOptimizeResponse, EventOut, BlockOut, AlertOut

    return SimulateAttackResponse(
        event=EventOut.model_validate(event),
        analysis=analysis,
        quantum=QuantumOptimizeResponse(
            features_evaluated=q_result["features_evaluated"],
            features_selected=q_result["features_selected"],
            selected_feature_names=q_result["selected_feature_names"],
            optimization_iterations=q_result["optimization_iterations"],
            best_objective_score=q_result["best_objective_score"],
            optimization_time_sec=q_result["optimization_time_sec"],
            method=q_result["method"],
            disclaimer=q_result["disclaimer"],
        ),
        block=BlockOut.model_validate(block),
        alert=AlertOut.model_validate(alert) if alert else None,
    )
