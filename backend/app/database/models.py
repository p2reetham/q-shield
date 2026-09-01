"""SQLAlchemy ORM models for Q-SHIELD."""
from sqlalchemy import String, Float, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone

from app.database.database import Base


def _now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(80), unique=True)
    display_name: Mapped[str] = mapped_column(String(120), default="Demo Operator")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class Key(Base):
    __tablename__ = "keys"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    algorithm: Mapped[str] = mapped_column(String(40), default="RSA-2048 (PSS/SHA-256)")
    public_key_pem: Mapped[str] = mapped_column(String)
    private_key_pem: Mapped[str] = mapped_column(String)  # demo-only: kept server-side for the prototype
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE")  # ACTIVE, WARNING, COMPROMISED, REVOKED
    risk_level: Mapped[str] = mapped_column(String(20), default="LOW")
    signature_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    last_used_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)


class Signature(Base):
    __tablename__ = "signatures"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    signature_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    key_id: Mapped[str] = mapped_column(String(40), ForeignKey("keys.key_id"))
    document_hash: Mapped[str] = mapped_column(String(64))
    signature_hex: Mapped[str] = mapped_column(String)
    verification_status: Mapped[str] = mapped_column(String(20), default="VALID")  # VALID, INVALID, SUSPICIOUS
    session_id: Mapped[str] = mapped_column(String(20), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class SecurityEvent(Base):
    __tablename__ = "security_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    signature_id: Mapped[str] = mapped_column(String(40), nullable=True)
    key_id: Mapped[str] = mapped_column(String(40), nullable=True)
    event_type: Mapped[str] = mapped_column(String(60))  # e.g. SIGNATURE_VERIFIED, REPLAY_ATTEMPT
    threat_level: Mapped[str] = mapped_column(String(20))  # NORMAL, LOW, MEDIUM, HIGH, CRITICAL
    threat_score: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="LOGGED")  # LOGGED, BLOCKED, RESOLVED
    details: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class ThreatAnalysis(Base):
    __tablename__ = "threat_analysis"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    event_id: Mapped[str] = mapped_column(String(40), nullable=True)
    features_json: Mapped[str] = mapped_column(String)  # JSON-encoded feature vector used
    ml_anomaly_score: Mapped[float] = mapped_column(Float, default=0.0)
    rule_score: Mapped[float] = mapped_column(Float, default=0.0)
    quantum_weighted_score: Mapped[float] = mapped_column(Float, default=0.0)
    final_score: Mapped[float] = mapped_column(Float, default=0.0)
    classification: Mapped[str] = mapped_column(String(20), default="NORMAL")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class BlockchainBlock(Base):
    __tablename__ = "blockchain_blocks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    block_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    index: Mapped[int] = mapped_column(Integer)
    previous_hash: Mapped[str] = mapped_column(String(64))
    current_hash: Mapped[str] = mapped_column(String(64))
    event_type: Mapped[str] = mapped_column(String(60))
    transaction_id: Mapped[str] = mapped_column(String(40))
    signature_id: Mapped[str] = mapped_column(String(40), nullable=True)
    threat_score: Mapped[float] = mapped_column(Float, default=0.0)
    verification_status: Mapped[str] = mapped_column(String(20), default="VALID")
    nonce: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    alert_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    severity: Mapped[str] = mapped_column(String(20))  # LOW, MEDIUM, HIGH, CRITICAL
    title: Mapped[str] = mapped_column(String(160))
    reason: Mapped[str] = mapped_column(String)
    recommended_action: Mapped[str] = mapped_column(String)
    related_event_id: Mapped[str] = mapped_column(String(40), nullable=True)
    related_key_id: Mapped[str] = mapped_column(String(40), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="OPEN")  # OPEN, ACKNOWLEDGED, RESOLVED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
