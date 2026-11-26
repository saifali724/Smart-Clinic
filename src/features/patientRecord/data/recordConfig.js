// src/features/patientRecord/data/recordConfig.js
// Everything the Patient Record screen needs that is "settings", not data:
// colours from the Figma file, the personal-info fields, the vitals list and
// the action bar. Change things here instead of inside the components.

export const COLORS = {
  page: "#0C0F18",
  panel: "#141824",
  raised: "#1A1F2E",
  border: "#2E3852",
  cyan: "#00BFD8",
  text: "#EDF2FC",
  muted: "#8C99B8",
  faint: "#596685",
  green: "#32E293",
  orange: "#FF9E3D",
  red: "#FF6060",
  purple: "#936AFF",
};

// Personal Information card — exactly the 8 fields in the Figma design.
// fullName + cnic come from the CNIC scan; the doctor fills in the rest.
export const PERSONAL_FIELDS = [
  { name: "fullName", label: "FULL NAME", placeholder: "From CNIC scan" },
  { name: "cnic", label: "CNIC", placeholder: "From CNIC scan" },
  { name: "phone", label: "PHONE", placeholder: "Add phone number", type: "tel" },
  { name: "email", label: "EMAIL", placeholder: "Add email address", type: "email" },
  { name: "address", label: "ADDRESS", placeholder: "Add home address" },
  { name: "occupation", label: "OCCUPATION", placeholder: "Add occupation" },
  { name: "insuranceId", label: "INSURANCE ID", placeholder: "Add insurance ID" },
  { name: "emergencyContact", label: "EMERGENCY", placeholder: "Name (phone number)" },
];

// Vitals card — order, colours and units from Figma.
// `max` sets how full the bar is: value / max (Figma's sample values give the same widths).
export const VITALS = [
  { key: "bloodPressure", label: "Blood Pressure", unit: "mmHg", color: COLORS.orange, max: 220 },
  { key: "heartRate", label: "Heart Rate", unit: "bpm", color: COLORS.green, max: 100 },
  { key: "glucose", label: "Blood Glucose", unit: "mg/dL", color: COLORS.red, max: 230 },
  { key: "spo2", label: "SpO₂", unit: "%", color: COLORS.cyan, max: 100 },
  { key: "temperature", label: "Temperature", unit: "°F", color: COLORS.text, max: 110 },
  { key: "weight", label: "Weight / BMI", unit: "", color: COLORS.purple, max: 120 },
];

// A reading older than this is shown as "last reading" instead of "live".
export const LIVE_WINDOW_MS = 30_000;

// Condition badge colours. Known conditions use the Figma colours,
// anything else cycles through the palette.
export const BADGE_COLORS = {
  active: COLORS.green,
  hypertensive: COLORS.orange,
  hypertension: COLORS.orange,
  diabetic: COLORS.red,
  diabetes: COLORS.red,
  "cardiac risk": COLORS.purple,
};
export const BADGE_FALLBACK = [COLORS.cyan, COLORS.orange, COLORS.red, COLORS.purple];

// Medication accent bars cycle through these (Figma order).
export const MEDICATION_COLORS = [COLORS.orange, COLORS.purple, COLORS.cyan, COLORS.green];

// Bottom action bar — same 5 actions and positions as Figma, no emojis.
export const ACTIONS = [
  { id: "consultation", label: "Start Consultation", accent: true },
  { id: "prescriptions", label: "All Prescriptions" },
  { id: "print", label: "Print Record" },
  { id: "edit", label: "Edit Record" },
  { id: "share", label: "Share Record" },
];
