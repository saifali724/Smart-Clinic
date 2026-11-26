# Diagnosis model (FYP)

- `diagnosis_model.ipynb` — the full training notebook, already run (all results and charts inside).
- `diagnosis_model.py` — the same code as a plain script.
- `data/` — Disease Symptom Prediction dataset (Pranay Patil, Kaggle; copy from github.com/itachi9604/healthcare-chatbot).
- `reports/` — charts for slides / thesis: model comparison, calibration, robustness, confusion matrix, SHAP.

Running the notebook again re-trains the model and overwrites `../backend/ai_service/model/`.

```
cd D:\smart-clinic\ml
python -m pip install xgboost shap scikit-learn pandas matplotlib scipy jupyter
python -m jupyter notebook diagnosis_model.ipynb
```

## Key results (unseen symptom patterns, incomplete + noisy symptoms)

| Model | Top-1 | Top-3 | Macro F1 | Log loss |
|---|---|---|---|---|
| Naive Bayes | 95.6 % | 99.4 % | 0.957 | 0.137 |
| Logistic Regression | 96.0 % | 99.5 % | 0.962 | 0.162 |
| Random Forest | 94.7 % | 99.0 % | 0.949 | 0.304 |
| **XGBoost (chosen)** | 95.3 % | 99.4 % | 0.955 | 0.142 |

With only 30 % of a disease's symptoms mentioned: top-1 74 %, top-3 90 %.

Why these numbers are honest: the raw dataset has 4,920 rows but only 304 distinct ones, and its
`Testing.csv` is fully contained in `Training.csv` (so naive projects report 100 %). We de-duplicate,
test on symptom patterns the model never saw, and simulate incomplete / noisy symptoms.

Limitation: the dataset is synthetic. Real-world accuracy must be measured on doctor-confirmed
consultations, which the app records (confirmed vs AI-suggested diagnoses in every visit).
