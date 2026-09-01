from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models
from app.schemas.schemas import SignRequest, SignResponse, VerifyRequest, VerifyResponse, SignatureOut
from app.services.signature_service import sign_document, verify_signature
from app.services.blockchain_service import add_block
from app.core.security import new_id, random_session_id

router = APIRouter(prefix="/api", tags=["signatures"])


@router.post("/sign", response_model=SignResponse)
def sign(req: SignRequest, db: Session = Depends(get_db)):
    try:
        sig = sign_document(db, req.key_id, req.content, req.session_id or random_session_id())
    except ValueError as e:
        raise HTTPException(400, str(e))

    add_block(
        db, event_type="SIGNATURE_CREATED", transaction_id=new_id("TXN"),
        signature_id=sig.signature_id, threat_score=0.0, verification_status="VALID",
    )

    return SignResponse(
        signature_id=sig.signature_id, document_hash=sig.document_hash,
        signature_hex=sig.signature_hex, key_id=sig.key_id,
        timestamp=sig.created_at, verification_status=sig.verification_status,
    )


@router.post("/verify", response_model=VerifyResponse)
def verify(req: VerifyRequest, db: Session = Depends(get_db)):
    sig = None
    if req.signature_id:
        sig = db.query(models.Signature).filter(models.Signature.signature_id == req.signature_id).first()
        if not sig:
            raise HTTPException(404, "Signature not found")
        # Looking up by signature_id returns the stored record's verification status;
        # the original document content isn't stored server-side (only its hash), so
        # a fresh cryptographic re-verification requires content + key_id + signature_hex.
        return VerifyResponse(valid=sig.verification_status == "VALID", verification_status=sig.verification_status,
                               reason="Signature record located; showing its stored verification status.")

    if not (req.key_id and req.content and req.signature_hex):
        raise HTTPException(400, "Provide either signature_id, or key_id + content + signature_hex")

    ok, reason = verify_signature(db, req.key_id, req.content, req.signature_hex)
    return VerifyResponse(valid=ok, verification_status="VALID" if ok else "INVALID", reason=reason)


@router.get("/signatures", response_model=List[SignatureOut])
def list_signatures(db: Session = Depends(get_db)):
    return db.query(models.Signature).order_by(models.Signature.created_at.desc()).limit(200).all()
