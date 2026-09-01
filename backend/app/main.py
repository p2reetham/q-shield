"""
Q-SHIELD backend entry point.

Wires together the digital-signature module, threat-detection engine,
quantum-inspired optimizer, blockchain ledger, and demo pipeline behind a
single FastAPI app so the frontend can drive an end-to-end SIH demo.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.database import init_db
from app.api import signatures, threats, quantum, blockchain, events, alerts, keys, dashboard

app = FastAPI(
    title="Q-SHIELD API",
    description="Quantum-Inspired Digital Signature Threat Intelligence — backend API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(keys.router)
app.include_router(signatures.router)
app.include_router(threats.router)
app.include_router(quantum.router)
app.include_router(blockchain.router)
app.include_router(events.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Q-SHIELD API", "demo_mode": settings.demo_mode}
