// backend/node_ocr/localMirror.js
//
// LOCAL PATIENT FILES — every patient also gets a folder on this PC, kept up to date automatically.
// Firestore stays the main (live) database; this is a readable copy + backup.
//
//   patient-data\
//     all-patients.csv                           ← opens in Excel
//     PT-0001 - Saif Ullah\
//       1 - Personal Details.pdf                 ← CNIC, address, phone, emergency, medicines, known conditions
//       2 - Visits\
//         2026-11-25 - Dr Saif Ali\
//           Visit Summary.pdf                    ← symptoms, diagnosis (ICD-10), vitals, AI analysis, tests, transcript
//           visit.json                           ← the raw data
//       3 - Tests\
//         2026-11-25 - Tests ordered.pdf         ← tests ordered in that visit
//         2026-11-26 - CBC.pdf                   ← test results (patients/{id}/tests)
//         (you can also drop lab report files here — they are never deleted)
//       patient.json
//
// How: firebase-admin listens to Firestore (patients, visits, medications, tests) and rewrites the
// files a few seconds after anything changes. Turn off with LOCAL_MIRROR=off in .env;
// change the place with PATIENT_DATA_DIR=D:\some\folder

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const DEFAULT_DIR = path.resolve(__dirname, "..", "..", "patient-data");

// ── small helpers ─────────────────────────────────────────────────────
const safe = (s) =>
  String(s || "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60) || "Unknown";

function plain(value) {
  // Firestore Timestamp → ISO string, recursively
  if (value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
  return value;
}

function fmtDate(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const fmtDuration = (sec) => {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  return s ? `${Math.floor(s / 60)} min ${s % 60} s` : "";
};

const drName = (n) => (!n ? "" : /^dr\.?\s/i.test(n) ? n : `Dr. ${n}`);

function vitalsRows(v = {}) {
  const val = (key, field = "value") => {
    const item = v?.[key];
    if (item === null || item === undefined) return null;
    const raw = typeof item === "object" ? item[field] : field === "value" ? item : null;
    return raw === null || raw === undefined || raw === "" ? null : raw;
  };
  const rows = [];
  if (val("bloodPressure", "systolic")) rows.push(["Blood pressure", `${val("bloodPressure", "systolic")}/${val("bloodPressure", "diastolic")} mmHg`]);
  if (val("heartRate")) rows.push(["Heart rate", `${val("heartRate")} bpm`]);
  if (val("spo2")) rows.push(["SpO2", `${val("spo2")} %`]);
  if (val("temperature")) rows.push(["Temperature", `${val("temperature")} °F`]);
  if (val("glucose")) rows.push(["Blood glucose", `${val("glucose")} mg/dL`]);
  if (val("weight")) rows.push(["Weight", `${val("weight")} kg`]);
  if (val("height")) rows.push(["Height", `${val("height")} cm`]);
  return rows;
}

const ORDER_LABELS = { ecg: "ECG (electrocardiogram)", labs: "Laboratory tests" };

// ── PDF building blocks ───────────────────────────────────────────────
const C = { ink: "#111827", soft: "#4B5563", faint: "#9CA3AF", line: "#E5E7EB", brand: "#0891B2", purple: "#7C3AED", red: "#DC2626" };

function newPdf(file, title, subtitle) {
  const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 60, left: 50, right: 50 }, bufferPages: true });
  const tmp = `${file}.tmp`;
  const out = fs.createWriteStream(tmp);
  doc.pipe(out);

  doc.rect(0, 0, doc.page.width, 6).fill(C.brand);
  doc.fillColor(C.brand).font("Helvetica-Bold").fontSize(10).text("MEDISCAN AI  ·  SMART CLINIC", 50, 26);
  doc.fillColor(C.ink).font("Helvetica-Bold").fontSize(20).text(title, 50, 44);
  if (subtitle) doc.fillColor(C.soft).font("Helvetica").fontSize(10).text(subtitle);
  doc.moveDown(0.6);
  hr(doc);

  const done = new Promise((resolve, reject) => {
    out.on("finish", () => {
      try {
        fs.renameSync(tmp, file); // never leaves a half-written PDF
        resolve();
      } catch (e) {
        reject(e);
      }
    });
    out.on("error", reject);
  });

  return {
    doc,
    async end() {
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i += 1) {
        doc.switchToPage(i);
        const bottom = doc.page.margins.bottom;
        doc.page.margins.bottom = 0; // writing inside the margin must not open a new page
        const y = doc.page.height - 40;
        doc
          .fillColor(C.faint)
          .font("Helvetica")
          .fontSize(8)
          .text(`Confidential patient record  ·  generated ${fmtDateTime(new Date())}  ·  page ${i + 1} of ${range.count}`, 50, y, {
            width: doc.page.width - 100,
            align: "center",
            lineBreak: false,
          });
        doc.page.margins.bottom = bottom;
      }
      doc.end();
      await done;
    },
  };
}

function hr(doc) {
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(0.7).strokeColor(C.line).stroke();
  doc.moveDown(0.6);
}

function ensureSpace(doc, h) {
  if (doc.y + h > doc.page.height - doc.page.margins.bottom) doc.addPage();
}

function section(doc, title) {
  ensureSpace(doc, 50);
  doc.moveDown(0.5);
  doc.fillColor(C.brand).font("Helvetica-Bold").fontSize(11).text(title.toUpperCase(), 50, doc.y, { characterSpacing: 0.5 });
  doc.moveDown(0.3);
}

function table(doc, rows) {
  const labelW = 150;
  const valueW = doc.page.width - 100 - labelW;
  for (const [label, value] of rows) {
    const text = value === null || value === undefined || value === "" ? "—" : String(value);
    doc.font("Helvetica").fontSize(10);
    const h = Math.max(doc.heightOfString(text, { width: valueW }), 12) + 7;
    ensureSpace(doc, h);
    const y = doc.y;
    doc.fillColor(C.soft).font("Helvetica").fontSize(10).text(label, 50, y + 3, { width: labelW - 10 });
    doc.fillColor(C.ink).font("Helvetica").fontSize(10).text(text, 50 + labelW, y + 3, { width: valueW });
    doc.y = y + h;
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(0.4).strokeColor(C.line).stroke();
  }
  doc.moveDown(0.3);
}

function bullets(doc, items, empty = "None recorded") {
  const list = (items || []).filter(Boolean);
  if (!list.length) {
    doc.fillColor(C.faint).font("Helvetica-Oblique").fontSize(10).text(empty, 50);
    return;
  }
  for (const item of list) {
    ensureSpace(doc, 16);
    doc.fillColor(C.ink).font("Helvetica").fontSize(10).text(`•  ${item}`, 56, doc.y, { width: doc.page.width - 112 });
    doc.moveDown(0.15);
  }
}

function note(doc, text, color = C.soft) {
  doc.fillColor(color).font("Helvetica").fontSize(9).text(text, 50, doc.y, { width: doc.page.width - 100 });
}

// ── the files ────────────────────────────────────────────────────────
function patientFolder(root, patient) {
  fs.mkdirSync(root, { recursive: true });
  const wanted = `${safe(patient.id)} - ${safe(patient.fullName || "Unnamed")}`;
  const existing = fs.readdirSync(root).find((d) => d === wanted || d.startsWith(`${safe(patient.id)} - `) || d === safe(patient.id));
  const dir = path.join(root, wanted);
  if (existing && existing !== wanted) {
    try {
      fs.renameSync(path.join(root, existing), dir); // name was corrected
    } catch {
      return path.join(root, existing);
    }
  }
  fs.mkdirSync(path.join(dir, "2 - Visits"), { recursive: true });
  fs.mkdirSync(path.join(dir, "3 - Tests"), { recursive: true });
  return dir;
}

async function writePersonalDetails(dir, patient, { medications = [], visits = [] } = {}) {
  const pdf = newPdf(path.join(dir, "1 - Personal Details.pdf"), "Personal Details", `${patient.fullName || "Patient"}  ·  ID ${patient.id}`);
  const { doc } = pdf;

  section(doc, "Identity");
  table(doc, [
    ["Patient ID", patient.id],
    ["Full name", patient.fullName],
    ["Father / husband name", patient.fatherName],
    ["CNIC", patient.cnic],
    ["Date of birth", patient.dateOfBirth],
    ["Age", patient.age ? `${patient.age} years` : ""],
    ["Gender", patient.gender],
    ["Blood group", patient.bloodGroup],
  ]);

  section(doc, "Contact");
  table(doc, [
    ["Phone", patient.phone],
    ["Email", patient.email],
    ["Address", patient.address],
    ["Occupation", patient.occupation],
    ["Insurance ID", patient.insuranceId],
    ["Emergency contact", patient.emergencyContact],
  ]);

  const done = visits.filter((v) => v.status === "completed");
  const conditions = [...new Set(done.flatMap((v) => v.diagnoses || []))];
  section(doc, "Known conditions (doctor-confirmed)");
  bullets(doc, conditions, "No confirmed diagnoses yet");

  section(doc, "Current medication");
  const active = medications.filter((m) => m.active !== false);
  bullets(doc, active.map((m) => [m.name, m.schedule].filter(Boolean).join("  —  ")), "No current medication recorded");

  section(doc, "Visits");
  table(
    doc,
    done.length
      ? done
          .sort((a, b) => String(b.date).localeCompare(String(a.date)))
          .map((v) => [fmtDate(v.date), `${drName(v.doctorName)}${v.specialization ? ` (${v.specialization})` : ""}  —  ${(v.diagnoses || []).join(", ") || v.reason || "Consultation"}`])
      : [["", "No completed visits yet"]]
  );

  section(doc, "Record");
  table(doc, [
    ["Registered", fmtDateTime(patient.createdAt)],
    ["Last updated", fmtDateTime(patient.updatedAt)],
  ]);
  await pdf.end();
}

async function writeVisitSummary(file, patient, v) {
  const pdf = newPdf(file, "Visit Summary", `${patient.fullName || "Patient"}  ·  ID ${patient.id}  ·  ${fmtDate(v.date)}`);
  const { doc } = pdf;

  section(doc, "Visit");
  table(doc, [
    ["Date", fmtDate(v.date)],
    ["Doctor", drName(v.doctorName)],
    ["Specialization", v.specialization],
    ["Status", v.status === "completed" ? "Completed" : "In progress"],
    ["Started", fmtDateTime(v.createdAt || v.startedAt)],
    ["Ended", fmtDateTime(v.endedAt)],
    ["Duration", fmtDuration(v.durationSec)],
  ]);

  section(doc, "Patient");
  table(doc, [
    ["Name", patient.fullName],
    ["Age / gender", [patient.age ? `${patient.age} years` : "", patient.gender].filter(Boolean).join(", ")],
    ["CNIC", patient.cnic],
    ["Blood group", patient.bloodGroup],
  ]);

  section(doc, "Chief complaint");
  doc.fillColor(C.ink).font("Helvetica").fontSize(10).text(v.reason || "—", 50);

  section(doc, "Symptoms");
  bullets(doc, [...(v.symptoms || []), ...(v.otherFindings || [])]);

  const vit = vitalsRows(v.vitalsAtVisit || v.vitals);
  section(doc, "Vital signs");
  if (vit.length) table(doc, vit);
  else bullets(doc, [], "No vitals recorded");

  section(doc, "Diagnosis (confirmed by the doctor)");
  const details = v.diagnosisDetails || [];
  if (details.length) {
    table(
      doc,
      details.map((d) => [
        d.icd10 ? `ICD-10 ${d.icd10}` : "",
        `${d.name}${d.icdTitle && d.icdTitle !== d.name ? `  (${d.icdTitle})` : ""}${
          d.source === "edited" ? `  — corrected by doctor (AI said: ${d.aiName || "?"})` : d.source === "added" ? "  — added by doctor" : ""
        }`,
      ])
    );
  } else bullets(doc, v.diagnoses || [], "No diagnosis confirmed");

  section(doc, "AI analysis (suggestions — not a diagnosis)");
  const ai = v.aiDiagnoses || [];
  if (ai.length) {
    const agreeText = { agree: "AI + model agree", disagree: "model disagrees", "ai-only": "AI only", "model-only": "model only" };
    table(
      doc,
      ai.map((d) => [
        `${d.probability ?? "?"} %`,
        `${d.name}${d.icd10 ? `  (ICD-10 ${d.icd10})` : ""}${d.agreement ? `  — ${agreeText[d.agreement] || d.agreement}` : ""}`,
      ])
    );
  } else bullets(doc, [], "No AI suggestions");
  if ((v.rejectedAiDiagnoses || []).length) {
    note(doc, `Rejected by the doctor: ${v.rejectedAiDiagnoses.map((d) => d.name).join(", ")}`);
    doc.moveDown(0.3);
  }
  if ((v.insights || []).length) {
    doc.fillColor(C.soft).font("Helvetica-Bold").fontSize(10).text("Insights", 50);
    bullets(doc, v.insights);
  }

  section(doc, "Tests ordered");
  bullets(doc, (v.orders || []).map((o) => `${ORDER_LABELS[o.type] || o.type}  —  ${fmtDateTime(o.at)}`), "No tests ordered");

  section(doc, "Medication compliance");
  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(10)
    .text({ confirmed: "Takes medicines regularly", missed: "Missed / stopped medicines" }[v.compliance] || "Not discussed", 50);

  const lines = v.transcript || [];
  section(doc, "Consultation transcript (English)");
  if (lines.length) {
    note(doc, v.micMode === "dual" ? "Speakers identified by two microphones." : "Speakers identified by AI (one microphone) and corrected by the doctor.", C.faint);
    doc.moveDown(0.3);
    for (const l of lines) {
      const who = l.speaker === "patient" ? patient.fullName || "Patient" : drName(v.doctorName) || "Doctor";
      ensureSpace(doc, 28);
      doc
        .fillColor(l.speaker === "patient" ? C.brand : C.purple)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(who, 50, doc.y, { continued: true })
        .fillColor(C.ink)
        .font("Helvetica")
        .fontSize(10)
        .text(`   ${l.text}`, { width: doc.page.width - 100 });
      doc.moveDown(0.25);
    }
  } else bullets(doc, [], "No transcript");

  ensureSpace(doc, 40);
  doc.moveDown(1);
  note(doc, "AI suggestions support the doctor and are not a diagnosis. Only diagnoses confirmed by the doctor are part of the medical record.", C.faint);
  await pdf.end();
}

async function writeTestsOrdered(file, patient, v) {
  const pdf = newPdf(file, "Tests Ordered", `${patient.fullName || "Patient"}  ·  ID ${patient.id}  ·  ${fmtDate(v.date)}`);
  const { doc } = pdf;
  section(doc, "Ordered by");
  table(doc, [
    ["Doctor", drName(v.doctorName)],
    ["Visit date", fmtDate(v.date)],
    ["For", (v.diagnoses || []).join(", ") || v.reason || ""],
  ]);
  section(doc, "Tests");
  table(doc, (v.orders || []).map((o) => [fmtDateTime(o.at), ORDER_LABELS[o.type] || o.type]));
  section(doc, "Results");
  note(doc, "Put the lab report files in this same folder, or enter results in the app — they appear here as separate PDFs.");
  await pdf.end();
}

async function writeTestResult(file, patient, t) {
  const pdf = newPdf(file, t.name || "Test Result", `${patient.fullName || "Patient"}  ·  ID ${patient.id}  ·  ${fmtDate(t.date)}`);
  const { doc } = pdf;
  section(doc, "Test");
  table(doc, [
    ["Test", t.name],
    ["Date", fmtDate(t.date)],
    ["Status", t.status],
    ["Lab", t.lab],
    ["Ordered by", drName(t.orderedBy)],
  ]);
  section(doc, "Result");
  const results = Array.isArray(t.results) ? t.results : t.result ? [{ name: t.name, value: t.result, unit: t.unit, normalRange: t.normalRange }] : [];
  if (results.length) table(doc, results.map((r) => [r.name || "", [r.value, r.unit].filter(Boolean).join(" ") + (r.normalRange ? `   (normal ${r.normalRange})` : "")]));
  else bullets(doc, [], "Result not entered yet");
  if (t.notes) {
    section(doc, "Notes");
    doc.fillColor(C.ink).font("Helvetica").fontSize(10).text(t.notes, 50);
  }
  await pdf.end();
}

function csvCell(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeIndex(root, patients) {
  const head = ["Patient ID", "Full name", "Father name", "CNIC", "Age", "Gender", "Blood group", "Phone", "Email", "Address", "Last visit", "Known conditions"];
  const rows = [...patients.values()]
    .sort((a, b) => String(a.patient.id).localeCompare(String(b.patient.id)))
    .map(({ patient: p, visits }) => {
      const done = [...visits.values()].filter((v) => v.status === "completed");
      const last = done.map((v) => v.date).sort().pop() || "";
      const cond = [...new Set(done.flatMap((v) => v.diagnoses || []))].join("; ");
      return [p.id, p.fullName, p.fatherName, p.cnic, p.age, p.gender, p.bloodGroup, p.phone, p.email, p.address, last, cond];
    });
  const csv = "\uFEFF" + [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n"); // BOM → Excel reads it right
  fs.writeFileSync(path.join(root, "all-patients.csv"), csv, "utf8");
}

// ── keep everything in sync ───────────────────────────────────────────
/**
 * Rebuilds one patient's folder from an in-memory snapshot.
 * Exported for testing: state = { patient, visits: Map, medications: Map, tests: Map }
 */
async function writePatientFiles(root, state) {
  const { patient } = state;
  if (!patient) return;
  const visits = [...state.visits.values()];
  const dir = patientFolder(root, patient);
  fs.writeFileSync(path.join(dir, "patient.json"), JSON.stringify(patient, null, 2));
  await writePersonalDetails(dir, patient, { medications: [...state.medications.values()], visits });

  for (const v of visits) {
    const folder = path.join(dir, "2 - Visits", safe(`${v.date || v.id} - ${drName(v.doctorName) || "Doctor"}`.replace(/\./g, "")));
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, "visit.json"), JSON.stringify(v, null, 2));
    await writeVisitSummary(path.join(folder, "Visit Summary.pdf"), patient, v);
    if ((v.orders || []).length) {
      await writeTestsOrdered(path.join(dir, "3 - Tests", `${safe(v.date || v.id)} - Tests ordered.pdf`), patient, v);
    }
  }
  for (const t of state.tests.values()) {
    await writeTestResult(path.join(dir, "3 - Tests", `${safe(t.date || "")} - ${safe(t.name || t.id)}.pdf`), patient, t);
  }
}

function startLocalMirror({ admin, log = console } = {}) {
  if (String(process.env.LOCAL_MIRROR || "on").toLowerCase() === "off") return null;
  const root = path.resolve(process.env.PATIENT_DATA_DIR || DEFAULT_DIR);
  const db = admin.firestore();

  const patients = new Map(); // id → { patient, visits, medications, tests }
  const timers = new Map();
  let indexTimer = null;

  const stateFor = (id) => {
    if (!patients.has(id)) patients.set(id, { patient: null, visits: new Map(), medications: new Map(), tests: new Map() });
    return patients.get(id);
  };

  const schedule = (id) => {
    clearTimeout(timers.get(id));
    timers.set(
      id,
      setTimeout(async () => {
        try {
          await writePatientFiles(root, stateFor(id));
        } catch (err) {
          log.error(`[patient-data] couldn't write ${id}: ${err.message}`);
        }
      }, 3000) // wait until the burst of autosaves is over
    );
    clearTimeout(indexTimer);
    indexTimer = setTimeout(() => {
      try {
        writeIndex(root, new Map([...patients].filter(([, s]) => s.patient)));
      } catch (err) {
        log.error(`[patient-data] couldn't write all-patients.csv: ${err.message}`);
      }
    }, 4000);
  };

  const onError = (what) => (err) => log.error(`[patient-data] ${what} listener stopped: ${err.message}`);

  db.collection("patients").onSnapshot((snap) => {
    snap.docChanges().forEach((ch) => {
      if (ch.type === "removed") return; // files are never deleted automatically
      stateFor(ch.doc.id).patient = { id: ch.doc.id, ...plain(ch.doc.data()) };
      schedule(ch.doc.id);
    });
  }, onError("patients"));

  const sub = (name, key) =>
    db.collectionGroup(name).onSnapshot((snap) => {
      snap.docChanges().forEach((ch) => {
        const patientId = ch.doc.ref.parent.parent?.id;
        if (!patientId || ch.doc.ref.parent.parent.parent.id !== "patients") return;
        const map = stateFor(patientId)[key];
        if (ch.type === "removed") map.delete(ch.doc.id);
        else map.set(ch.doc.id, { id: ch.doc.id, ...plain(ch.doc.data()) });
        schedule(patientId);
      });
    }, onError(name));

  sub("visits", "visits");
  sub("medications", "medications");
  sub("tests", "tests");

  log.log(`📁 Patient files are saved to ${root}`);
  return { root, stop: () => timers.forEach(clearTimeout) };
}

module.exports = { startLocalMirror, writePatientFiles, writeIndex, DEFAULT_DIR };
