from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models
from app.schemas.schemas import BlockOut, ChainVerifyResponse
from app.services.blockchain_service import verify_chain

router = APIRouter(prefix="/api/blockchain", tags=["blockchain"])


@router.get("", response_model=List[BlockOut])
def list_blocks(db: Session = Depends(get_db)):
    return db.query(models.BlockchainBlock).order_by(models.BlockchainBlock.index.asc()).all()


@router.get("/{block_id}", response_model=BlockOut)
def get_block(block_id: str, db: Session = Depends(get_db)):
    block = db.query(models.BlockchainBlock).filter(models.BlockchainBlock.block_id == block_id).first()
    if not block:
        raise HTTPException(404, "Block not found")
    return block


@router.get("/verify/chain", response_model=ChainVerifyResponse)
def verify(db: Session = Depends(get_db)):
    return verify_chain(db)
