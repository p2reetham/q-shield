"""Tests for the QUBO-based quantum-inspired optimizer."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.quantum.optimizer import simulated_annealing_qubo
from app.quantum.qubo import build_qubo, qubo_energy, SECURITY_FEATURE_NAMES


def test_build_qubo_shape():
    Q, relevance, redundancy = build_qubo(n_features=18, target_k=8, seed=1)
    assert Q.shape == (18, 18)
    assert len(relevance) == 18


def test_optimizer_selects_target_cardinality_roughly():
    result = simulated_annealing_qubo(n_features=18, target_k=8, iterations=300, seed=1)
    assert result["features_evaluated"] == 18
    # Simulated annealing with a soft penalty won't always hit k exactly, but should be close
    assert abs(result["features_selected"] - 8) <= 4


def test_optimizer_is_deterministic_with_seed():
    r1 = simulated_annealing_qubo(n_features=10, target_k=4, iterations=100, seed=42)
    r2 = simulated_annealing_qubo(n_features=10, target_k=4, iterations=100, seed=42)
    assert r1["best_objective_score"] == r2["best_objective_score"]
    assert r1["selected_feature_names"] == r2["selected_feature_names"]


def test_selected_features_are_named_from_security_feature_list():
    result = simulated_annealing_qubo(n_features=18, target_k=8, iterations=200, seed=7)
    for name in result["selected_feature_names"]:
        assert name in SECURITY_FEATURE_NAMES
