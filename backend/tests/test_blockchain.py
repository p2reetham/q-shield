"""Tests for the blockchain hash-chain ledger."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base
from app.database import models  # noqa: F401
from app.services import blockchain_service


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_genesis_block_links_to_zero_hash(db):
    block = blockchain_service.add_block(db, "SIGNATURE_CREATED", "TXN-1", "SIG-1", 0.0, "VALID")
    assert block.index == 0
    assert block.previous_hash == "0" * 64


def test_chain_links_correctly(db):
    b1 = blockchain_service.add_block(db, "SIGNATURE_CREATED", "TXN-1", "SIG-1", 0.0, "VALID")
    b2 = blockchain_service.add_block(db, "THREAT_ANALYSIS", "TXN-2", None, 82.0, "SUSPICIOUS")
    assert b2.previous_hash == b1.current_hash


def test_verify_chain_reports_no_inconsistencies(db):
    blockchain_service.add_block(db, "SIGNATURE_CREATED", "TXN-1", "SIG-1", 0.0, "VALID")
    blockchain_service.add_block(db, "THREAT_ANALYSIS", "TXN-2", None, 82.0, "SUSPICIOUS")
    result = blockchain_service.verify_chain(db)
    assert result["verified"] is True
    assert result["inconsistencies"] == 0


def test_tampering_previous_hash_is_detected(db):
    blockchain_service.add_block(db, "SIGNATURE_CREATED", "TXN-1", "SIG-1", 0.0, "VALID")
    b2 = blockchain_service.add_block(db, "THREAT_ANALYSIS", "TXN-2", None, 82.0, "SUSPICIOUS")
    b2.previous_hash = "f" * 64
    db.add(b2)
    db.commit()

    result = blockchain_service.verify_chain(db)
    assert result["verified"] is False
    assert result["inconsistencies"] >= 1
