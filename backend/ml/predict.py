"""
Prediction API used by the FastAPI threat-detection endpoint.

Loads the trained IsolationForest + scaler (falling back to a deterministic
rule-based estimate if models haven't been trained yet, so the API never
hard-fails in a fresh checkout) and returns a 0-1 anomaly score.
"""
from pathlib import Path
import numpy as np
import joblib

from ml.generate_dataset import FEATURES

MODELS_DIR = Path(__file__).resolve().parent / "models"

_iso = None
_scaler = None


def _load():
    global _iso, _scaler
    if _iso is None or _scaler is None:
        iso_path = MODELS_DIR / "isolation_forest.joblib"
        scaler_path = MODELS_DIR / "scaler.joblib"
        if iso_path.exists() and scaler_path.exists():
            _iso = joblib.load(iso_path)
            _scaler = joblib.load(scaler_path)
    return _iso, _scaler


def predict_anomaly_score(feature_dict: dict) -> float:
    """Returns an anomaly score in [0, 1], higher = more anomalous."""
    x = np.array([[feature_dict.get(f, 0.0) for f in FEATURES]])
    iso, scaler = _load()

    if iso is not None and scaler is not None:
        x_s = scaler.transform(x)
        # decision_function: higher = more normal. Convert & clip to 0..1 anomaly score.
        raw = iso.decision_function(x_s)[0]
        score = 1.0 / (1.0 + np.exp(6 * raw))  # sigmoid squashing, inverted
        return float(np.clip(score, 0.0, 1.0))

    # Fallback (models not trained yet): simple weighted-average heuristic,
    # clearly documented as a fallback rather than a trained model output.
    weights = np.linspace(1.0, 0.6, num=len(FEATURES))
    vals = np.array([feature_dict.get(f, 0.0) for f in FEATURES])
    score = float(np.clip((vals * weights).sum() / weights.sum(), 0.0, 1.0))
    return score
