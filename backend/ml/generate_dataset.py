"""
Synthetic cybersecurity dataset generator for Q-SHIELD's demo ML pipeline.

IMPORTANT: This data is SYNTHETIC / DEMO data, generated with documented
distributions below -- it is not real signing telemetry. It exists so the
anomaly-detection model has something concrete to train on for the SIH
prototype. Production use would require replacing this with real, labeled
signing-event data.

Run: python ml/generate_dataset.py
Writes: data/sample_security_events.csv (relative to project root)
"""
import numpy as np
import pandas as pd
from pathlib import Path

FEATURES = [
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


def generate(n_normal: int = 1400, n_anomalous: int = 200, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    normal = rng.normal(loc=0.25, scale=0.12, size=(n_normal, len(FEATURES)))
    normal = np.clip(normal, 0, 1)

    anomalous = rng.normal(loc=0.72, scale=0.18, size=(n_anomalous, len(FEATURES)))
    # Push a few features (replay + failed attempts + burst rate) even higher for anomalies
    anomalous[:, FEATURES.index("replay_indicator_score")] = rng.uniform(0.6, 1.0, n_anomalous)
    anomalous[:, FEATURES.index("failed_attempt_count")] = rng.uniform(0.5, 1.0, n_anomalous)
    anomalous[:, FEATURES.index("key_usage_burst_rate")] = rng.uniform(0.55, 1.0, n_anomalous)
    anomalous = np.clip(anomalous, 0, 1)

    X = np.vstack([normal, anomalous])
    y = np.array([0] * n_normal + [1] * n_anomalous)  # 1 = anomalous

    df = pd.DataFrame(X, columns=FEATURES)
    df["label"] = y
    df = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    return df


if __name__ == "__main__":
    df = generate()
    out_path = Path(__file__).resolve().parents[2] / "data" / "sample_security_events.csv"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} synthetic rows to {out_path}")
