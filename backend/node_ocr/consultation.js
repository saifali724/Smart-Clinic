// backend/node_ocr/consultation.js
//
// LIVE CONSULTATION — AI routes
// ─────────────────────────────
//  POST /api/consult/transcribe   (multipart: audio=<wav>, doctorName, patientName, recent)
//        → Gemini listens to ~12 s of audio and returns English lines labelled doctor / patient
//
//  POST /api/consult/transcribe-turns   (2-microphone mode)
//        → the browser already split the audio into turns by microphone (doctor mic / patient mic);
//          Gemini only writes the English text — the speaker label comes from the hardware
//
//  POST /api/consult/analyze      (JSON: transcript, vitals, patient, previousDiagnoses, previousVisitDate)
//        Two independent "brains", then a cross-check:
//        A) Gemini reads the whole conversation + vitals + history and gives a differential
//           diagnosis as OFFICIAL WHO ICD-10 codes (~10,000 diseases). Every code is checked
//           against the real ICD-10 list (icd10.js) — made-up diseases are dropped.
//        B) Our own XGBoost model (backend/ai_service, port 5002) predicts from the symptoms
//           (41 diseases, calibrated %, SHAP reasons) + vital-sign rules.
//        → agree = "AI + model agree"; disagree = "Needs review". The doctor always decides.
//
//  GET  /api/consult/icd?q=typhoid  → ICD-10 search for the doctor's Edit / Add diagnosis box
//
// The Gemini key stays here on the server (same GEMINI_API_KEY as the CNIC scanner).

const express = require("express");
const multer = require("multer");
const icd = require("./icd10");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// ── prompts ──────────────────────────────────────────────────────────────
function transcribePrompt({ doctorName, patientName, recent, heard, lastSpeaker }) {
  const doctor = doctorName || "the doctor";
  const patient = patientName || "the patient";
  return `You are a careful transcriber. Write down EXACTLY what is said in this short audio clip
(about 10 seconds, taken from a live doctor–patient conversation in a clinic in Pakistan).
People may speak English, Urdu, Punjabi or a mix.

ACCURACY — most important:
- Write ONLY words that are clearly spoken in this clip. Never guess, never complete sentences,
  never add symptoms, complaints, medicines or numbers that you did not clearly hear.
- Do not make the conversation "sound medical". If people talk about something else, write that.
- If the clip has no clear speech (silence, noise, mumbling, background talk) → return an empty list.
- If part of a sentence is unclear, leave that part out rather than guessing.
- Translate faithfully into natural ENGLISH. Keep names, numbers, durations and medicine names exact.
${heard ? `
The browser's speech recogniser heard roughly this in the same clip (it may have spelling mistakes or be in the
wrong language, but it shows what was REALLY said — stay close to it, do not add content that is not in it):
"""${heard}"""
` : ""}
SPEAKER — who said each sentence (only one microphone, so decide from the words):
- doctor = ${doctor}. The doctor ASKS about the problem ("What happened?", "Since when?", "Any fever?"),
  examines, explains, advises, prescribes, and calls the patient by name.
- patient = ${patient}. The patient DESCRIBES their own problem and feelings ("I have…", "since yesterday"),
  answers the doctor's questions, and calls the doctor "doctor" / "sir" / "doctor sahab".
- A question and its answer are almost always different speakers. Greetings: whoever greets first is usually the doctor.
- Use the recent transcript to keep the turn order consistent.${lastSpeaker ? ` The last line before this clip was said by the ${lastSpeaker}.` : ""}

Rules:
- Do not repeat sentences that are already in the recent transcript below.
- Merge words of one speaker that belong to one sentence.

Recent transcript (speaker labels here are CORRECT — confirmed by the doctor; for context only, do not repeat):
${recent || "(start of consultation)"}`;
}

function turnsPrompt({ doctorName, patientName, speakers, recent, heard }) {
  const doctor = doctorName || "the doctor";
  const patient = patientName || "the patient";
  const order = speakers.map((sp, i) => `Turn ${i + 1}: ${sp === "patient" ? `PATIENT (${patient})` : `DOCTOR (${doctor})`}`).join("\n");
  return `You are a careful transcriber in a live doctor–patient consultation in a clinic in Pakistan.
The doctor and the patient each wear their OWN microphone, so WHO is speaking is already known for every turn:
${order}

The audio turns follow below, in order. For EACH turn, write exactly what that person says, translated
faithfully into natural ENGLISH (they may speak English, Urdu, Punjabi or a mix).

ACCURACY — most important:
- Write ONLY words that are clearly spoken in that turn. Never guess, never complete sentences,
  never add symptoms, complaints, medicines or numbers that you did not clearly hear.
- Do not make the conversation "sound medical". If people talk about something else, write that.
- Ignore faint background voices — transcribe only the main, loud voice of the turn.
- If a turn has no clear speech (cough, noise, mumbling) → return "" for it.
- Keep names, numbers, durations and medicine names exact.
- Do not repeat sentences already in the recent transcript.
${heard ? `
The browser's speech recogniser heard roughly this during the same seconds (may contain mistakes or be in the wrong
language, but it shows what was REALLY said — do not add content that is not in it):
"""${heard}"""
` : ""}
Recent transcript (for context only):
${recent || "(start of consultation)"}`;
}

function analyzePrompt({ transcriptText, patient, vitalsText, previousDiagnoses, previousVisitDate }) {
  return `You are an experienced consultant physician assisting a doctor in a clinic in Pakistan.
Read the live consultation below (doctor–patient, English) and the patient's data.

PATIENT: ${patient || "unknown age / gender"}
LIVE VITALS (sensors): ${vitalsText || "not available"}
PREVIOUS DIAGNOSES: ${previousDiagnoses.length ? previousDiagnoses.join(", ") : "none"}${previousVisitDate ? ` (last visit ${previousVisitDate})` : ""}

TASKS
1. symptoms: choose ONLY from the allowed list (the enum) every symptom the PATIENT currently has,
   as stated or clearly described. Map everyday words to the closest allowed item
   ("tightness in my chest" → chest_pain, "feeling tired" → fatigue). Skip denied symptoms ("no fever").
2. otherFindings: up to 4 short clinical notes NOT in that list (e.g. "Symptoms for 2 weeks"). Max 6 words each.
3. compliance: "confirmed" if the patient takes their medicines regularly, "missed" if they skip/stopped, else "unknown".
4. differential: the most likely diagnoses (max 5), most likely first, as WHO ICD-10 (2019) codes.
   - icd10: the most specific correct WHO ICD-10 code you are sure of (e.g. "A01.0", "J06.9", "K21.9").
     If unsure of the 4th character, give the 3-character category (e.g. "A01").
   - name: the short common name a doctor would write (e.g. "Typhoid fever").
   - likelihood: 0–100, your honest probability. All likelihoods together must be ≤ 100.
   - evidenceFor: 1–4 short facts FROM THIS CONVERSATION / VITALS that support it (quote the patient's words where possible).
   - evidenceAgainst: 0–3 short facts that argue against it.
   - tests: 0–3 tests that would confirm or rule it out (e.g. "CBC", "Typhidot / blood culture", "ECG").
   Rules:
   - Base everything ONLY on what was actually said and measured. Never invent symptoms, history or results.
   - Think of what is COMMON first (in Pakistan: viral URTI, gastroenteritis, typhoid, dengue, malaria, TB,
     hypertension, diabetes, GERD …), but always include a dangerous condition that must not be missed
     if the evidence points to it (e.g. MI for chest pain with sweating).
   - Serious diagnoses that need tissue / imaging proof (cancer, TB, MI …): you may list them only as
     "suspected", with the tests needed, and a likelihood that reflects the uncertainty.
   - If the conversation has too little information, return an EMPTY differential and use askNext.
5. redFlags: 0–3 urgent warning signs present right now (e.g. "Chest pain with sweating — rule out MI"). Empty if none.
6. askNext: 0–3 short questions the doctor should still ask to narrow the diagnosis.
7. certainty: "enough" if the information supports a confident top diagnosis, otherwise "need_more_info".

Transcript:
${transcriptText}`;
}

// ── Gemini helper (JSON output with a schema) ────────────────────────────
function createGemini({ apiKey, model }) {
  return async function geminiJson(parts, schema, { temperature = 0 } = {}) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature },
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      const err = new Error(`Gemini error ${response.status}: ${body.slice(0, 300)}`);
      err.status = response.status;
      throw err;
    }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) return {};
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  };
}

// ── helpers ──────────────────────────────────────────────────────────────
function friendly(err) {
  if (err.status === 429) return { status: 429, error: "Gemini limit reached — waiting a moment before the next update." };
  if (err.status === 400 || err.status === 403) return { status: 502, error: "Gemini rejected the request — check GEMINI_API_KEY in backend/node_ocr/.env." };
  if (err.aiService) return { status: 503, error: "The AI diagnosis service isn't running. Start backend/ai_service (run.bat)." };
  return { status: 500, error: err.message || "AI request failed." };
}

// ── analysis helpers ─────────────────────────────────────────────────────
function analyzeSchema(symptomKeys) {
  const symptomItem = symptomKeys.length ? { type: "STRING", enum: symptomKeys } : { type: "STRING" };
  return {
    type: "OBJECT",
    properties: {
      symptoms: { type: "ARRAY", items: symptomItem },
      otherFindings: { type: "ARRAY", items: { type: "STRING" } },
      compliance: { type: "STRING", enum: ["confirmed", "missed", "unknown"] },
      differential: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            icd10: { type: "STRING" },
            name: { type: "STRING" },
            likelihood: { type: "INTEGER" },
            evidenceFor: { type: "ARRAY", items: { type: "STRING" } },
            evidenceAgainst: { type: "ARRAY", items: { type: "STRING" } },
            tests: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["icd10", "name", "likelihood", "evidenceFor"],
        },
      },
      redFlags: { type: "ARRAY", items: { type: "STRING" } },
      askNext: { type: "ARRAY", items: { type: "STRING" } },
      certainty: { type: "STRING", enum: ["enough", "need_more_info"] },
    },
    required: ["symptoms", "otherFindings", "compliance", "differential", "redFlags", "askNext", "certainty"],
  };
}

function describePatient(p = {}) {
  const parts = [];
  if (p.age) parts.push(`${p.age} years`);
  if (p.gender) parts.push(String(p.gender).toLowerCase());
  return parts.join(", ");
}

function describeVitals(v = {}) {
  // same shape as patients/{id}/vitals/live: { heartRate: { value }, bloodPressure: { systolic, diastolic } … }
  const read = (key, field = "value") => {
    const item = v?.[key];
    const raw = item && typeof item === "object" ? item[field] : field === "value" ? item : null;
    const n = Number(raw);
    return raw === null || raw === undefined || raw === "" || Number.isNaN(n) ? null : n;
  };
  const parts = [];
  const sys = read("bloodPressure", "systolic");
  const dia = read("bloodPressure", "diastolic");
  if (sys && dia) parts.push(`BP ${sys}/${dia} mmHg`);
  if (read("heartRate")) parts.push(`HR ${read("heartRate")} bpm`);
  if (read("spo2")) parts.push(`SpO2 ${read("spo2")}%`);
  if (read("temperature")) parts.push(`Temp ${read("temperature")} °F`);
  if (read("glucose")) parts.push(`Glucose ${read("glucose")} mg/dL`);
  if (read("weight")) parts.push(`Weight ${read("weight")} kg`);
  if (read("height")) parts.push(`Height ${read("height")} cm`);
  return parts.join(", ");
}

const band = (p) => (p >= 60 ? "high" : p >= 30 ? "medium" : "low");

/**
 * Gemini's differential (ICD-10) + our model's top 3 → one list for the doctor.
 * agreement:  "agree"     both point to the same disease
 *             "disagree"  our model knows this disease but does not support it
 *             "ai-only"   outside the 41 diseases our model was trained on
 *             "model-only" only our model suggests it (shown when it is strong)
 */
function crossCheck(differential, modelDx, modelOnline) {
  const seen = new Set();
  const out = [];

  for (const d of differential.slice(0, 5)) {
    const official = icd.validate(d.icd10, d.name);
    if (!official) continue; // not a real ICD-10 disease → dropped
    if (seen.has(official.code)) continue;
    seen.add(official.code);

    const match = modelDx.find((m) => icd.modelMatches(m.name, official.code));
    let agreement = "ai-only";
    if (modelOnline && icd.modelCovers(official.code)) agreement = match ? "agree" : "disagree";

    const likelihood = Math.max(0, Math.min(100, Number(d.likelihood) || 0));
    out.push({
      key: official.code,
      name: String(d.name || official.title).trim(),
      icd10: official.code,
      icdTitle: official.title,
      probability: likelihood,
      likelihoodBand: band(likelihood),
      agreement,
      model: match ? { name: match.name, probability: match.probability, reasons: match.reasons || [] } : null,
      evidenceFor: (d.evidenceFor || []).slice(0, 4),
      evidenceAgainst: (d.evidenceAgainst || []).slice(0, 3),
      tests: (d.tests || []).slice(0, 3),
      source: "ai",
    });
  }

  // our model is confident about something Gemini did not list → show it too, for review
  const strong = modelDx[0];
  if (strong && strong.probability >= 70 && !out.some((d) => icd.modelMatches(strong.name, d.icd10))) {
    const code = (icd.MODEL_TO_ICD[strong.name] || [])[0];
    const official = code ? icd.validate(code, strong.name) : null;
    if (official && !seen.has(official.code)) {
      out.push({
        key: official.code,
        name: strong.name,
        icd10: official.code,
        icdTitle: official.title,
        probability: Math.round(strong.probability),
        likelihoodBand: band(strong.probability),
        agreement: "model-only",
        model: { name: strong.name, probability: strong.probability, reasons: strong.reasons || [] },
        evidenceFor: (strong.reasons || []).map((r) => r.label),
        evidenceAgainst: [],
        tests: [],
        source: "model",
      });
    }
  }
  return out;
}

/** Max 4 lines for "Real-time AI insights" — most urgent first. */
function buildInsights({ extracted, model, diagnoses, previousDiagnoses, previousVisitDate }) {
  const list = [];
  for (const r of (extracted.redFlags || []).slice(0, 2)) list.push({ type: "critical", text: r });
  for (const i of model?.insights || []) {
    if (i.type === "suggestion") continue; // tests now come from the ICD-10 differential below
    list.push(i);
  }
  const lead = diagnoses[0];
  if (lead?.tests?.length) list.push({ type: "suggestion", text: `${lead.name} suspected — suggest ${lead.tests.slice(0, 2).join(", ")}` });
  if (extracted.askNext?.length) list.push({ type: "suggestion", text: `Ask: ${extracted.askNext[0]}` });

  if (previousDiagnoses.length && diagnoses.length && !list.some((i) => i.type === "pattern")) {
    const prev = previousDiagnoses.map((p) => String(p).toLowerCase());
    const match = diagnoses.slice(0, 2).find((d) =>
      prev.some((p) => p === d.name.toLowerCase() || p === d.icdTitle.toLowerCase() || p.includes(d.icd10.toLowerCase()))
    );
    if (match) list.push({ type: "pattern", text: `Pattern matches previous visit${previousVisitDate ? ` (${previousVisitDate})` : ""}: ${match.name}` });
  }

  const seen = new Set();
  return list.filter((i) => !seen.has(i.text) && seen.add(i.text)).slice(0, 4);
}

/**
 * @param deps.geminiJson(parts, schema) → parsed JSON
 * @param deps.aiServiceUrl  e.g. http://localhost:5002
 * @param deps.fetchImpl     (tests can replace fetch)
 */
function createConsultationRouter(deps) {
  const router = express.Router();
  const fetchImpl = deps.fetchImpl || fetch;
  let vocabulary = null; // [{key,label}] from the Python service, cached

  async function aiService(path, body) {
    let res;
    try {
      res = await fetchImpl(`${deps.aiServiceUrl}${path}`, body
        ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
        : undefined);
    } catch {
      const err = new Error("AI service unreachable");
      err.aiService = true;
      throw err;
    }
    if (!res.ok) {
      const err = new Error(`AI service error ${res.status}`);
      err.aiService = true;
      throw err;
    }
    return res.json();
  }

  async function getVocabulary() {
    if (!vocabulary) vocabulary = (await aiService("/symptoms")).symptoms;
    return vocabulary;
  }

  router.get("/health", async (req, res) => {
    try {
      const health = await aiService("/health");
      res.json({ success: true, gemini: Boolean(deps.geminiJson), aiService: health });
    } catch (err) {
      const f = friendly(err);
      res.status(f.status).json({ success: false, error: f.error });
    }
  });

  // 1 ─ audio clip → English transcript lines
  router.post("/transcribe", upload.single("audio"), async (req, res) => {
    if (!req.file || req.file.size < 2000) {
      return res.json({ success: true, segments: [] }); // nothing to hear
    }
    try {
      const schema = {
        type: "OBJECT",
        properties: {
          segments: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                speaker: { type: "STRING", enum: ["doctor", "patient"] },
                text: { type: "STRING" },
              },
              required: ["speaker", "text"],
            },
          },
        },
        required: ["segments"],
      };
      const result = await deps.geminiJson(
        [
          { text: transcribePrompt(req.body || {}) },
          { inline_data: { mime_type: req.file.mimetype || "audio/wav", data: req.file.buffer.toString("base64") } },
        ],
        schema
      );
      const segments = (result.segments || [])
        .map((s) => ({ speaker: s.speaker === "patient" ? "patient" : "doctor", text: String(s.text || "").trim() }))
        .filter((s) => s.text.length > 1);
      res.json({ success: true, segments });
    } catch (err) {
      console.error("transcribe error:", err.message);
      const f = friendly(err);
      res.status(f.status).json({ success: false, error: f.error });
    }
  });

  // 1b ─ 2-microphone mode: speaker turns already known → English text per turn
  //       (multipart: audio=<wav> × N in order, speakers='["doctor","patient",…]', doctorName, patientName, recent, heard)
  router.post("/transcribe-turns", upload.array("audio", 10), async (req, res) => {
    let speakers = [];
    try {
      speakers = JSON.parse(req.body?.speakers || "[]");
    } catch {
      speakers = [];
    }
    const files = req.files || [];
    if (!files.length || files.length !== speakers.length) {
      return res.json({ success: true, segments: [] });
    }
    try {
      const parts = [{ text: turnsPrompt({ ...(req.body || {}), speakers }) }];
      files.forEach((f, i) => {
        parts.push({ text: `Turn ${i + 1} — ${speakers[i] === "patient" ? "PATIENT" : "DOCTOR"}:` });
        parts.push({ inline_data: { mime_type: f.mimetype || "audio/wav", data: f.buffer.toString("base64") } });
      });
      const schema = {
        type: "OBJECT",
        properties: {
          turns: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: { turn: { type: "INTEGER" }, text: { type: "STRING" } },
              required: ["turn", "text"],
            },
          },
        },
        required: ["turns"],
      };
      const result = await deps.geminiJson(parts, schema);
      // the SPEAKER always comes from the microphone, never from the AI
      const segments = (result.turns || [])
        .map((t) => ({ index: Number(t.turn) - 1, text: String(t.text || "").trim() }))
        .filter((t) => t.index >= 0 && t.index < speakers.length && t.text.length > 1)
        .sort((a, b) => a.index - b.index)
        .map((t) => ({ speaker: speakers[t.index] === "patient" ? "patient" : "doctor", text: t.text }));
      res.json({ success: true, segments });
    } catch (err) {
      console.error("transcribe-turns error:", err.message);
      const f = friendly(err);
      res.status(f.status).json({ success: false, error: f.error });
    }
  });

  // ICD-10 search (doctor edits / adds a diagnosis)
  router.get("/icd", (req, res) => {
    res.json({ success: true, results: icd.search(req.query.q, 12) });
  });

  // 2 ─ transcript + vitals → (A) Gemini + ICD-10  and  (B) our model → cross-checked diagnoses
  router.post("/analyze", express.json({ limit: "1mb" }), async (req, res) => {
    const {
      transcript = [],
      vitals = {},
      patient = {},
      previousDiagnoses = [],
      previousVisitDate = null,
    } = req.body || {};
    try {
      // the model's symptom list (if the Python service is off we still run Gemini)
      let keys = [];
      let modelOnline = true;
      try {
        keys = (await getVocabulary()).map((s) => s.key);
      } catch {
        modelOnline = false;
      }

      const lines = transcript
        .filter((l) => l && l.text)
        .map((l) => `${l.speaker === "patient" ? "Patient" : "Doctor"}: ${l.text}`)
        .join("\n");

      // ── A) Gemini clinical reasoning ──
      let extracted = { symptoms: [], otherFindings: [], compliance: "unknown", differential: [], redFlags: [], askNext: [], certainty: "need_more_info" };
      if (lines.trim()) {
        extracted = await deps.geminiJson(
          [{ text: analyzePrompt({
            transcriptText: lines,
            patient: describePatient(patient),
            vitalsText: describeVitals(vitals),
            previousDiagnoses,
            previousVisitDate,
          }) }],
          analyzeSchema(keys)
        );
      }

      // ── B) our own model + vital-sign rules ──
      const symptoms = (extracted.symptoms || []).filter((k) => keys.includes(k));
      let model = null;
      if (modelOnline) {
        try {
          model = await aiService("/analyze", {
            symptoms,
            vitals,
            compliance: extracted.compliance === "unknown" ? null : extracted.compliance,
            previousDiagnoses,
            previousVisitDate,
          });
        } catch {
          modelOnline = false;
        }
      }

      const diagnoses = crossCheck(extracted.differential || [], model?.diagnoses || [], modelOnline);
      const top = diagnoses[0];
      const needsReview =
        diagnoses.length > 0 &&
        (extracted.certainty !== "enough" || top.likelihoodBand === "low" || top.agreement === "disagree");

      res.json({
        success: true,
        engine: { ai: "Gemini + WHO ICD-10", model: modelOnline ? model?.modelVersion || "XGBoost" : null },
        symptoms: model?.usedSymptoms || symptoms.map((k) => ({ key: k, label: k.replace(/_/g, " "), source: "conversation" })),
        otherFindings: (extracted.otherFindings || []).slice(0, 4),
        compliance: extracted.compliance || "unknown",
        diagnoses,
        needsReview,
        certainty: extracted.certainty || "need_more_info",
        redFlags: (extracted.redFlags || []).slice(0, 3),
        askNext: (extracted.askNext || []).slice(0, 3),
        vitalFindings: model?.vitalFindings || [],
        insights: buildInsights({ extracted, model, diagnoses, previousDiagnoses, previousVisitDate }),
        evidence: model?.evidence ?? symptoms.length,
        modelOnline,
      });
    } catch (err) {
      console.error("analyze error:", err.message);
      const f = friendly(err);
      res.status(f.status).json({ success: false, error: f.error });
    }
  });

  return router;
}

module.exports = { createConsultationRouter, createGemini, transcribePrompt, turnsPrompt, analyzePrompt, crossCheck };
