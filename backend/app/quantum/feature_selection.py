"""
Thin convenience wrapper mapping the quantum-inspired optimizer output onto
the concrete threat-scoring features used elsewhere in the app.
"""
from app.quantum.optimizer import simulated_annealing_qubo
from app.quantum.qubo import SECURITY_FEATURE_NAMES


def run_feature_selection(n_features: int = 18, iterations: int = 500, seed: int | None = None) -> dict:
    target_k = max(3, round(n_features * 0.45))
    return simulated_annealing_qubo(n_features=n_features, target_k=target_k, iterations=iterations, seed=seed)


def default_feature_names() -> list[str]:
    return list(SECURITY_FEATURE_NAMES)
