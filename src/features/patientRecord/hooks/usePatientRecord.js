// src/features/patientRecord/hooks/usePatientRecord.js
//
// Works out WHICH patient to show, then keeps everything about them live:
//   1. ?id=PT-0001 in the address bar                → that patient
//   2. patient just sent from the ID Scanner          → find by CNIC, or create new
//   3. the patient opened last in this browser tab    → same patient after a refresh
// Then it listens (real time) to the patient, their visits and medications,
// and opens today's visit for the logged-in doctor.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  resolvePatient,
  startTodayVisit,
  subscribeMedications,
  subscribePatient,
  subscribeVisits,
  updatePatient,
} from "../services/patientRecordService";
import { setCurrentPatientOnDevice } from "../services/vitalsService";

const CURRENT_KEY = "currentPatientId";

function readSession(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeSession(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage blocked — not critical */
  }
}

function friendlyError(err) {
  if (!err) return "";
  if (err.code === "permission-denied") {
    return "Firebase blocked this. Publish the rules from firestore.rules in Firebase Console → Firestore Database → Rules.";
  }
  if (err.code === "unavailable") {
    return "Can't reach the database. Check your internet connection.";
  }
  return err.message || "Something went wrong loading this record.";
}

export function usePatientRecord(doctor, doctorLoading = false) {
  const location = useLocation();

  const [patientId, setPatientId] = useState(null);
  const [resolveState, setResolveState] = useState("resolving"); // resolving | ready | none | error
  const [error, setError] = useState("");

  // undefined = still loading, null = not in the database
  const [patient, setPatient] = useState(undefined);
  const [visits, setVisits] = useState(null);
  const [medications, setMedications] = useState(null);
  const [currentVisitId, setCurrentVisitId] = useState(null);

  // ── 1. which patient? ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const urlId = new URLSearchParams(location.search).get("id");
      if (urlId) {
        writeSession(CURRENT_KEY, urlId);
        return urlId;
      }

      const fromScanner = location.state?.patient;
      if (fromScanner) {
        const { patientId: id } = await resolvePatient(fromScanner);
        writeSession(CURRENT_KEY, id);
        return id;
      }

      const remembered = readSession(CURRENT_KEY);
      if (remembered) return remembered;

      const scanned = readSession("scannedPatient");
      if (scanned) {
        const { patientId: id } = await resolvePatient(JSON.parse(scanned));
        writeSession(CURRENT_KEY, id);
        return id;
      }

      return null;
    }

    run()
      .then((id) => {
        if (cancelled) return;
        setPatientId(id);
        setResolveState(id ? "ready" : "none");
      })
      .catch((err) => {
        console.error("Could not open patient:", err);
        if (!cancelled) {
          setError(friendlyError(err));
          setResolveState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [location.search, location.state]);

  // ── 2. live data for that patient ──────────────────────────────────
  useEffect(() => {
    if (!patientId) return undefined;
    const onErr = (err) => {
      console.error(err);
      setError(friendlyError(err));
    };
    const unsubs = [
      subscribePatient(patientId, setPatient, onErr),
      subscribeVisits(patientId, setVisits, onErr),
      subscribeMedications(patientId, setMedications, onErr),
    ];
    return () => unsubs.forEach((u) => u());
  }, [patientId]);

  // ── 3. open today's visit + tell the sensors who's on the machine ──
  // (works without login too — the visit is then saved under "guest")
  useEffect(() => {
    if (!patientId || doctorLoading) return;
    const who = doctor?.uid ? doctor : { uid: "guest", fullName: "", specialization: "" };
    let cancelled = false;
    startTodayVisit(patientId, who)
      .then((id) => !cancelled && setCurrentVisitId(id))
      .catch((err) => console.error("Could not start visit:", err));
    setCurrentPatientOnDevice(patientId, who).catch((err) =>
      console.warn("Could not update device:", err)
    );
    return () => {
      cancelled = true;
    };
  }, [patientId, doctor, doctorLoading]);

  // ── 4. derived values for the screen ───────────────────────────────
  const previousVisits = useMemo(
    // only finished visits count as history (a consultation finished today shows up straight away)
    () => (visits || []).filter((v) => v.status !== "in-progress"),
    [visits, currentVisitId]
  );
  const lastVisit = previousVisits[0] || null;

  // "major issues" from the last visit → header badges (none on a first visit)
  const conditions = useMemo(
    () => (Array.isArray(lastVisit?.diagnoses) ? lastVisit.diagnoses.filter(Boolean) : []),
    [lastVisit]
  );

  const saveFields = useCallback(
    (fields) => (patientId ? updatePatient(patientId, fields) : Promise.resolve()),
    [patientId]
  );

  const isLoading =
    resolveState === "resolving" ||
    (resolveState === "ready" && (patient === undefined || visits === null || medications === null) && !error);

  let status = "ready";
  if (resolveState === "none") status = "no-patient";
  else if (resolveState === "error") status = "error";
  else if (isLoading) status = "loading";
  else if (patient === null) status = "not-found";

  return {
    status,
    error,
    patientId,
    patient,
    medications: medications || [],
    previousVisits,
    lastVisit,
    conditions,
    isFirstVisit: visits !== null && previousVisits.length === 0,
    currentVisitId,
    saveFields,
  };
}

export default usePatientRecord;
