"""
QUBO (Quadratic Unconstrained Binary Optimization) problem construction for
security-feature selection.

We model feature selection as: choose a binary vector x in {0,1}^n (1 = feature
selected) that maximizes relevance while minimizing redundancy between selected
features -- the classic "max relevance, min redundancy" formulation used in
quantum and quantum-inspired feature-selection literature.

QUBO objective (we MINIMIZE this, so relevance terms are negated):
    H(x) = -sum_i  relevance_i * x_i
           + sum_{i<j} redundancy_ij * x_i * x_j
           + penalty * (sum_i x_i - k_target)^2      [soft cardinality constraint]

This is expressed as an upper-triangular matrix Q such that H(x) = x^T Q x,
which is the standard form solved by quantum annealers (e.g. D-Wave) and by
the classical simulated-annealing solver used here.
"""
from __future__ import annotations
import numpy as np


SECURITY_FEATURE_NAMES = [
    "signing_frequency",
    "timestamp_pattern_deviation",
    "key_age_days",
    "failed_attempt_count",
    "transaction_frequency",
    "device_fingerprint_change",
    "session_reuse_count",
    "historical_behavior_delta",
    "signature_verification_failures",
    "replay_indicator_score",
    "transaction_value_zscore",
    "ip_geo_anomaly",
    "hour_of_day_anomaly",
    "key_usage_burst_rate",
    "signature_entropy_score",
    "session_duration_anomaly",
    "cross_key_correlation",
    "endpoint_sensitivity_weight",
]


def build_qubo(n_features: int, target_k: int, seed: int | None = None) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Build a QUBO matrix for selecting `target_k` out of `n_features` security
    features. Relevance and redundancy are derived from a seeded synthetic
    correlation structure standing in for a real feature-importance /
    covariance analysis (documented as a demo simplification).

    Returns (Q, relevance, redundancy) where Q is an (n, n) upper-triangular
    numpy array such that x^T Q x gives the QUBO energy for binary vector x.
    """
    rng = np.random.default_rng(seed)
    relevance = rng.uniform(0.3, 1.0, size=n_features)
    # Symmetric redundancy matrix in [0, 0.6], zero diagonal
    raw = rng.uniform(0.0, 0.6, size=(n_features, n_features))
    redundancy = (raw + raw.T) / 2
    np.fill_diagonal(redundancy, 0.0)

    penalty = 2.5  # cardinality-constraint weight

    Q = np.zeros((n_features, n_features))
    for i in range(n_features):
        # Linear (diagonal) term: -relevance_i + penalty*(1 - 2*target_k)
        Q[i, i] += -relevance[i] + penalty * (1 - 2 * target_k)
        for j in range(i + 1, n_features):
            # Quadratic term: redundancy + penalty (from expanding the square)
            Q[i, j] += redundancy[i, j] + 2 * penalty

    return Q, relevance, redundancy


def qubo_energy(x: np.ndarray, Q: np.ndarray) -> float:
    x = x.astype(float)
    return float(x @ np.triu(Q) @ x)
