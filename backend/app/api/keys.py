from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models
from app.schemas.schemas import KeyOut, KeyGenerateRequest
from app.services.signature_service import create_key

router = APIRouter(prefix="/api/keys", tags=["keys"])


@router.get("", response_model=List[KeyOut])
def list_keys(db: Session = Depends(get_db)):
    return db.query(models.Key).order_by(models.Key.created_at.desc()).all()


@router.post("/generate", response_model=KeyOut)
def generate_key(req: KeyGenerateRequest, db: Session = Depends(get_db)):
    return create_key(db, label=req.label)


@router.post("/{key_id}/rotate", response_model=KeyOut)
def rotate_key(key_id: str, db: Session = Depends(get_db)):
    old = db.query(models.Key).filter(models.Key.key_id == key_id).first()
    if not old:
        raise HTTPException(404, "Key not found")
    old.status = "REVOKED"
    db.add(old)
    new_key = create_key(db, label=f"Rotated from {key_id}")
    return new_key


@router.post("/{key_id}/revoke", response_model=KeyOut)
def revoke_key(key_id: str, db: Session = Depends(get_db)):
    key = db.query(models.Key).filter(models.Key.key_id == key_id).first()
    if not key:
        raise HTTPException(404, "Key not found")
    key.status = "REVOKED"
    db.add(key)
    db.commit()
    db.refresh(key)
    return key


@router.get("/{key_id}/history")
def key_history(key_id: str, db: Session = Depends(get_db)):
    sigs = db.query(models.Signature).filter(models.Signature.key_id == key_id).order_by(
        models.Signature.created_at.desc()
    ).all()
    return [
        {
            "signature_id": s.signature_id,
            "document_hash": s.document_hash,
            "verification_status": s.verification_status,
            "created_at": s.created_at,
        }
        for s in sigs
    ]
