from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.database import models
from app.schemas.schemas import EventOut

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=List[EventOut])
def list_events(
    db: Session = Depends(get_db),
    threat_level: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    limit: int = 200,
):
    q = db.query(models.SecurityEvent)
    if threat_level and threat_level.upper() != "ALL":
        q = q.filter(models.SecurityEvent.threat_level == threat_level.upper())
    if status and status.upper() != "ALL":
        q = q.filter(models.SecurityEvent.status == status.upper())
    if search:
        like = f"%{search}%"
        q = q.filter(
            (models.SecurityEvent.event_id.like(like)) |
            (models.SecurityEvent.event_type.like(like)) |
            (models.SecurityEvent.signature_id.like(like))
        )
    return q.order_by(models.SecurityEvent.created_at.desc()).limit(limit).all()
