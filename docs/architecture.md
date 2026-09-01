# Q-SHIELD Architecture

## Overview

Q-SHIELD is a single local-first web application with three cooperating layers:

```
React + Vite (frontend)  ──HTTP/JSON──▶  FastAPI (backend)  ──SQLAlchemy──▶  SQLite
                                              │
                                              ├─ Signature service (RSA-PSS sign/verify)
                                              ├─ Threat service (rule + ML + quantum blend)
                                              ├─ Quantum module (QUBO + simulated annealing)
                                              ├─ Blockchain service (SHA-256 hash chain)
                                              └─ Alert service (rule-driven notifications)
```

Every module writes to the same SQLite database and the same blockchain ledger, so
a single signing action is visible end-to-end: a `Sign Document` call creates a
`Signature` row *and* a blockchain block; a `Threat Analyze` call creates a
`SecurityEvent`, a `ThreatAnalysis`, a blockchain block, and (if the score is high
enough) an `Alert`. Nothing on the frontend is a disconnected mock page — every
page calls a real backend endpoint backed by the database.

## Request flow: "Simulate Attack"

1. Frontend calls `POST /api/demo/simulate-attack`.
2. Backend picks a weighted-random scenario (normal / suspicious / replay / key
   compromise / anomalous signing / invalid signature).
3. `threat_service.analyze()` builds the 18-feature vector, computes:
   - a transparent rule-based score,
   - an ML anomaly score from the trained Isolation Forest,
   - a quantum-inspired weighted score from the QUBO/simulated-annealing feature
     selector.
4. The blended score is classified into NORMAL/LOW/MEDIUM/HIGH/CRITICAL.
5. A `SecurityEvent` + `ThreatAnalysis` row is written.
6. A new block is appended to the blockchain ledger, hash-chained to the previous
   block.
7. If HIGH/CRITICAL, an `Alert` is generated with a reason and recommended action.
8. All of the above is returned in one response so the frontend can show the full
   pipeline (event → features → ML → quantum → score → block → alert) in one view.

## Why the blend of rule + ML + quantum-weighted score

- The **rule-based score** is fully interpretable and always available, even
  before any model is trained — useful for judges asking "why did this get
  flagged."
- The **ML score** captures non-linear patterns learned from (synthetic) labeled
  data via an Isolation Forest, and is evaluated with a held-out test split
  (see `docs/quantum_approach.md` and the ML section of the README) so its
  reported accuracy is real.
- The **quantum-weighted score** re-weights the same feature vector using the
  feature-importance weights produced by the QUBO/simulated-annealing optimizer,
  so the "quantum" module has a real, measurable effect on the final score
  rather than being decorative.
