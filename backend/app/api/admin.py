"""Admin-only endpoints for Q-SHIELD demo management."""

from fastapi import APIRouter, Header, HTTPException

from app.core.config import settings
from app.database.database import Base, engine
from app.database import models

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.post("/reset")
def reset_demo_data(
    x_admin_reset_key: str | None = Header(default=None),
):
    """Delete all Q-SHIELD demo data and recreate the database tables."""

    if not settings.admin_reset_key:
        raise HTTPException(
            status_code=503,
            detail="Admin reset is not configured",
        )

    if x_admin_reset_key != settings.admin_reset_key:
        raise HTTPException(
            status_code=403,
            detail="Invalid admin reset key",
        )

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    return {
        "status": "ok",
        "message": "Q-SHIELD demo data has been reset",
    }
