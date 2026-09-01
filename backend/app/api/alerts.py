from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models
from app.schemas.schemas import AlertOut

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=List[AlertOut])
def list_alerts(db: Session = Depends(get_db)):
    return db.query(models.Alert).order_by(models.Alert.created_at.desc()).all()


@router.post("/{alert_id}/acknowledge", response_model=AlertOut)
def acknowledge(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.status = "ACKNOWLEDGED"
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/{alert_id}/resolve", response_model=AlertOut)
def resolve(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.status = "RESOLVED"
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
