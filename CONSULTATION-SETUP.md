# Live Consultation — how to run

The Consultation screen needs **3 things running** at the same time:

| # | What | Folder | Port |
|---|---|---|---|
| 1 | Website (React) | `D:\smart-clinic` | 5173 |
| 2 | Backend (Gemini: CNIC scan, transcript, password reset) | `D:\smart-clinic\backend\node_ocr` | 5001 |
| 3 | **AI diagnosis model (Python)** — new | `D:\smart-clinic\backend\ai_service` | 5002 |

## First time only

Python must be installed (tick **"Add python.exe to PATH"** in the installer).
Check in a terminal:
```
python --version
```
(3.10 or newer)

## Every time — open 3 terminals

**Terminal 1 — AI model (Python)**

Easiest: double-click **`D:\smart-clinic\backend\ai_service\run.bat`**.
It makes its own Python environment the first time (`backend\ai_service\.venv`), installs
everything and starts the model. Keep that window open.

Or by hand (if VS Code shows `(.venv)` at the start of the line, type `deactivate` first):
```
cd D:\smart-clinic\backend\ai_service
py -3 -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 5002
```
Next time only:
```
cd D:\smart-clinic\backend\ai_service
.venv\Scripts\activate
python -m uvicorn main:app --port 5002
```
Check: open http://localhost:5002/health → shows `"success": true`.
The Consultation screen also shows **Backend online / AI model online** before you start.

**Terminal 2 — backend**
```
cd D:\smart-clinic\backend\node_ocr
npm start
```

**Terminal 3 — website**
```
cd D:\smart-clinic
npm run dev
```

## Using it

1. Scan a CNIC (ID Scanner) → Patient Record opens.
2. Press **Start Consultation** (bottom bar).
3. Tick "patient agrees to recording" → **Start Session**. Allow the microphone.
4. Talk. Every ~12 seconds the conversation appears in English, labelled doctor / patient.
5. The right side updates by itself: detected symptoms, suggested diagnoses with ICD-10 codes and %,
   red flags, "Ask next" questions and tests to confirm.
6. Tap a diagnosis → **Confirm / Edit / Remove**.
   - **Edit**: search any of ~10,000 WHO ICD-10 diseases (name or code, e.g. "typhoid", "A01"),
     pick the right one, fix the name → Save. It is confirmed straight away.
   - **+ Add diagnosis**: add one the AI didn't suggest.
   - The tick on a card is a quick Confirm.
7. **Generate Prescription** works once at least one diagnosis is confirmed (the Prescription screen is next).
8. **End Session** → everything is saved in the visit and you go back to the Patient Record.
   Confirmed diagnoses become the patient's badges next time. Removed / edited AI suggestions are
   saved too (`rejectedAiDiagnoses`) — that is how you measure the AI's real accuracy for the thesis.

## 2 microphones (recommended)

Doctor and patient each wear their own **collar (lapel) USB mic**. The speaker label then comes from
the microphone, not from the AI:

1. Plug in both mics.
2. On the start card choose **2 microphones** → (first time) **Allow microphones to list them**.
3. **Doctor mic** → the doctor's mic, **Patient mic** → the patient's mic.
4. Test: the doctor speaks → the purple bar moves most; the patient speaks → the cyan bar.
   If it is the other way round, swap the two choices.
5. Start Session. The doctor / patient tiles show who is speaking, live captions are labelled
   by name, and each Gemini line is labelled from the mic.

The choice is remembered on this computer. The logged-in doctor is always the "doctor" label.

## How it works

```
Browser speech recognition ───────► instant live captions (word by word, labelled in 2-mic mode)
1 mic:  10 s clips (WAV) ──► Backend ──► Gemini: English transcript + decides Dr/Patient
2 mics: both mics in sync → split into turns by the louder mic → Gemini writes English per turn
        (speaker = which mic, never guessed)
Transcript + vitals + history ────► Backend
     A) Gemini: differential diagnosis as WHO ICD-10 codes (~10,000 diseases)
        → every code checked against the official ICD-10 list (made-up diseases are dropped)
     B) Python AI service: our XGBoost model (41 diseases, SHAP) + vital-sign rules
     → cross-check badges:  AI + model agree  /  Model disagrees — review  /  AI (ICD-10)
Doctor: Confirm / Edit / Remove / Add  → only confirmed diagnoses are saved
```

If the Python model is off, the Gemini + ICD-10 diagnosis still works (no cross-check badge).
The model is trained in `ml/diagnosis_model.ipynb` (charts in `ml/reports/`).
ICD-10 list: `backend/node_ocr/data/icd10.json` (WHO ICD-10 2019, public domain via simple-icd-10).

## If something goes wrong

| Message | Fix |
|---|---|
| "Model offline" (right panel) | Start Terminal 1 — diagnoses still come from Gemini, but without the cross-check |
| "Can't reach the backend" | Start Terminal 2 |
| "Gemini limit reached" | Free Gemini quota — wait a minute; it continues by itself |
| "Microphone access was blocked" | Click the lock icon in the address bar → allow Microphone |
| `'python' is not recognized` | Reinstall Python with "Add to PATH" ticked, or use `py` instead of `python` |
| `pip install` fails on xgboost | You're in an old `(.venv)` — type `deactivate`, then use run.bat |
| Orange "No sound from your microphone" | Mic muted in Windows or wrong mic chosen — lock icon in the address bar → Microphone |
| "Clips sent 0" keeps going up only on "silent" | Same as above — the AI only gets clips that contain sound |
