"""
predictor.py — loads the trained XGBoost model (see ml/diagnosis_model.ipynb)
and returns calibrated probabilities + SHAP reasons for each suggested disease.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import xgboost as xgb

MODEL_DIR = Path(__file__).parent / "model"


class DiagnosisModel:
    def __init__(self, model_dir: Path = MODEL_DIR):
        meta = json.loads((model_dir / "model_meta.json").read_text(encoding="utf-8"))
        self.meta = meta
        self.temperature = float(meta["temperature"])
        self.symptoms = meta["symptoms"]                      # [{key, label, severity}]
        self.keys = [s["key"] for s in self.symptoms]
        self.index = {k: i for i, k in enumerate(self.keys)}
        self.labels = {s["key"]: s["label"] for s in self.symptoms}
        self.diseases = meta["diseases"]                      # [{name, description, precautions}]

        # plain Booster: works with XGBoost 2.x and 3.x and needs no scikit-learn
        self.booster = xgb.Booster()
        self.booster.load_model(str(model_dir / "diagnosis_xgb.ubj"))

    def vector(self, symptom_keys):
        x = np.zeros((1, len(self.keys)), dtype=np.float32)
        for k in symptom_keys:
            if k in self.index:
                x[0, self.index[k]] = 1.0
        return x

    def predict(self, symptom_keys, top_k=3, max_reasons=4):
        known = [k for k in dict.fromkeys(symptom_keys) if k in self.index]
        if not known:
            return []

        x = self.vector(known)
        dmatrix = xgb.DMatrix(x)
        margins = np.asarray(self.booster.predict(dmatrix, output_margin=True))[0] / self.temperature
        margins -= margins.max()
        probs = np.exp(margins) / np.exp(margins).sum()

        # TreeSHAP contributions, shape (classes, features + bias)
        contrib = np.asarray(self.booster.predict(dmatrix, pred_contribs=True))
        if contrib.ndim == 3:
            contrib = contrib[0]

        results = []
        for cls in np.argsort(-probs)[:top_k]:
            c = contrib[cls][:-1]
            reasons = [
                {"key": self.keys[j], "label": self.labels[self.keys[j]], "impact": round(float(c[j]), 3)}
                for j in np.argsort(-c)
                if x[0, j] > 0 and c[j] > 0
            ][:max_reasons]
            disease = self.diseases[cls]
            results.append({
                "name": disease["name"],
                "probability": round(float(probs[cls]) * 100, 1),
                "reasons": reasons,
                "description": disease.get("description", ""),
                "precautions": disease.get("precautions", []),
            })
        return results
