// backend/node_ocr/icd10.js
//
// WHO ICD-10 (2019) — the official list of ~10,000 diseases and their codes
// (data/icd10.json, public domain via the "simple-icd-10" package).
//
// Used to make sure every AI diagnosis is a REAL, official disease:
//   • validate(code, name)  → the official { code, title } or null
//   • search(query)         → best matches for the doctor's "Edit / Add diagnosis" box
//
// Plus the link between our own XGBoost model (41 diseases) and ICD-10, used for the cross-check.

const path = require("path");

const { codes } = require(path.join(__dirname, "data", "icd10.json"));

const byCode = new Map(codes.map(([code, title]) => [code, title]));
const entries = codes.map(([code, title]) => ({ code, title, low: title.toLowerCase() }));

/** "a01" / "A010" / "A01.0 " → "A01.0" */
function normalizeCode(raw) {
  const s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z]\d\d/.test(s)) return "";
  return s.length > 3 ? `${s.slice(0, 3)}.${s.slice(3)}` : s;
}

const words = (s) => String(s || "").toLowerCase().match(/[a-z0-9]+/g) || [];

// common everyday words → ICD wording
const SYNONYMS = {
  flu: "influenza",
  sugar: "diabetes",
  bp: "hypertension",
  "heart attack": "myocardial infarction",
  stroke: "cerebral infarction",
  piles: "haemorrhoids",
  hemorrhoids: "haemorrhoids",
  anemia: "anaemia",
  diarrhea: "diarrhoea",
  cold: "nasopharyngitis",
  "common cold": "acute nasopharyngitis",
  gerd: "gastro-oesophageal reflux",
  uti: "urinary tract infection",
  tb: "tuberculosis",
  covid: "covid",
  gas: "flatulence",
  cancer: "malignant neoplasm",
  tumor: "neoplasm",
  tumour: "neoplasm",
  "kidney stone": "calculus of kidney",
  stone: "calculus",
  ulcer: "ulcer",
  "chest infection": "pneumonia",
  "food poisoning": "foodborne",
  "loose motion": "diarrhoea",
  "loose motions": "diarrhoea",
  fits: "epilepsy",
  "heart failure": "heart failure",
};

function search(query, limit = 12) {
  const q = String(query || "").trim();
  if (!q) return [];
  const code = normalizeCode(q);
  const lowQ = q.toLowerCase();
  const expanded = SYNONYMS[lowQ] || lowQ;
  const tokens = words(expanded).map((t) => SYNONYMS[t] || t).flatMap(words);

  const scored = [];
  for (const e of entries) {
    let score = 0;
    if (code && e.code.startsWith(code)) score = 100 - (e.code.length - code.length) * 2;
    else if (tokens.length) {
      let hits = 0;
      for (const t of tokens) if (e.low.includes(t)) hits += 1;
      if (hits === tokens.length) {
        score = 50 + (e.low.startsWith(tokens[0]) ? 10 : 0) - e.low.length / 20 + (e.code.length === 3 ? 4 : 0);
        if (e.low === expanded) score += 30;
      }
    }
    if (score > 0) scored.push({ ...e, score });
  }
  scored.sort((a, b) => b.score - a.score || a.code.localeCompare(b.code));
  return scored.slice(0, limit).map(({ code: c, title }) => ({ code: c, title }));
}

/**
 * The AI gave { code, name }. Return the official ICD-10 entry, or null if it isn't real.
 *  1. exact code   2. its 3-character category   3. search by the name
 */
function validate(rawCode, name) {
  const code = normalizeCode(rawCode);
  if (code && byCode.has(code)) return { code, title: byCode.get(code) };
  if (code && byCode.has(code.slice(0, 3))) return { code: code.slice(0, 3), title: byCode.get(code.slice(0, 3)) };
  const hit = search(name, 1)[0];
  return hit || null;
}

// ── our XGBoost model's 41 diseases → ICD-10 categories (for the cross-check) ──
const MODEL_TO_ICD = {
  AIDS: ["B20", "B21", "B22", "B23", "B24"],
  Acne: ["L70"],
  "Alcoholic hepatitis": ["K70"],
  Allergy: ["T78", "J30", "L50", "L23"],
  Arthritis: ["M05", "M06", "M08", "M13"],
  "Bronchial Asthma": ["J45", "J46"],
  "Cervical spondylosis": ["M47", "M50"],
  "Chicken pox": ["B01"],
  "Chronic cholestasis": ["K83", "K76", "K71"],
  "Common Cold": ["J00", "J06"],
  Dengue: ["A90", "A91", "A97"],
  Diabetes: ["E10", "E11", "E13", "E14"],
  "Drug Reaction": ["T88", "L27", "T50"],
  "Fungal infection": ["B35", "B36", "B37"],
  GERD: ["K21"],
  Gastroenteritis: ["A08", "A09", "K52"],
  "Heart attack": ["I21", "I22"],
  "Hemorrhoids (Piles)": ["I84", "K64"],
  "Hepatitis A": ["B15"],
  "Hepatitis B": ["B16", "B18"],
  "Hepatitis C": ["B17", "B18"],
  "Hepatitis D": ["B16", "B17", "B18"],
  "Hepatitis E": ["B17"],
  Hypertension: ["I10", "I11", "I12", "I13", "I15"],
  Hyperthyroidism: ["E05"],
  Hypoglycemia: ["E16"],
  Hypothyroidism: ["E01", "E02", "E03"],
  Impetigo: ["L01"],
  Jaundice: ["R17"],
  Malaria: ["B50", "B51", "B52", "B53", "B54"],
  Migraine: ["G43"],
  Osteoarthritis: ["M15", "M16", "M17", "M18", "M19"],
  "Paralysis (brain hemorrhage)": ["I60", "I61", "I62", "I63", "G81"],
  "Paroxysmal Positional Vertigo": ["H81"],
  "Peptic Ulcer Disease": ["K25", "K26", "K27"],
  Pneumonia: ["J12", "J13", "J14", "J15", "J16", "J18"],
  Psoriasis: ["L40"],
  Tuberculosis: ["A15", "A16", "A17", "A18", "A19"],
  Typhoid: ["A01"],
  "Urinary tract infection": ["N39", "N30"],
  "Varicose veins": ["I83"],
};

const COVERED = new Set(Object.values(MODEL_TO_ICD).flat());

/** Is this ICD code one of the 41 diseases our own model knows? */
const modelCovers = (code) => COVERED.has(String(code).slice(0, 3));

/** Does a model disease name match this ICD code? */
const modelMatches = (modelName, code) => (MODEL_TO_ICD[modelName] || []).includes(String(code).slice(0, 3));

module.exports = { search, validate, normalizeCode, modelCovers, modelMatches, MODEL_TO_ICD, count: codes.length };
