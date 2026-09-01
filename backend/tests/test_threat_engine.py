"""Tests for the threat-scoring pipeline and classification bands."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import threat_service


def test_classify_bands():
    assert threat_service.classify(0) == "NORMAL"
    assert threat_service.classify(20) == "NORMAL"
    assert threat_service.classify(35) == "LOW"
    assert threat_service.classify(55) == "MEDIUM"
    assert threat_service.classify(75) == "HIGH"
    assert threat_service.classify(95) == "CRITICAL"


def test_normal_scenario_scores_lower_than_key_compromise():
    normal = threat_service.analyze(**threat_service.SCENARIOS["normal"])
    compromise = threat_service.analyze(**threat_service.SCENARIOS["key_compromise"])
    assert normal["final_score"] < compromise["final_score"]


def test_analyze_returns_all_three_component_scores():
    result = threat_service.analyze(**threat_service.SCENARIOS["suspicious"])
    assert 0 <= result["rule_score"] <= 100
    assert 0 <= result["ml_anomaly_score"] <= 100
    assert 0 <= result["quantum_weighted_score"] <= 100
    assert result["classification"] in ("NORMAL", "LOW", "MEDIUM", "HIGH", "CRITICAL")
