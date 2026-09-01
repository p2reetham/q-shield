"""Business logic for key generation, signing, and verification."""
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import models
from app.core.security import generate_rsa_keypair, sign_bytes, verify_bytes, sha256_hex, new_id


def create_key(db: Session, label: str | None = None) -> models.Key:
    private_pem, public_pem = generate_rsa_keypair()
    key = models.Key(
        key_id=new_id("KEY"),
        algorithm="RSA-2048 (PSS/SHA-256)",
        public_key_pem=public_pem,
        private_key_pem=private_pem,
        status="ACTIVE",
        risk_level="LOW",
        signature_count=0,
    )
    db.add(key)
    db.commit()
    db.refresh(key)
    return key


def sign_document(db: Session, key_id: str, content: str, session_id: str | None) -> models.Signature:
    key = db.query(models.Key).filter(models.Key.key_id == key_id).first()
    if key is None:
        raise ValueError("Key not found")
    if key.status in ("REVOKED", "COMPROMISED"):
        raise ValueError(f"Key is {key.status} and cannot be used to sign")

    payload = content.encode("utf-8")
    doc_hash = sha256_hex(payload)
    signature_hex = sign_bytes(key.private_key_pem, payload)

    sig = models.Signature(
        signature_id=new_id("SIG"),
        key_id=key_id,
        document_hash=doc_hash,
        signature_hex=signature_hex,
        verification_status="VALID",
        session_id=session_id or "",
    )
    db.add(sig)

    key.signature_count += 1
    key.last_used_at = datetime.now(timezone.utc)
    db.add(key)

    db.commit()
    db.refresh(sig)
    return sig


def verify_signature(db: Session, key_id: str, content: str, signature_hex: str) -> tuple[bool, str]:
    key = db.query(models.Key).filter(models.Key.key_id == key_id).first()
    if key is None:
        return False, "Key not found"
    ok = verify_bytes(key.public_key_pem, content.encode("utf-8"), signature_hex)
    if not ok:
        return False, "Signature does not match document/key (INVALID / SUSPICIOUS)"
    return True, "Signature cryptographically verified against the provided document and key"
