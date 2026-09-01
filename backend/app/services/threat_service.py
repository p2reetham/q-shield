"""
Threat-scoring pipeline. Combines:
  1. A transparent rule-based score (interpretable, always available)
  2. An ML anomaly score from the Isolation Forest model (ml/predict.py)
  3. A quantum-inspired re-weighting derived from the QUBO feature-selection
     module (app/quantum), which decides which features matter most for the
     final blended score.

final_score (0-100) = 100 * blend(rule_score, ml_score, quantum_weighted_score)
"""
from __future__ import annotations
import json
import numpy as np

from app.quantum.feature_selection import run_feature_selection
from ml.predict import predict_anomaly_score
from ml.generate_dataset import FEATURES

SCENARIOS = {
    "normal": dict(signing_frequency_per_hour=2, key_age_days=120, failed_attempts=0,
                   transaction_value=150, is_replay_suspected=False, session_reuse_count=0, hour_of_day=11),
    "suspicious": dict(signing_frequency_per_hour=14, key_age_days=45, failed_attempts=2,
                        transaction_value=4200, is_replay_suspected=False, session_reuse_count=2, hour_of_day=2),
    "replay_attack": dict(signing_frequency_per_hour=22, key_age_days=90, failed_attempts=1,
                           transaction_value=1800, is_replay_suspected=True, session_reuse_count=5, hour_of_day=3),
    "key_compromise": dict(signing_frequency_per_hour=48, key_age_days=3, failed_attempts=6,
                            transaction_value=9800, is_replay_suspected=True, session_reuse_count=7, hour_of_day=4),
    "anomalous_signing": dict(signing_frequency_per_hour=30, key_age_days=200, failed_attempts=0,
                               transaction_value=6600, is_replay_suspected=False, session_reuse_count=1, hour_of_day=1),
    "invalid_signature": dict(signing_frequency_per_hour=5, key_age_days=60, failed_attempts=4,
                               transaction_value=300, is_replay_suspected=False, session_reuse_count=0, hour_of_day=13),
}


def raw_to_normalized_features(
    signing_frequency_per_hour: float,
    key_age_days: float,
    failed_attempts: int,
    transaction_value: float,
    is_replay_suspected: bool,
    session_reuse_count: int,
    hour_of_day: int,
) -> dict:
    """Map raw signing-activity inputs onto the 18 normalized (0-1) model features."""
    def clip01(v):
        return float(np.clip(v, 0.0, 1.0))

    night_hour = 1.0 if (hour_of_day <= 5 or hour_of_day >= 23) else (0.3 if hour_of_day <= 7 else 0.0)

    features = {
        "signing_frequency": clip01(signing_frequency_per_hour / 40),
        "timestamp_pattern_deviation": clip01(night_hour * 0.7 + (signing_frequency_per_hour / 60)),
        "key_age_days": clip01(1 - (key_age_days / 365)),  # very new or very old keys read as slightly riskier
        "failed_attempt_count": clip01(failed_attempts / 8),
        "transaction_frequency": clip01(signing_frequency_per_hour / 35),
        "device_fingerprint_change": clip01(0.6 if session_reuse_count > 3 else 0.1),
        "session_reuse_count": clip01(session_reuse_count / 8),
        "historical_behavior_delta": clip01((signing_frequency_per_hour / 30) * 0.6 + (failed_attempts / 10) * 0.4),
        "signature_verification_failures": clip01(failed_attempts / 6),
        "replay_indicator_score": 0.95 if is_replay_suspected else 0.05,
        "transaction_value_zscore": clip01(transaction_value / 10000),
        "ip_geo_anomaly": clip01(0.5 if session_reuse_count > 4 else 0.1),
        "hour_of_day_anomaly": clip01(night_hour),
        "key_usage_burst_rate": clip01(signing_frequency_per_hour / 25),
        "signature_entropy_score": clip01(0.2 + (failed_attempts / 10)),
        "session_duration_anomaly": clip01(session_reuse_count / 6),
        "cross_key_correlation": clip01(session_reuse_count / 10),
        "endpoint_sensitivity_weight": clip01(transaction_value / 12000),
    }
    return features


def rule_based_score(features: dict) -> float:
    """Transparent, hand-weighted linear score over the same 18 features (0-1)."""
    weights = {
        "signing_frequency": 0.08, "timestamp_pattern_deviation": 0.06, "key_age_days": 0.03,
        "failed_attempt_count": 0.10, "transaction_frequency": 0.06, "device_fingerprint_change": 0.06,
        "session_reuse_count": 0.06, "historical_behavior_delta": 0.08, "signature_verification_failures": 0.09,
        "replay_indicator_score": 0.14, "transaction_value_zscore": 0.07, "ip_geo_anomaly": 0.05,
        "hour_of_day_anomaly": 0.04, "key_usage_burst_rate": 0.04, "signature_entropy_score": 0.02,
        "session_duration_anomaly": 0.01, "cross_key_correlation": 0.005, "endpoint_sensitivity_weight": 0.005,
    }
    score = sum(features[k] * w for k, w in weights.items())
    return float(np.clip(score, 0.0, 1.0))


def classify(score_0_100: float) -> str:
    if score_0_100 <= 20:
        return "NORMAL"
    if score_0_100 <= 40:
        return "LOW"
    if score_0_100 <= 60:
        return "MEDIUM"
    if score_0_100 <= 80:
        return "HIGH"
    return "CRITICAL"


def analyze(
    signing_frequency_per_hour: float,
    key_age_days: float,
    failed_attempts: int,
    transaction_value: float,
    is_replay_suspected: bool,
    session_reuse_count: int,
    hour_of_day: int,
    quantum_iterations: int = 150,
) -> dict:
    features = raw_to_normalized_features(
        signing_frequency_per_hour, key_age_days, failed_attempts,
        transaction_value, is_replay_suspected, session_reuse_count, hour_of_day,
    )

    rule = rule_based_score(features)
    ml = predict_anomaly_score(features)

    q = run_feature_selection(n_features=len(FEATURES), iterations=quantum_iterations)
    weights = np.array(q["weights"])
    feature_vals = np.array([features[f] for f in FEATURES])
    quantum_weighted = float(np.clip((feature_vals * weights).sum(), 0.0, 1.0))

    # Blend: rule (interpretable baseline), ML (learned anomaly signal),
    # quantum-weighted (feature-selection-informed emphasis)
    blended = 0.35 * rule + 0.40 * ml + 0.25 * quantum_weighted
    final_score_100 = round(float(np.clip(blended, 0, 1)) * 100, 1)

    return {
        "features": features,
        "rule_score": round(rule * 100, 1),
        "ml_anomaly_score": round(ml * 100, 1),
        "quantum_weighted_score": round(quantum_weighted * 100, 1),
        "final_score": final_score_100,
        "classification": classify(final_score_100),
        "features_json": json.dumps(features),
    }
