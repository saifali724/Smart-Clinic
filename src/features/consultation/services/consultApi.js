// src/features/consultation/services/consultApi.js
// Calls the Node backend (backend/node_ocr/consultation.js).

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function readJson(response) {
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* empty */
  }
  if (!response.ok || !data.success) {
    const err = new Error(data.error || `Request failed (${response.status})`);
    err.status = response.status;
    throw err;
  }
  return data;
}

function networkError() {
  const err = new Error("Can't reach the backend. Start it: cd backend/node_ocr && npm start");
  err.network = true;
  return err;
}

/** Is the backend up, and is the Python AI model running? */
export async function checkServices() {
  try {
    const response = await fetch(`${API_BASE}/api/consult/health`);
    if (response.ok) return { backend: "ok", model: "ok" };
    return { backend: "ok", model: "down" };
  } catch {
    return { backend: "down", model: "unknown" };
  }
}

/** One audio clip → [{ speaker: "doctor" | "patient", text }] in English */
export async function transcribeClip(wavBlob, { doctorName, patientName, recent, heard, lastSpeaker }) {
  const form = new FormData();
  form.append("audio", wavBlob, "clip.wav");
  form.append("doctorName", doctorName || "");
  form.append("patientName", patientName || "");
  form.append("recent", recent || "");
  form.append("heard", heard || ""); // what the browser's live captions heard in this clip (keeps Gemini honest)
  form.append("lastSpeaker", lastSpeaker || "");
  let response;
  try {
    response = await fetch(`${API_BASE}/api/consult/transcribe`, { method: "POST", body: form });
  } catch {
    throw networkError();
  }
  return (await readJson(response)).segments || [];
}

/** 2-microphone mode: turns already labelled by microphone → [{ speaker, text }] in English */
export async function transcribeTurns(turns, { doctorName, patientName, recent, heard }) {
  const form = new FormData();
  turns.forEach((t, i) => form.append("audio", t.wav, `turn${i + 1}.wav`));
  form.append("speakers", JSON.stringify(turns.map((t) => t.speaker)));
  form.append("doctorName", doctorName || "");
  form.append("patientName", patientName || "");
  form.append("recent", recent || "");
  form.append("heard", heard || "");
  let response;
  try {
    response = await fetch(`${API_BASE}/api/consult/transcribe-turns`, { method: "POST", body: form });
  } catch {
    throw networkError();
  }
  return (await readJson(response)).segments || [];
}

/** Transcript + vitals → symptoms, diagnoses (model %), insights */
export async function analyzeConsultation(payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/consult/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw networkError();
  }
  return readJson(response);
}

/** WHO ICD-10 search for the doctor's Edit / Add diagnosis box → [{ code, title }] */
export async function searchIcd(query, signal) {
  const q = String(query || "").trim();
  if (q.length < 2) return [];
  const response = await fetch(`${API_BASE}/api/consult/icd?q=${encodeURIComponent(q)}`, { signal });
  return (await readJson(response)).results || [];
}
