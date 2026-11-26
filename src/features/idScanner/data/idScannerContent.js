// src/features/idScanner/data/idScannerContent.js

import { PRIORITY_LEVELS } from "../services/queueService";

export const emptyExtractedPatient = {
  fullName: "",
  fatherName: "",
  gender: "",
  cnic: "",
  dateOfBirth: "",
  age: "",
};

export const patientQueue = [
  {
    id: "#PT-2847",
    sequence: 1,
    token: "Patient 1",
    initials: "P1",
    priority: PRIORITY_LEVELS.NORMAL,
    time: "Checked in 22m ago",
    status: "Waiting",
  },
  {
    id: "#PT-2848",
    sequence: 2,
    token: "Patient 2",
    initials: "P2",
    priority: PRIORITY_LEVELS.CRITICAL,
    time: "Checked in 14m ago",
    status: "Waiting",
  },
  {
    id: "#PT-2849",
    sequence: 3,
    token: "Patient 3",
    initials: "P3",
    priority: PRIORITY_LEVELS.URGENT,
    time: "Checked in 9m ago",
    status: "Waiting",
  },
  {
    id: "#PT-2850",
    sequence: 4,
    token: "Patient 4",
    initials: "P4",
    priority: PRIORITY_LEVELS.NORMAL,
    time: "Checked in 3m ago",
    status: "Waiting",
  },
];

export const scannerStats = [
  { value: "8", label: "Scanned", color: "#32E293" },
  { value: "4", label: "In Queue", color: "#FF9E3D" },
  { value: "1,247", label: "Total Records", color: "#00BFD8" },
  { value: "12s", label: "Avg Scan Time", color: "#936AFF" },
];

export const connectedSensors = [
  { name: "NFC Reader", status: "Active", online: true },
  { name: "Camera (OCR)", status: "Active", online: true },
  { name: "Biometric Module", status: "Offline", online: false },
];

export const systemLog = [
  { time: "09:14:32", text: "NFC signal detected — card approaching sensor", tone: "muted" },
  { time: "09:14:33", text: "Barcode ID validated: #PT-2847", tone: "muted" },
  { time: "09:14:34", text: "Patient record fetched — Patient 1 (#PT-2847)", tone: "muted" },
  { time: "09:14:35", text: "Fields auto-populated ✓  Redirecting to record…", tone: "primary" },
];

export const formFields = [
  { name: "fullName", label: "FULL NAME" },
  { name: "fatherName", label: "FATHER NAME" },
  { name: "gender", label: "GENDER" },
  { name: "cnic", label: "CNIC" },
  { name: "dateOfBirth", label: "DATE OF BIRTH" },
  { name: "age", label: "AGE" },
];