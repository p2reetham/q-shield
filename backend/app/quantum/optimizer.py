"""
Quantum-inspired optimizer: simulated annealing over the QUBO energy surface.

Simulated annealing is the classical algorithm most directly analogous to
quantum annealing (D-Wave style) -- both search a QUBO energy landscape by
allowing uphill moves that are gradually suppressed as an artificial
"temperature" cools, and simulated annealing is commonly used as a classical
stand-in / benchmark for quantum annealers. This module runs entirely on
classical hardware and does NOT require or simulate quantum hardware.
"""
from __future__ import annotations
import time
import numpy as np

from app.quantum.qubo import build_qubo, qubo_energy, SECURITY_FEATURE_NAMES


def simulated_annealing_qubo(
    n_features: int,
    target_k: int,
    iterations: int = 500,
    seed: int | None = None,
) -> dict:
    rng = np.random.default_rng(seed)
    Q, relevance, redundancy = build_qubo(n_features, target_k, seed=seed)

    start = time.perf_counter()

    # Random initial bitstring with roughly target_k ones
    x = np.zeros(n_features, dtype=int)
    init_idx = rng.choice(n_features, size=target_k, replace=False)
    x[init_idx] = 1

    best_x = x.copy()
    best_energy = qubo_energy(x, Q)
    current_energy = best_energy

    t0, t_min = 4.0, 0.02
    cooling = (t_min / t0) ** (1 / max(iterations, 1))
    temperature = t0

    for _ in range(iterations):
        flip = rng.integers(0, n_features)
        x_new = x.copy()
        x_new[flip] = 1 - x_new[flip]
        new_energy = qubo_energy(x_new, Q)

        delta = new_energy - current_energy
        if delta < 0 or rng.random() < np.exp(-delta / max(temperature, 1e-6)):
            x = x_new
            current_energy = new_energy
            if current_energy < best_energy:
                best_energy = current_energy
                best_x = x.copy()

        temperature *= cooling

    elapsed = time.perf_counter() - start

    # Normalize energy into a 0..1 "objective score" (higher = better) for UI display
    worst_possible = float(np.abs(Q).sum())
    normalized = 0.0 if worst_possible == 0 else 1.0 - (best_energy + worst_possible) / (2 * worst_possible)
    objective_score = float(np.clip(normalized, 0.0, 1.0))

    selected_idx = [i for i, v in enumerate(best_x) if v == 1]
    names = SECURITY_FEATURE_NAMES[:n_features] if n_features <= len(SECURITY_FEATURE_NAMES) else (
        SECURITY_FEATURE_NAMES + [f"feature_{i}" for i in range(len(SECURITY_FEATURE_NAMES), n_features)]
    )
    selected_names = [names[i] for i in selected_idx]

    # Feature weight vector derived from selection + relevance, used to weight
    # the rule-based threat score ("quantum_weighted_score")
    weights = np.zeros(n_features)
    weights[selected_idx] = relevance[selected_idx]
    if weights.sum() > 0:
        weights = weights / weights.sum()

    return {
        "features_evaluated": n_features,
        "features_selected": len(selected_idx),
        "selected_feature_names": selected_names,
        "selected_indices": selected_idx,
        "weights": weights.tolist(),
        "optimization_iterations": iterations,
        "best_objective_score": round(objective_score, 3),
        "optimization_time_sec": round(elapsed, 3),
        "method": "Simulated Annealing over a QUBO formulation (quantum-inspired, classical hardware)",
        "disclaimer": (
            "This module uses quantum-inspired optimization techniques executed on "
            "classical hardware. It does not require a quantum computer."
        ),
    }
