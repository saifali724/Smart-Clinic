// backend/node_ocr/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const PORT = process.env.PORT || 5001;

if (!GEMINI_API_KEY) {
  console.error("FATAL: GEMINI_API_KEY missing. Create backend/node_ocr/.env first.");
  process.exit(1);
}

// ---------- Normalizers (ported from Python app.py) ----------

function fixCommonDigitOcr(value) {
  if (!value) return "";
  const table = { O: "0", o: "0", Q: "0", D: "0", I: "1", l: "1", "|": "1", S: "5", s: "5", B: "8", G: "6", Z: "2", z: "2" };
  return String(value).replace(/[OoQDIl|SsBGZz]/g, (ch) => table[ch]);
}

function normalizeCnic(value) {
  if (!value) return "";
  const digits = fixCommonDigitOcr(value).replace(/\D/g, "");
  const match = digits.match(/\d{13}/);
  if (!match) return "";
  const d = match[0];
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
}

function normalizeDate(value) {
  if (!value) return "";
  let fixed = fixCommonDigitOcr(String(value)).replace(/[./\s]/g, "-").replace(/-+/g, "-");
  const today = new Date();
  const candidates = [];
  for (const m of fixed.matchAll(/\b(\d{1,2})-(\d{1,2})-(\d{4})\b/g)) {
    candidates.push({ d: +m[1], m: +m[2], y: +m[3] });
  }
  for (const m of fixed.matchAll(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g)) {
    candidates.push({ d: +m[3], m: +m[2], y: +m[1] });
  }
  for (const c of candidates) {
    if (c.y < 1900 || c.y > today.getFullYear()) continue;
    const dateObj = new Date(c.y, c.m - 1, c.d);
    if (
      dateObj.getFullYear() !== c.y ||
      dateObj.getMonth() !== c.m - 1 ||
      dateObj.getDate() !== c.d ||
      dateObj > today
    ) continue;
    const dd = String(c.d).padStart(2, "0");
    const mm = String(c.m).padStart(2, "0");
    return `${dd}-${mm}-${c.y}`;
  }
  return "";
}

function calculateAge(dob) {
  const normalized = normalizeDate(dob);
  if (!normalized) return "";
  const [d, m, y] = normalized.split("-").map(Number);
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  if (age < 0 || age > 120) return "";
  return String(age);
}

function cleanName(value) {
  if (!value) return "";
  let v = String(value).replace(/[^A-Za-z\s.'-]/g, " ").replace(/\s+/g, " ").trim();
  if (v.length < 3 || v.length > 45) return "";
  return v.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());
}

// ---------- Gemini call (structured JSON) ----------

const EXTRACTION_PROMPT = `You are reading a Pakistani CNIC (national identity card) image.
Extract the fields below. If a field is not clearly readable, return an empty string for it — never guess or invent values.
- fullName: the card holder's name (English)
- fatherName: father's or husband's name (English)
- gender: "Male" or "Female"
- cnic: the 13-digit identity number, formatted xxxxx-xxxxxxx-x
- dateOfBirth: date of birth as dd-mm-yyyy (NOT the issue or expiry date)`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    fullName: { type: "STRING" },
    fatherName: { type: "STRING" },
    gender: { type: "STRING" },
    cnic: { type: "STRING" },
    dateOfBirth: { type: "STRING" },
  },
  required: ["fullName", "fatherName", "gender", "cnic", "dateOfBirth"],
};

async function extractCnicWithGemini(imageBuffer, mimeType) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const body = {
    contents: [
      {
        parts: [
          { text: EXTRACTION_PROMPT },
          { inline_data: { mime_type: mimeType, data: imageBuffer.toString("base64") } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!rawText) throw new Error("Gemini returned an empty response.");

  let parsed;
  try {
    parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error("Gemini response was not valid JSON.");
  }
  return { parsed, rawText };
}

// ---------- Routes ----------

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CNIC OCR service running (Gemini Vision)", port: Number(PORT), primaryEngine: GEMINI_MODEL });
});

app.post("/api/scan-cnic", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No image uploaded" });
    }

    console.log(`\n===== NEW CNIC SCAN (${new Date().toISOString()}) =====`);

    const { parsed, rawText } = await extractCnicWithGemini(req.file.buffer, req.file.mimetype || "image/png");

    const dateOfBirth = normalizeDate(parsed.dateOfBirth);
    const fields = {
      fullName: cleanName(parsed.fullName),
      fatherName: cleanName(parsed.fatherName),
      gender: /female/i.test(parsed.gender) ? "Female" : /male/i.test(parsed.gender) ? "Male" : "",
      cnic: normalizeCnic(parsed.cnic),
      dateOfBirth,
      age: calculateAge(dateOfBirth),
    };

    const filledCount = ["fullName", "fatherName", "gender", "cnic", "dateOfBirth"].filter((k) => fields[k]).length;
    const retakeRequired = filledCount < 2;

    const responseBody = {
      success: !retakeRequired,
      retakeRequired,
      error: retakeRequired ? "CNIC text was not readable. Please retake the photo with better lighting and focus." : "",
      source: "Gemini_Vision_OCR",
      ...fields,
      rawText,
      filledCount,
      confidenceScore: (fields.cnic ? 35 : 0) + (fields.fullName ? 20 : 0) + (fields.fatherName ? 20 : 0) + (fields.gender ? 10 : 0) + (fields.dateOfBirth ? 15 : 0),
    };

    console.log("Result:", { filledCount, cnic: fields.cnic, dob: fields.dateOfBirth });
    return res.status(retakeRequired ? 422 : 200).json(responseBody);
  } catch (error) {
    console.error("OCR service error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`CNIC OCR service (Gemini) running at http://localhost:${PORT}`);
});