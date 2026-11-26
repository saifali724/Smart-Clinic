// src/features/patientRecord/hooks/useLiveVitals.js
// Listens to the sensors' live document and turns raw readings into what the
// Vitals card shows: value text, bar %, and whether the reading is live.

import { useEffect, useMemo, useRef, useState } from "react";
import { LIVE_WINDOW_MS, VITALS } from "../data/recordConfig";
import { subscribeLiveVitals } from "../services/vitalsService";
import { saveVisitVitals } from "../services/patientRecordService";
import { startSensorSimulation } from "../services/sensorSimulator";
import { toDate } from "../utils/format";

const SAVE_TO_VISIT_EVERY_MS = 15_000;

function readingTime(reading) {
  const d = toDate(reading?.updatedAt);
  return d ? d.getTime() : 0;
}

function num(value, decimals = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return decimals ? Number(n.toFixed(decimals)) : Math.round(n);
}

// raw sensor data → { text, barValue, time } for one vital
function present(key, raw) {
  const r = raw[key];
  if (!r) return null;

  switch (key) {
    case "bloodPressure": {
      const sys = num(r.systolic);
      const dia = num(r.diastolic);
      if (sys == null || dia == null) return null;
      return { text: `${sys}/${dia}`, barValue: sys, time: readingTime(r) };
    }
    case "temperature": {
      const v = num(r.value, 1);
      return v == null ? null : { text: v.toFixed(1), barValue: v, time: readingTime(r) };
    }
    case "weight": {
      const w = num(r.value, 1);
      if (w == null) return null;
      const h = num(raw.height?.value, 1);
      const bmi = h ? (w / (h / 100) ** 2).toFixed(1) : null;
      return {
        text: bmi ? `${w}kg / ${bmi}` : `${w}kg`,
        barValue: w,
        time: readingTime(r),
      };
    }
    default: {
      const v = num(r.value);
      return v == null ? null : { text: String(v), barValue: v, time: readingTime(r) };
    }
  }
}

export function useLiveVitals(patientId, visitId) {
  const [raw, setRaw] = useState({});
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const lastSavedRef = useRef(0);

  // 1. listen to the sensors' document
  useEffect(() => {
    if (!patientId) return undefined;
    const unsubscribe = subscribeLiveVitals(
      patientId,
      (data) => {
        setRaw(data);
        setError(null);
      },
      (err) => setError(err)
    );
    return unsubscribe;
  }, [patientId]);

  // 2. re-check every few seconds whether readings are still "live"
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  // 3. testing only: npm run dev + ?simulate=1
  useEffect(() => {
    if (!patientId || !import.meta.env.DEV) return undefined;
    if (new URLSearchParams(window.location.search).get("simulate") !== "1") return undefined;
    return startSensorSimulation(patientId);
  }, [patientId]);

  // 4. keep a copy of the latest readings on today's visit (at most every 15 s)
  useEffect(() => {
    if (!patientId || !visitId || Object.keys(raw).length === 0) return;
    const since = Date.now() - lastSavedRef.current;
    if (since < SAVE_TO_VISIT_EVERY_MS) return;
    lastSavedRef.current = Date.now();
    saveVisitVitals(patientId, visitId, raw).catch((err) =>
      console.warn("Could not save vitals to visit:", err)
    );
  }, [patientId, visitId, raw]);

  const vitals = useMemo(
    () =>
      VITALS.map((v) => {
        const p = present(v.key, raw);
        if (!p) return { ...v, status: "waiting", text: "--", percent: 0, time: 0 };
        const age = p.time ? now - p.time : Infinity;
        return {
          ...v,
          status: age <= LIVE_WINDOW_MS ? "live" : "stale",
          text: p.text,
          percent: Math.max(0, Math.min(100, (p.barValue / v.max) * 100)),
          time: p.time,
        };
      }),
    [raw, now]
  );

  const anyLive = vitals.some((v) => v.status === "live");

  return { vitals, anyLive, error };
}

export default useLiveVitals;
