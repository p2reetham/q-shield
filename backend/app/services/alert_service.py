"""Generates security alerts from threat-analysis results."""
from sqlalchemy.orm import Session

from app.database import models
from app.core.security import new_id

RECOMMENDATIONS = {
    "CRITICAL": "Temporarily suspend the associated key and initiate key rotation immediately.",
    "HIGH": "Flag the key for review, require step-up verification for further signing.",
    "MEDIUM": "Monitor closely; no automatic action required yet.",
}


def maybe_create_alert(
    db: Session,
    classification: str,
    final_score: float,
    event_id: str,
    key_id: str | None,
    features: dict,
) -> models.Alert | None:
    if classification not in ("HIGH", "CRITICAL"):
        return None

    reasons = []
    if features.get("replay_indicator_score", 0) > 0.5:
        reasons.append("replay indicators detected in recent signing activity")
    if features.get("signing_frequency", 0) > 0.6:
        reasons.append("signing frequency sharply exceeds historical baseline")
    if features.get("failed_attempt_count", 0) > 0.4:
        reasons.append("elevated failed verification attempts")
    if not reasons:
        reasons.append("composite threat score crossed the high-risk threshold")

    title = (
        "Potential signing-key compromise detected"
        if classification == "CRITICAL"
        else "Elevated signing risk detected"
    )

    alert = models.Alert(
        alert_id=new_id("ALT"),
        severity=classification,
        title=title,
        reason="; ".join(reasons) + f" (threat score {final_score}/100).",
        recommended_action=RECOMMENDATIONS.get(classification, "Review the event."),
        related_event_id=event_id,
        related_key_id=key_id,
        status="OPEN",
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
