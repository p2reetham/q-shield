# Quantum-Inspired Approach

## What "quantum-inspired" means here

Q-SHIELD does **not** run on a quantum computer and does not simulate quantum
circuits. It uses a **QUBO (Quadratic Unconstrained Binary Optimization)**
formulation — the same mathematical form used by real quantum annealers (e.g.
D-Wave) and QAOA — and solves it with **simulated annealing**, a classical
algorithm that searches the same kind of energy landscape by allowing
temperature-controlled uphill moves. This is the standard classical stand-in
for, and benchmark against, quantum annealing.

## The optimization problem

Security-feature selection is framed as: choose a binary vector `x ∈ {0,1}^18`
(one bit per candidate signing-behavior feature) that **maximizes relevance**
to threat detection while **minimizing redundancy** between selected features,
subject to a soft cardinality constraint (roughly 8 of 18 features selected).

```
H(x) = -Σ relevance_i · x_i  +  Σ redundancy_ij · x_i · x_j  +  penalty · (Σx_i - k)²
```

This is expressed as an upper-triangular QUBO matrix `Q` such that
`H(x) = xᵀQx`, exactly the form a quantum annealer would accept as a problem
definition. See `backend/app/quantum/qubo.py`.

## The solver

`backend/app/quantum/optimizer.py` implements simulated annealing over this
QUBO: starting from a random feasible bitstring, it repeatedly flips one bit,
accepts improving moves always and worsening moves with probability
`exp(-Δ/T)`, and cools `T` geometrically over the configured number of
iterations. The result is the best bitstring found, converted into a
0–1 "objective score" for the UI, plus a normalized weight vector used to
re-weight the threat-scoring feature vector (`quantum_weighted_score` in the
threat engine).

## Why this is a legitimate (if simplified) demonstration

- It solves a real combinatorial optimization problem (feature selection with
  redundancy tradeoffs), not a fake progress bar.
- It uses the exact QUBO formulation quantum hardware would consume, so the
  same problem definition could in principle be submitted to a quantum
  annealer without reformulation.
- Its output is *used*, not just displayed: the selected features and their
  weights measurably change the final threat score.

## What it is not

- Not a quantum circuit simulation (no qubits, no superposition, no
  entanglement are modeled).
- Not a claim of "quantum speedup" — simulated annealing here runs in
  milliseconds on classical hardware because the problem size (≤18 binary
  variables) is intentionally small enough to demo live.
