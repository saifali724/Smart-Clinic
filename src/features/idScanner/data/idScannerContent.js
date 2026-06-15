// src/features/idScanner/data/idScannerContent.js

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
    token: "Patient 1",
    initials: "P1",
    time: "Checked in 5m ago",
    status: "Waiting",
  },
  {
    id: "#PT-2848",
    token: "Patient 2",
    initials: "P2",
    time: "Checked in 12m ago",
    status: "Waiting",
  },
  {
    id: "#PT-2849",
    token: "Patient 3",
    initials: "P3",
    time: "Checked in 18m ago",
    status: "Waiting",
  },
  {
    id: "#PT-2850",
    token: "Patient 4",
    initials: "P4",
    time: "Tomorrow, 10:00 AM",
    status: "Scheduled",
  },
  {
    id: "#PT-2851",
    token: "Patient 5",
    initials: "P5",
    time: "Tomorrow, 10:30 AM",
    status: "Scheduled",
  },
  {
    id: "#PT-2852",
    token: "Patient 6",
    initials: "P6",
    time: "Tomorrow, 11:00 AM",
    status: "Scheduled",
  },
];

export const scannerStats = [
  {
    value: "8",
    label: "Scanned",
    color: "#3CF3A7",
  },
  {
    value: "4",
    label: "In Queue",
    color: "#FFB020",
  },
  {
    value: "1,247",
    label: "Total Records",
    color: "#00C2E0",
  },
  {
    value: "12s",
    label: "Avg Scan Time",
    color: "#A78BFA",
  },
];

export const formFields = [
  {
    name: "fullName",
    label: "FULL NAME",
  },
  {
    name: "fatherName",
    label: "FATHER NAME",
  },
  {
    name: "gender",
    label: "GENDER",
  },
  {
    name: "cnic",
    label: "CNIC",
  },
  {
    name: "dateOfBirth",
    label: "DATE OF BIRTH",
  },
  {
    name: "age",
    label: "AGE",
  },
];