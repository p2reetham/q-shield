from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database import models
from app.schemas.schemas import ThreatAnalyzeRequest, ThreatAnalyzeResponse
from app.services import threat_service
from app.services.blockchain_service import add_block
from app.services.alert_service import maybe_create_alert
from app.core.security import new_id

router = APIRouter(prefix="/api/threat", tags=["threats"])


def _run_analysis(db: Session, req: ThreatAnalyzeRequest) -> ThreatAnalyzeResponse:
    params = req.model_dump(exclude={"scenario", "key_id"})
    if req.scenario and req.scenario in threat_service.SCENARIOS:
        params.update(threat_service.SCENARIOS[req.scenario])

    result = threat_service.analyze(**params)

    event = models.SecurityEvent(
        event_id=new_id("EVT"),
        signature_id=None,
        key_id=req.key_id,
        event_type=req.scenario.upper() if req.scenario else "THREAT_ANALYSIS",
        threat_level=result["classification"],
        threat_score=result["final_score"],
        status="BLOCKED" if result["classification"] == "CRITICAL" else "LOGGED",
        details=f"rule={result['rule_score']} ml={result['ml_anomaly_score']} quantum={result['quantum_weighted_score']}",
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    analysis = models.ThreatAnalysis(
        analysis_id=new_id("ANL"),
        event_id=event.event_id,
        features_json=result["features_json"],
        ml_anomaly_score=result["ml_anomaly_score"],
        rule_score=result["rule_score"],
        quantum_weighted_score=result["quantum_weighted_score"],
        final_score=result["final_score"],
        classification=result["classification"],
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    add_block(
        db, event_type=event.event_type, transaction_id=new_id("TXN"),
        signature_id=None, threat_score=result["final_score"],
        verification_status="SUSPICIOUS" if result["classification"] in ("HIGH", "CRITICAL") else "VALID",
    )

    maybe_create_alert(db, result["classification"], result["final_score"], event.event_id, req.key_id, result["features"])

    return ThreatAnalyzeResponse(
        analysis_id=analysis.analysis_id, features=result["features"],
        ml_anomaly_score=result["ml_anomaly_score"], rule_score=result["rule_score"],
        quantum_weighted_score=result["quantum_weighted_score"], final_score=result["final_score"],
        classification=result["classification"], event_id=event.event_id,
    )


@router.post("/analyze", response_model=ThreatAnalyzeResponse)
def analyze(req: ThreatAnalyzeRequest, db: Session = Depends(get_db)):
    return _run_analysis(db, req)


@router.get("/score/{score}")
def score_band(score: float):
    return {"score": score, "band": threat_service.classify(score)}
