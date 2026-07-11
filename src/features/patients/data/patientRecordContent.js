// src/features/patients/data/patientRecordContent.js

export const defaultVitals = [
  { key: "bp", label: "Blood Pressure", value: "0/0", unit: "mmHg", color: "#ff9e3d", fillPx: 0 },
  { key: "hr", label: "Heart Rate", value: "0", unit: "bpm", color: "#32e293", fillPx: 0 },
  { key: "glucose", label: "Blood Glucose", value: "0", unit: "mg/dL", color: "#ff6060", fillPx: 0 },
  { key: "spo2", label: "SpO₂", value: "0", unit: "%", color: "#00bfd8", fillPx: 0 },
  { key: "temp", label: "Temperature", value: "0", unit: "°F", color: "#edf2fc", fillPx: 0 },
  { key: "weight", label: "Weight / BMI", value: "0 / 0", unit: "", color: "#936aff", fillPx: 0 },
];

export const emptyPersonalInfo = {
  fullName: "",
  fatherName: "",
  cnic: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  occupation: "",
  insuranceId: "",
  emergencyContact: "",
};

export const personalInfoFields = [
  { name: "fullName", label: "FULL NAME" },
  { name: "cnic", label: "CNIC" },
  { name: "phone", label: "PHONE" },
  { name: "email", label: "EMAIL" },
  { name: "address", label: "ADDRESS" },
  { name: "occupation", label: "OCCUPATION" },
  { name: "insuranceId", label: "INSURANCE ID" },
  { name: "emergencyContact", label: "EMERGENCY" },
];

export const conditionBadges = [
  { label: "Active", border: "#32e293", bg: "rgba(50,226,147,0.15)", text: "#32e293" },
  { label: "Hypertensive", border: "#ff9e3d", bg: "rgba(255,158,61,0.15)", text: "#ff9e3d" },
  { label: "Diabetic", border: "#ff6060", bg: "rgba(255,96,96,0.15)", text: "#ff6060" },
  { label: "Cardiac Risk", border: "#936aff", bg: "rgba(147,106,255,0.15)", text: "#936aff" },
];

export const actionBarItems = [
  { label: "📋  Start Consultation", accent: true, route: "/consultation" },
  { label: "💊  All Prescriptions", accent: false, route: null },
  { label: "🖨  Print Record", accent: false, route: null },
  { label: "✏️  Edit Record", accent: false, route: null },
  { label: "📧  Share Record", accent: false, route: null },
];