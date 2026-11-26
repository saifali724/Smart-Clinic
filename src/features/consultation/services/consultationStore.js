// src/features/consultation/services/consultationStore.js
// Saves the consultation into today's visit:
//   patients/{patientId}/visits/{visitId}
//     transcript, symptoms, otherFindings, aiDiagnoses, diagnoses (doctor-confirmed),
//     insights, orders, status, durationSec, endedAt

import { arrayUnion, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const visitRef = (patientId, visitId) => doc(db, "patients", patientId, "visits", visitId);

/** Saved every few seconds while the consultation runs (nothing is lost on a crash). */
export function saveProgress(patientId, visitId, data) {
  return updateDoc(visitRef(patientId, visitId), { ...data, consultationUpdatedAt: serverTimestamp() });
}

/** Quick actions: "Order ECG", "Request Labs" … */
export function addOrder(patientId, visitId, order) {
  return updateDoc(visitRef(patientId, visitId), {
    orders: arrayUnion({ ...order, at: new Date().toISOString() }),
  });
}

/** End Session — the visit becomes part of the patient's history. */
export function completeVisit(patientId, visitId, data) {
  return updateDoc(visitRef(patientId, visitId), {
    ...data,
    status: "completed",
    endedAt: serverTimestamp(),
  });
}
