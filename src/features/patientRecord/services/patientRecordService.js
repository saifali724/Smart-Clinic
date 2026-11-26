// src/features/patientRecord/services/patientRecordService.js
//
// All database work for the Patient Record screen (Cloud Firestore).
//
// Database layout
// ───────────────
// patients/{PT-0001}                     ← one document per patient (permanent ID)
//    fullName, fatherName, cnic, dateOfBirth, age, gender, bloodGroup,
//    phone, email, address, occupation, insuranceId, emergencyContact,
//    createdAt, updatedAt
// patients/{PT-0001}/visits/{2026-11-25_<doctorUid>}   ← one per day per doctor
//    date, doctorId, doctorName, specialization, status ("in-progress" | "completed"),
//    reason, diagnoses: ["Hypertensive", "Diabetic"], vitals: {...}
// patients/{PT-0001}/medications/{auto}   ← current & past medicines
//    name, schedule, active (true/false), startedAt
// patients/{PT-0001}/vitals/live          ← sensors write here (see vitalsService.js)
// cnicIndex/{3520212345679}               ← { patientId } — finds a patient by CNIC
// counters/patients                       ← { next } — gives new patients PT-0001, PT-0002 …

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { cnicDigits, todayKey } from "../utils/format";

const patientRef = (patientId) => doc(db, "patients", patientId);

// Fields that come from the CNIC scan
const CNIC_FIELDS = ["fullName", "fatherName", "gender", "cnic", "dateOfBirth", "age"];

function pickCnicFields(scanned) {
  const out = {};
  for (const key of CNIC_FIELDS) {
    if (scanned?.[key]) out[key] = String(scanned[key]).trim();
  }
  return out;
}

// React StrictMode runs effects twice in development; remember in-flight
// lookups so the same CNIC never creates two patients.
const pendingResolves = new Map();

/**
 * Finds the patient for a scanned CNIC, or creates a new one.
 *  - CNIC seen before  → returns the SAME permanent ID (returning patient)
 *  - new CNIC          → creates PT-xxxx (first visit)
 * Runs in a transaction, so two scans at once can't create duplicates.
 *
 * @returns {Promise<{ patientId: string, isNew: boolean }>}
 */
export function resolvePatient(scanned) {
  const digits = cnicDigits(scanned?.cnic);
  const key = digits || `no-cnic:${scanned?.fullName || ""}`;
  if (pendingResolves.has(key)) return pendingResolves.get(key);

  const work = runTransaction(db, async (tx) => {
    const fields = pickCnicFields(scanned);

    if (digits) {
      const indexRef = doc(db, "cnicIndex", digits);
      const indexSnap = await tx.get(indexRef);
      if (indexSnap.exists()) {
        const patientId = indexSnap.data().patientId;
        // refresh the CNIC details (e.g. a better scan), keep everything else
        tx.set(patientRef(patientId), { ...fields, updatedAt: serverTimestamp() }, { merge: true });
        return { patientId, isNew: false };
      }
    }

    // New patient → next permanent ID
    const counterRef = doc(db, "counters", "patients");
    const counterSnap = await tx.get(counterRef);
    const next = (counterSnap.exists() ? counterSnap.data().next : 0) + 1;
    const patientId = `PT-${String(next).padStart(4, "0")}`;

    tx.set(counterRef, { next }, { merge: true });
    tx.set(patientRef(patientId), {
      ...fields,
      phone: "",
      email: "",
      address: "",
      occupation: "",
      insuranceId: "",
      emergencyContact: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (digits) tx.set(doc(db, "cnicIndex", digits), { patientId });

    return { patientId, isNew: true };
  });

  pendingResolves.set(key, work);
  work.finally(() => setTimeout(() => pendingResolves.delete(key), 5000));
  return work;
}

/** Live patient document. Returns an unsubscribe function. */
export function subscribePatient(patientId, onData, onError) {
  return onSnapshot(
    patientRef(patientId),
    (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data({ serverTimestamps: "estimate" }) } : null),
    onError
  );
}

/** Saves edited personal-info fields (only the ones passed in). */
export function updatePatient(patientId, fields) {
  return updateDoc(patientRef(patientId), { ...fields, updatedAt: serverTimestamp() });
}

/**
 * Opens today's visit for this doctor (once per day — refreshing the page
 * doesn't create another one). Returns the visit ID.
 */
export async function startTodayVisit(patientId, doctor) {
  const visitId = `${todayKey()}_${doctor?.uid || "unknown"}`;
  const ref = doc(db, "patients", patientId, "visits", visitId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      date: serverTimestamp(),
      doctorId: doctor?.uid || "",
      doctorName: doctor?.fullName || "",
      specialization: doctor?.specialization || "",
      status: "in-progress",
      reason: "",
      diagnoses: [],
    });
  }
  return visitId;
}

/** Live list of all visits, newest first. */
export function subscribeVisits(patientId, onData, onError) {
  const q = query(collection(db, "patients", patientId, "visits"), orderBy("date", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) }))),
    onError
  );
}

/** Live list of current medicines (active !== false). */
export function subscribeMedications(patientId, onData, onError) {
  return onSnapshot(
    collection(db, "patients", patientId, "medications"),
    (snap) =>
      onData(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((m) => m.active !== false)
      ),
    onError
  );
}

/** Copies the latest sensor readings into today's visit, so they stay in the history. */
export function saveVisitVitals(patientId, visitId, vitals) {
  return updateDoc(doc(db, "patients", patientId, "visits", visitId), {
    vitals,
    vitalsSavedAt: serverTimestamp(),
  });
}
