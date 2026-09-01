"""Pydantic request/response schemas for the Q-SHIELD API."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ---------- Keys ----------
class KeyGenerateRequest(BaseModel):
    label: Optional[str] = Field(default=None, description="Optional human label for the key")


class KeyOut(BaseModel):
    key_id: str
    algorithm: str
    public_key_pem: str
    status: str
    risk_level: str
    signature_count: int
    created_at: datetime
    last_used_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- Signatures ----------
class SignRequest(BaseModel):
    key_id: str
    content: str = Field(..., description="Raw text content to hash and sign")
    session_id: Optional[str] = None


class SignResponse(BaseModel):
    signature_id: str
    document_hash: str
    signature_hex: str
    key_id: str
    timestamp: datetime
    verification_status: str


class VerifyRequest(BaseModel):
    signature_id: Optional[str] = None
    key_id: Optional[str] = None
    content: Optional[str] = None
    signature_hex: Optional[str] = None


class VerifyResponse(BaseModel):
    valid: bool
    verification_status: str
    reason: str


class SignatureOut(BaseModel):
    signature_id: str
    key_id: str
    document_hash: str
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Threat detection ----------
class ThreatAnalyzeRequest(BaseModel):
    key_id: Optional[str] = None
    signing_frequency_per_hour: float = 1.0
    key_age_days: float = 30.0
    failed_attempts: int = 0
    transaction_value: float = 100.0
    is_replay_suspected: bool = False
    session_reuse_count: int = 0
    hour_of_day: int = 12
    scenario: Optional[str] = Field(
        default=None,
        description="Optional named demo scenario: normal, suspicious, replay_attack, key_compromise, anomalous_signing, invalid_signature",
    )


class ThreatAnalyzeResponse(BaseModel):
    analysis_id: str
    features: dict
    ml_anomaly_score: float
    rule_score: float
    quantum_weighted_score: float
    final_score: float
    classification: str
    event_id: str


class ThreatScoreOut(BaseModel):
    score: float
    band: str


# ---------- Quantum ----------
class QuantumOptimizeRequest(BaseModel):
    n_features: int = 18
    iterations: int = 500
    seed: Optional[int] = None


class QuantumOptimizeResponse(BaseModel):
    features_evaluated: int
    features_selected: int
    selected_feature_names: List[str]
    optimization_iterations: int
    best_objective_score: float
    optimization_time_sec: float
    method: str
    disclaimer: str


# ---------- Blockchain ----------
class BlockOut(BaseModel):
    block_id: str
    index: int
    previous_hash: str
    current_hash: str
    event_type: str
    transaction_id: str
    signature_id: Optional[str] = None
    threat_score: float
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChainVerifyResponse(BaseModel):
    verified: bool
    total_blocks: int
    inconsistencies: int
    details: List[str]


# ---------- Events ----------
class EventOut(BaseModel):
    event_id: str
    signature_id: Optional[str] = None
    key_id: Optional[str] = None
    event_type: str
    threat_level: str
    threat_score: float
    status: str
    details: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Alerts ----------
class AlertOut(BaseModel):
    alert_id: str
    severity: str
    title: str
    reason: str
    recommended_action: str
    related_event_id: Optional[str] = None
    related_key_id: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Dashboard ----------
class DashboardSummary(BaseModel):
    total_signatures: int
    valid_signatures: int
    suspicious_signatures: int
    blocked_requests: int
    threats_detected: int
    active_keys: int
    blockchain_records: int
    security_score: int
    threat_distribution: dict
    recent_events: List[EventOut]


class SimulateAttackResponse(BaseModel):
    event: EventOut
    analysis: ThreatAnalyzeResponse
    quantum: QuantumOptimizeResponse
    block: BlockOut
    alert: Optional[AlertOut] = None
