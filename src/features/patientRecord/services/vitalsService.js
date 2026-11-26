// src/features/patientRecord/services/vitalsService.js
//
// LIVE VITALS FROM SENSORS
// ────────────────────────
// Every sensor (or the device/bridge they're connected to) writes its latest
// reading into ONE Firestore document:
//
//   patients/{patientId}/vitals/live
//
// The Patient Record screen listens to that document, so a new reading shows
// up on screen within about a second — no refresh needed.
//
// Format (each sensor only updates its own field; updatedAt = when measured):
//   {
//     bloodPressure: { systolic: 142, diastolic: 88, updatedAt: <timestamp> },
//     heartRate:     { value: 78,   updatedAt: <timestamp> },
//     glucose:       { value: 126,  updatedAt: <timestamp> },
//     spo2:          { value: 97,   updatedAt: <timestamp> },
//     temperature:   { value: 98.6, updatedAt: <timestamp> },   // °F
//     weight:        { value: 82,   updatedAt: <timestamp> },   // kg
//     height:        { value: 176 }                             // cm, optional → BMI
//   }
//
// Which patient is on the machine right now? The screen writes
//   devices/current = { patientId }
// when a record is opened, so a sensor bridge can read that and know where to write.

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export const liveVitalsRef = (patientId) => doc(db, "patients", patientId, "vitals", "live");

/** Listens to the live sensor document. Returns an unsubscribe function. */
export function subscribeLiveVitals(patientId, onData, onError) {
  return onSnapshot(
    liveVitalsRef(patientId),
    // "estimate" fills in updatedAt right away for readings still being saved
    (snap) => onData(snap.exists() ? snap.data({ serverTimestamps: "estimate" }) : {}),
    onError
  );
}

/** Tells the sensor bridge which patient is being examined now. */
export function setCurrentPatientOnDevice(patientId, doctor) {
  return setDoc(
    doc(db, "devices", "current"),
    { patientId, doctorId: doctor?.uid || "", startedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Writes one reading — the same call a sensor bridge would make.
 * e.g. writeVitalReading("PT-0001", "heartRate", { value: 78 })
 */
export function writeVitalReading(patientId, key, reading) {
  return setDoc(
    liveVitalsRef(patientId),
    { [key]: { ...reading, updatedAt: serverTimestamp() } },
    { merge: true }
  );
}
