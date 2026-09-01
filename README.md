# Q-SHIELD

**Quantum-Inspired Digital Signature Threat Intelligence**

A working prototype built for **SIH26141 — Quantum-Inspired Cyber Threat Detection for Digital Signature Security** (theme: Blockchain & Cybersecurity).

---

## Project Overview

Q-SHIELD is a security operations platform that watches digital-signature
activity, scores it for risk using a blend of rule-based logic, machine
learning, and quantum-inspired optimization, records every event on a local
hash-chained blockchain ledger, and raises alerts when something looks wrong.
It is built to be run and demonstrated locally, end-to-end, with no external
services required.

## Problem Statement

Digital signatures underpin trust in blockchain transactions, but signing keys
can be compromised, replayed, or misused in ways that are hard to catch with
simple rule checks alone. SIH26141 asks for a system that combines AI/ML
anomaly detection with quantum-inspired optimization to strengthen digital
signature security monitoring.

## Proposed Solution

Q-SHIELD scores every signing event with three complementary signals:

1. **Rule-based score** — transparent, always available, easy to explain to a judge.
2. **ML anomaly score** — an Isolation Forest trained on signing-behavior features.
3. **Quantum-weighted score** — feature weights produced by solving a QUBO
   (Quadratic Unconstrained Binary Optimization) feature-selection problem with
   simulated annealing, the classical algorithm most directly analogous to
   quantum annealing.

The blended score drives classification (NORMAL → CRITICAL), blockchain
logging, and alerting — see `docs/architecture.md` for the full request flow.

## Architecture

```
React + Vite (frontend)  ──HTTP/JSON──▶  FastAPI (backend)  ──SQLAlchemy──▶  SQLite
                                              │
                                              ├─ Signature service (RSA-PSS sign/verify)
                                              ├─ Threat service (rule + ML + quantum blend)
                                              ├─ Quantum module (QUBO + simulated annealing)
                                              ├─ Blockchain service (SHA-256 hash chain)
                                              └─ Alert service (rule-driven notifications)
```

Full detail in `docs/architecture.md`.

## Technologies

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Recharts, Lucide icons
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
- **Database:** SQLite
- **ML:** scikit-learn (IsolationForest, RandomForestClassifier), pandas, numpy
- **Quantum-inspired:** NumPy-based QUBO construction + simulated annealing
- **Crypto:** `cryptography` library — RSA-2048 with PSS padding / SHA-256
- **Blockchain:** custom SHA-256 hash-chained ledger (local, not distributed)

## Quantum-Inspired Approach

Feature selection for the threat engine is framed as a QUBO problem — the same
mathematical form quantum annealers accept — and solved classically with
simulated annealing. See `docs/quantum_approach.md` for the full write-up,
including the objective function and why this is a legitimate (if simplified)
demonstration rather than a decorative animation.

> This module uses quantum-inspired optimization techniques executed on
> classical hardware. It does not require a quantum computer.

## AI/ML Approach

`backend/ml/generate_dataset.py` generates a labeled synthetic dataset of
signing-behavior feature vectors. `backend/ml/train_model.py` trains an
Isolation Forest (unsupervised anomaly detector) and a Random Forest
(supervised, for real held-out evaluation metrics), saving both plus a scaler
and a `metrics.json` with accuracy/precision/recall/F1/ROC-AUC computed on a
25% held-out test split. `backend/ml/predict.py` is what the API actually
calls at request time. All metrics are honestly labeled as computed on
**synthetic** demo data — see `docs/threat_model.md`.

## Blockchain Approach

`backend/app/services/blockchain_service.py` implements a genuine SHA-256
hash-chained ledger: every block commits to `index | previous_hash | event
fields | nonce | timestamp`. `GET /api/blockchain/verify/chain` recomputes and
checks every link. This is a **local, single-process ledger**, not a
decentralized network — that distinction is stated explicitly in the UI and
docs.

## Post-Quantum Security

The `/post-quantum` page compares RSA/ECDSA (HIGH quantum risk) against
ML-DSA/SLH-DSA (LOW quantum risk, NIST-standardized) and explains hybrid
classical + post-quantum signing as a migration path — labeled explicitly as
an educational comparison, not a certification.

## Installation

### Prerequisites
- Python 3.11+
- Node.js 20+

### Clone / unzip
```bash
cd q-shield
```

### Backend setup
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python ml/generate_dataset.py   # generate synthetic training data
python ml/train_model.py        # train the anomaly-detection models
cp .env.example .env            # adjust if needed
```

### Frontend setup
```bash
cd frontend
npm install
```

## Running Backend

```bash
cd backend
python run.py
```
Backend runs at `http://localhost:8000`. Interactive API docs: `http://localhost:8000/docs`.

## Running Frontend

```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:5173` (Vite dev server proxies `/api` to
the backend automatically — see `frontend/vite.config.ts`).

## Docker (optional)

```bash
docker-compose up --build
```

## API Documentation

See `docs/api.md` for the full endpoint table, or browse `/docs` on the
running backend.

## Demo Instructions

See `docs/demo_script.md` for a suggested 5-minute walkthrough. Short version:
generate a key → sign a document → verify it (and try tampering with it) →
run a threat-analysis scenario → run the quantum optimizer → check blockchain
integrity → click **Simulate Attack** on the dashboard and watch the whole
pipeline fire → check the resulting alert.

## Tests

```bash
cd backend
pip install pytest
python -m pytest tests/ -q
```
15 tests cover signing/verification (including tamper rejection), the threat
engine's scoring bands, blockchain hash-chain integrity (including tamper
detection), and the quantum-inspired optimizer.

## Screenshots

See `screenshots/` (add captures from your local run before submission).

## Future Scope

- Real post-quantum signature support (ML-DSA / SLH-DSA) alongside RSA-PSS
- Multi-node blockchain replication instead of a single local ledger
- Streaming/real-time event ingestion instead of on-demand analysis
- Model retraining on real (anonymized) signing telemetry
- Role-based access control and multi-tenant key management

## Limitations

- ML metrics are computed on synthetic data, not real-world signing telemetry
- The blockchain is a local simulation, not a decentralized network
- The quantum-inspired module runs on classical hardware; it does not use or
  simulate quantum hardware
- Not intended or certified for production cryptographic use as-is

## SIH Presentation Points

**How the quantum-inspired algorithm works:** feature selection is posed as a
QUBO problem (the same form quantum annealers accept) and solved via
simulated annealing, an energy-landscape search that gradually cools an
acceptance temperature — see `docs/quantum_approach.md`.

**Why this is different from conventional AI cybersecurity systems:** most
systems either use static rules or a single ML model. Q-SHIELD blends three
independent signals (interpretable rules, a trained anomaly detector, and a
quantum-inspired feature-weighting layer) so that no single signal can be
gamed alone, and every decision is auditable on an immutable local ledger.

**Possible SIH judging advantages:**
- End-to-end working prototype — every module actually talks to the others,
  not disconnected mock pages
- Technical honesty built into the product itself (explicit disclaimers where
  simulation is used) rather than only in the pitch
- A real, runnable quantum-inspired optimization (QUBO + simulated annealing),
  not a fake progress bar
- Genuine cryptography (RSA-PSS) and a genuine hash-chained audit trail with a
  working integrity check
- Automated test suite (15 tests) covering the security-critical paths
