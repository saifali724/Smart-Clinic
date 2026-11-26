"""
MediScan AI — diagnosis service (Python, port 5002)

  GET  /health     → is the model loaded?
  GET  /symptoms   → the 132 symptoms the model understands (used to guide Gemini)
  POST /analyze    → symptoms + vitals + history  →  diagnoses (calibrated %), SHAP reasons,
                     vital-sign findings and the 4 "real-time insights" lines

Run:  python -m uvicorn main:app --port 5002      (or double-click run.bat)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predictor import DiagnosisModel
from rules import build_insights, evaluate_vitals

app = FastAPI(title="MediScan AI — Diagnosis Service", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_methods=["*"],
    allow_headers=["*"],
)

model = DiagnosisModel()


class AnalyzeRequest(BaseModel):
    symptoms: List[str] = Field(default_factory=list, description="symptom keys from /symptoms")
    vitals: Dict[str, Any] = Field(default_factory=dict, description="same shape as patients/{id}/vitals/live")
    compliance: Optional[str] = Field(None, description='"confirmed" | "missed" | null')
    previousDiagnoses: List[str] = Field(default_factory=list)
    previousVisitDate: Optional[str] = None


@app.get("/health")
def health():
    return {
        "success": True,
        "model": "XGBoost (temperature-calibrated) + TreeSHAP",
        "version": model.meta.get("version"),
        "diseases": len(model.diseases),
        "symptoms": len(model.keys),
        "evaluation": model.meta.get("evaluation", {}).get("xgboost"),
    }


@app.get("/symptoms")
def symptoms():
    return {"success": True, "symptoms": [{"key": s["key"], "label": s["label"]} for s in model.symptoms]}


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    findings, sensor_symptoms = evaluate_vitals(req.vitals)

    conversation = [s for s in dict.fromkeys(req.symptoms) if s in model.index]
    from_sensors = [s for s in sensor_symptoms if s not in conversation]
    all_symptoms = conversation + from_sensors

    diagnoses = model.predict(all_symptoms) if len(all_symptoms) >= 1 else []
    # hide suggestions below 1 % (always keep the leading one)
    diagnoses = [d for i, d in enumerate(diagnoses) if i == 0 or d["probability"] >= 1.0]
    insights = build_insights(findings, diagnoses, req.compliance, req.previousDiagnoses, req.previousVisitDate)

    return {
        "success": True,
        "usedSymptoms": (
            [{"key": s, "label": model.labels[s], "source": "conversation"} for s in conversation]
            + [{"key": s, "label": model.labels[s], "source": "sensor"} for s in from_sensors]
        ),
        "diagnoses": diagnoses,
        "vitalFindings": findings,
        "insights": insights,
        "evidence": len(all_symptoms),
        "modelVersion": model.meta.get("version"),
    }
