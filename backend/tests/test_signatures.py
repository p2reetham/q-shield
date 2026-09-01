"""Tests for the digital-signature module (key generation, signing, verification)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base
from app.database import models  # noqa: F401
from app.services import signature_service


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_generate_key(db):
    key = signature_service.create_key(db, label="test")
    assert key.key_id.startswith("KEY-")
    assert key.status == "ACTIVE"
    assert "BEGIN PUBLIC KEY" in key.public_key_pem


def test_sign_and_verify_roundtrip(db):
    key = signature_service.create_key(db)
    sig = signature_service.sign_document(db, key.key_id, "hello world", "sess1")
    assert sig.signature_id.startswith("SIG-")

    ok, _ = signature_service.verify_signature(db, key.key_id, "hello world", sig.signature_hex)
    assert ok is True


def test_verify_rejects_tampered_content(db):
    key = signature_service.create_key(db)
    sig = signature_service.sign_document(db, key.key_id, "original content", "sess1")

    ok, reason = signature_service.verify_signature(db, key.key_id, "tampered content", sig.signature_hex)
    assert ok is False


def test_revoked_key_cannot_sign(db):
    key = signature_service.create_key(db)
    key.status = "REVOKED"
    db.add(key)
    db.commit()

    with pytest.raises(ValueError):
        signature_service.sign_document(db, key.key_id, "content", "sess1")
