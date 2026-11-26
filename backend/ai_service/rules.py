"""
rules.py — vital-sign rules (deterministic, guideline-based).

Each rule turns a sensor reading into
  • a finding the doctor sees ("Elevated BP — Stage 2 hypertension range"), and
  • optionally a symptom the diagnosis model understands (e.g. temperature 101 °F → "mild_fever").

Thresholds:
  Blood pressure  — 2017 ACC/AHA adult BP categories
  SpO2            — < 90 % severe, 90–94 % low
  Heart rate      — adult resting 60–100 bpm
  Temperature     — fever ≥ 100.4 °F, high fever ≥ 103 °F
  Glucose (random)— ≥ 200 mg/dL consistent with diabetes (confirm with HbA1c / fasting), < 70 hypoglycaemia
  BMI             — WHO adult categories
These are screening rules for decision support, not a diagnosis.
"""

from __future__ import annotations


def _num(value):
    try:
        n = float(value)
        return n if n == n else None  # NaN check
    except (TypeError, ValueError):
        return None


def _reading(vitals: dict, key: str, field: str = "value"):
    item = (vitals or {}).get(key)
    if isinstance(item, dict):
        return _num(item.get(field))
    if field == "value":
        return _num(item)
    return None


def evaluate_vitals(vitals: dict) -> tuple[list[dict], list[str]]:
    """Returns (findings, derived_symptom_keys)."""
    findings: list[dict] = []
    derived: list[str] = []

    def add(level, title, detail, symptom=None):
        findings.append({"level": level, "title": title, "detail": detail, "symptom": symptom})
        if symptom and symptom not in derived:
            derived.append(symptom)

    # ── blood pressure ────────────────────────────────────────────
    sys_bp = _reading(vitals, "bloodPressure", "systolic")
    dia_bp = _reading(vitals, "bloodPressure", "diastolic")
    if sys_bp is not None and dia_bp is not None:
        bp = f"{int(sys_bp)}/{int(dia_bp)}"
        if sys_bp > 180 or dia_bp > 120:
            add("critical", f"BP {bp} — hypertensive crisis range", "Recheck now; assess for organ damage.")
        elif sys_bp >= 140 or dia_bp >= 90:
            add("warning", f"Elevated BP ({bp}) — Stage 2 hypertension range", "Consider adjusting antihypertensive therapy.")
        elif sys_bp >= 130 or dia_bp >= 80:
            add("warning", f"Elevated BP ({bp}) — Stage 1 hypertension range", "Repeat reading; lifestyle advice.")
        elif sys_bp >= 120:
            add("info", f"BP {bp} — elevated", "Monitor.")
        elif sys_bp < 90 or dia_bp < 60:
            add("warning", f"Low BP ({bp})", "Check for dizziness, dehydration or medication effect.")
        else:
            add("ok", f"BP {bp} — normal", "")

    # ── oxygen saturation ────────────────────────────────────────
    spo2 = _reading(vitals, "spo2")
    if spo2 is not None:
        if spo2 < 90:
            add("critical", f"SpO₂ {spo2:.0f}% — severe hypoxaemia", "Urgent oxygen assessment.", "breathlessness")
        elif spo2 < 95:
            add("warning", f"SpO₂ {spo2:.0f}% — below normal", "Check respiratory status.", "breathlessness")

    # ── heart rate ───────────────────────────────────────────────
    hr = _reading(vitals, "heartRate")
    if hr is not None:
        if hr > 120:
            add("critical", f"Heart rate {hr:.0f} bpm — marked tachycardia", "ECG recommended.", "fast_heart_rate")
        elif hr > 100:
            add("warning", f"Heart rate {hr:.0f} bpm — tachycardia", "Consider ECG.", "fast_heart_rate")
        elif hr < 50:
            add("warning", f"Heart rate {hr:.0f} bpm — bradycardia", "Review medications; consider ECG.")

    # ── temperature (°F) ─────────────────────────────────────────
    temp = _reading(vitals, "temperature")
    if temp is not None:
        if temp >= 103:
            add("warning", f"Temperature {temp:.1f}°F — high fever", "Look for infective cause.", "high_fever")
        elif temp >= 100.4:
            add("warning", f"Temperature {temp:.1f}°F — fever", "Look for infective cause.", "mild_fever")
        elif temp < 95:
            add("critical", f"Temperature {temp:.1f}°F — hypothermia", "Warm and reassess.")

    # ── blood glucose (random, mg/dL) ────────────────────────────
    glucose = _reading(vitals, "glucose")
    if glucose is not None:
        if glucose >= 200:
            add("warning", f"Glucose {glucose:.0f} mg/dL — high", "Consistent with diabetes; confirm with HbA1c / fasting glucose.", "irregular_sugar_level")
        elif glucose >= 140:
            add("info", f"Glucose {glucose:.0f} mg/dL — above normal", "Consider HbA1c.")
        elif glucose < 70:
            add("warning", f"Glucose {glucose:.0f} mg/dL — low (hypoglycaemia)", "Give fast-acting sugar if symptomatic.", "irregular_sugar_level")

    # ── BMI ──────────────────────────────────────────────────────
    weight = _reading(vitals, "weight")
    height = _reading(vitals, "height")
    if weight and height:
        bmi = weight / (height / 100) ** 2
        if bmi >= 30:
            add("info", f"BMI {bmi:.1f} — obesity", "Weight-management advice.", "obesity")
        elif bmi >= 25:
            add("info", f"BMI {bmi:.1f} — overweight", "Lifestyle advice.")
        elif bmi < 18.5:
            add("info", f"BMI {bmi:.1f} — underweight", "Nutrition review.")

    return findings, derived


# Suggested first investigation for each disease the model knows.
SUGGESTED_TEST = {
    "Heart attack": "urgent ECG and troponin",
    "Hypertension": "ECG and repeat BP",
    "Diabetes": "HbA1c / fasting glucose",
    "Hypoglycemia": "capillary glucose",
    "Dengue": "CBC with platelets and NS1 antigen",
    "Malaria": "malaria smear / rapid test",
    "Typhoid": "blood culture / Typhidot",
    "Tuberculosis": "sputum AFB / GeneXpert and chest X-ray",
    "Pneumonia": "chest X-ray and CBC",
    "Bronchial Asthma": "spirometry / peak flow",
    "Common Cold": "no tests needed usually",
    "Jaundice": "LFTs and bilirubin",
    "Hepatitis A": "LFTs and anti-HAV IgM",
    "Hepatitis B": "LFTs and HBsAg",
    "Hepatitis C": "LFTs and anti-HCV",
    "Hepatitis D": "LFTs and anti-HDV",
    "Hepatitis E": "LFTs and anti-HEV IgM",
    "Alcoholic hepatitis": "LFTs and GGT",
    "Chronic cholestasis": "LFTs and abdominal ultrasound",
    "Hypothyroidism": "TSH and free T4",
    "Hyperthyroidism": "TSH and free T4",
    "Urinary tract infection": "urine R/E and culture",
    "GERD": "trial of PPI; endoscopy if alarm signs",
    "Peptic Ulcer Disease": "H. pylori test",
    "Gastroenteritis": "stool R/E and electrolytes",
    "Migraine": "neurological exam",
    "Paralysis (brain hemorrhage)": "urgent CT brain",
    "Cervical spondylosis": "cervical spine X-ray",
    "Osteoarthritis": "knee / joint X-ray",
    "Arthritis": "RA factor, ESR and joint X-ray",
    "Paroxysmal Positional Vertigo": "Dix–Hallpike test",
    "AIDS": "HIV test with counselling",
    "Allergy": "allergy history / IgE",
    "Drug Reaction": "review current medicines",
    "Chicken pox": "clinical diagnosis",
    "Impetigo": "clinical diagnosis; swab if unsure",
    "Psoriasis": "clinical diagnosis",
    "Acne": "clinical diagnosis",
    "Fungal infection": "KOH skin scraping",
    "Varicose veins": "venous Doppler",
    "Hemorrhoids (Piles)": "proctoscopy",
}


def build_insights(findings, diagnoses, compliance, previous_diagnoses, previous_visit_date):
    """Up to 4 short lines for the 'Real-time AI insights' panel (same order as the Figma design)."""
    insights = []

    # 1. most important vital-sign warning
    alerts = [f for f in findings if f["level"] in ("critical", "warning")]
    if alerts:
        top = alerts[0]
        insights.append({"type": "critical" if top["level"] == "critical" else "warning", "text": top["title"]})

    # 2. suggested test for the leading diagnosis
    if diagnoses:
        lead = diagnoses[0]
        test = SUGGESTED_TEST.get(lead["name"])
        reason = lead["reasons"][0]["label"].lower() if lead.get("reasons") else None
        if test:
            text = f"{reason.capitalize()} flagged — suggest {test}" if reason else f"{lead['name']} suspected — suggest {test}"
            insights.append({"type": "suggestion", "text": text})

    # 3. medication compliance (from the conversation)
    if compliance == "confirmed":
        insights.append({"type": "ok", "text": "Medication compliance confirmed"})
    elif compliance == "missed":
        insights.append({"type": "warning", "text": "Possible missed doses — review compliance"})

    # 4. same problem as last visit?
    if diagnoses and previous_diagnoses:
        prev = {p.strip().lower() for p in previous_diagnoses}
        match = next((d["name"] for d in diagnoses[:2] if d["name"].lower() in prev), None)
        if match:
            when = f" ({previous_visit_date})" if previous_visit_date else ""
            insights.append({"type": "pattern", "text": f"Pattern matches previous visit{when}: {match}"})

    return insights[:4]
