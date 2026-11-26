// src/features/consultation/hooks/useConsultation.js
//
// Everything behind the Live Consultation screen:
//   • which patient / doctor / today's visit
//   • microphone → 12-second clips → Gemini (English, Dr/Patient) → live transcript
//   • transcript + live vitals → AI analysis (symptoms, our model's diagnoses %, insights)
//   • audio level bars, timer, camera, quick actions, doctor confirmations
//   • End Session → everything saved into the visit

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentDoctor } from "../../patientRecord/hooks/useCurrentDoctor";
import { startTodayVisit, subscribePatient, subscribeVisits } from "../../patientRecord/services/patientRecordService";
import { subscribeLiveVitals } from "../../patientRecord/services/vitalsService";
import { formatDate, shortDoctorName } from "../../patientRecord/utils/format";
import { analyzeConsultation, checkServices, transcribeClip, transcribeTurns } from "../services/consultApi";
import { addOrder, completeVisit, saveProgress } from "../services/consultationStore";
import { encodeWav, pickRecorderMime, toWav16k } from "../utils/audio";
import { DualMicRecorder, SAMPLE_RATE, resampleTo16k, segmentTurns } from "../utils/dualMic";
import { useLiveCaptions } from "./useLiveCaptions";

const CLIP_MS = 10_000; // length of each audio clip sent to Gemini (live captions fill the gap)
const SILENCE_RMS = 0.006; // quieter clips are not sent (saves Gemini quota)
const ANALYZE_EVERY_MS = 18_000; // AI analysis at most this often (keeps within the free Gemini quota)
const SAVE_EVERY_MS = 8_000;
const BARS = 31;

const dxKey = (d) => d.icd10 || d.key || d.name;
const slim = (d, source, extra = {}) => ({
  key: dxKey(d),
  name: d.name,
  icd10: d.icd10 || null,
  icdTitle: d.icdTitle || null,
  source,
  ...extra,
});

const withoutKey = (d) => {
  const copy = { ...d };
  delete copy.key;
  return copy;
};

// 1 or 2 microphones — remembered on this computer
const MIC_KEY = "mediscan.micSetup";
function readMicSetup() {
  try {
    return JSON.parse(localStorage.getItem(MIC_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function readSession(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useConsultation() {
  const { doctor, isLoading: doctorLoading } = useCurrentDoctor();

  // ── patient + history + vitals ─────────────────────────────────────
  const patientId = useMemo(
    () => new URLSearchParams(window.location.search).get("id") || readSession("currentPatientId"),
    []
  );
  const [patient, setPatient] = useState(undefined);
  const [visits, setVisits] = useState([]);
  const [vitals, setVitals] = useState({});
  const [visitId, setVisitId] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!patientId) return undefined;
    const onErr = (err) => setLoadError(err.message || "Couldn't load the patient.");
    const unsubs = [
      subscribePatient(patientId, setPatient, onErr),
      subscribeVisits(patientId, setVisits, onErr),
      subscribeLiveVitals(patientId, setVitals, () => {}),
    ];
    return () => unsubs.forEach((u) => u());
  }, [patientId]);

  useEffect(() => {
    if (!patientId || doctorLoading) return;
    const who = doctor?.uid ? doctor : { uid: "guest", fullName: "", specialization: "" };
    startTodayVisit(patientId, who).then(setVisitId).catch((err) => setLoadError(err.message));
  }, [patientId, doctor, doctorLoading]);

  const previousVisit = useMemo(
    () => visits.find((v) => v.id !== visitId && v.status !== "in-progress") || null,
    [visits, visitId]
  );

  const doctorName = doctor?.fullName ? shortDoctorName(doctor.fullName) : "Doctor";
  const patientName = patient?.fullName || "Patient";

  // ── session state ──────────────────────────────────────────────────
  const [status, setStatus] = useState("idle"); // idle | running | paused | ending | ended
  const [seconds, setSeconds] = useState(0);
  const [lines, setLines] = useState([]); // [{ id, speaker, text, at }]
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // doctor's decisions on the AI suggestions
  const [finalDx, setFinalDx] = useState([]); // [{ key, name, icd10, icdTitle, source: "ai"|"edited"|"added", aiName? }]
  const [rejected, setRejected] = useState([]); // AI suggestions the doctor removed: [{ key, name, icd10 }]

  const [services, setServices] = useState({ backend: "checking", model: "checking" });
  const [micSilent, setMicSilent] = useState(false); // mic gives no sound for a while
  const [clipStats, setClipStats] = useState({ sent: 0, silent: 0 });
  const [levels, setLevels] = useState(() => Array(BARS).fill(0));
  const [speaking, setSpeaking] = useState(false);
  const [camOn, setCamOn] = useState(false);

  // ── microphone setup: 1 mic (AI decides speaker) or 2 mics (doctor mic + patient mic) ──
  const [micMode, setMicMode] = useState(() => (readMicSetup().mode === "dual" ? "dual" : "single"));
  const [doctorMicId, setDoctorMicId] = useState(() => readMicSetup().doctor || "");
  const [patientMicId, setPatientMicId] = useState(() => readMicSetup().patient || "");
  const [micDevices, setMicDevices] = useState([]); // [{ id, label }]
  const [activeSpeaker, setActiveSpeaker] = useState(null); // 2-mic mode: "doctor" | "patient" | null
  const speakerHistoryRef = useRef([]); // [{ t, speaker }] last 2 s, from the two mic levels
  const micModeRef = useRef(micMode);

  useEffect(() => {
    micModeRef.current = micMode;
    try {
      localStorage.setItem(MIC_KEY, JSON.stringify({ mode: micMode, doctor: doctorMicId, patient: patientMicId }));
    } catch {
      /* private mode — fine */
    }
  }, [micMode, doctorMicId, patientMicId]);

  const loadMicDevices = useCallback(async (askPermission = false) => {
    try {
      if (askPermission) {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach((t) => t.stop());
      }
      const all = await navigator.mediaDevices.enumerateDevices();
      const mics = all
        .filter((d) => d.kind === "audioinput" && d.deviceId && d.deviceId !== "default" && d.deviceId !== "communications")
        .map((d, i) => ({ id: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
      setMicDevices(mics);
      return mics;
    } catch {
      setError("Microphone access was blocked. Allow the microphone in the browser and try again.");
      return [];
    }
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return undefined;
    const onChange = () => loadMicDevices(false);
    const first = setTimeout(onChange, 0);
    navigator.mediaDevices.addEventListener?.("devicechange", onChange);
    return () => {
      clearTimeout(first);
      navigator.mediaDevices.removeEventListener?.("devicechange", onChange);
    };
  }, [loadMicDevices]);

  /** who has been louder over the last ~2 s (2-mic mode) — used to label live captions */
  const speakerNow = useCallback(() => {
    if (micModeRef.current !== "dual") return null;
    const since = performance.now() - 2000;
    let doc = 0;
    let pat = 0;
    for (const h of speakerHistoryRef.current) {
      if (h.t < since) continue;
      if (h.speaker === "doctor") doc += 1;
      else pat += 1;
    }
    if (!doc && !pat) return null;
    return doc >= pat ? "doctor" : "patient";
  }, []);

  const live = useLiveCaptions({ getSpeaker: speakerNow }); // instant word-by-word captions
  const { start: startCaptions, stop: stopCaptions, dropUntil } = live;
  const captionsRef = useRef({ captions: [], interim: "" });
  useEffect(() => {
    captionsRef.current = { captions: live.captions, interim: live.interim };
  }, [live.captions, live.interim]);

  const streamRef = useRef(null);
  const camStreamRef = useRef(null);
  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const clipTimerRef = useRef(null);
  const recordingRef = useRef(false);
  const queueRef = useRef(Promise.resolve());
  const linesRef = useRef([]);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const recordClipRef = useRef(null); // lets each clip start the next one
  const allStreamsRef = useRef([]); // every microphone stream in use
  const dualRef = useRef(null); // DualMicRecorder in 2-mic mode
  const dualClipRef = useRef(null);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  // timer
  useEffect(() => {
    if (status !== "running" && status !== "paused") return undefined;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // backend + AI model status (checked now and every 20 s)
  useEffect(() => {
    let alive = true;
    const check = () => checkServices().then((s) => alive && setServices(s));
    check();
    const t = setInterval(check, 20_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  // toast auto-hide
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // ── audio clip → transcript ────────────────────────────────────────
  const recentText = () =>
    linesRef.current
      .slice(-10)
      .map((l) => `${l.speaker === "patient" ? "Patient" : "Doctor"}: ${l.text}`)
      .join("\n");

  const addSegments = (segments) => {
    if (!segments.length) return;
    const now = Date.now();
    setLines((prev) => [...prev, ...segments.map((s, i) => ({ id: `${now}-${i}`, speaker: s.speaker, text: s.text, at: now }))]);
  };

  /** what the live captions heard between two moments (sent to Gemini so it can't invent things) */
  const heardBetween = (from, to) => {
    const { captions, interim } = captionsRef.current;
    return [...captions.filter((c) => c.at > from - 1500 && c.at <= to).map((c) => c.text), interim]
      .filter(Boolean)
      .join(" ")
      .trim();
  };

  // 2-mic mode: split by microphone → turns with a KNOWN speaker → Gemini writes the English text
  const processDualClip = useCallback(
    async (clip, heard) => {
      try {
        let { doctor, patient } = clip;
        if (clip.rate !== SAMPLE_RATE) {
          doctor = resampleTo16k(doctor, clip.rate);
          patient = resampleTo16k(patient, clip.rate);
        }
        const turns = segmentTurns(doctor, patient).filter((t) => t.rms >= SILENCE_RMS);
        if (!turns.length) {
          setClipStats((c) => ({ ...c, silent: c.silent + 1 }));
          dropUntil(clip.endedAt);
          return;
        }
        setClipStats((c) => ({ ...c, sent: c.sent + 1 }));
        setIsTranscribing(true);
        const segments = await transcribeTurns(
          turns.map((t) => ({ speaker: t.speaker, wav: encodeWav(t.samples, SAMPLE_RATE) })),
          { doctorName, patientName, recent: recentText(), heard }
        );
        addSegments(segments);
        dropUntil(clip.endedAt);
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsTranscribing(false);
      }
    },
    [doctorName, patientName, dropUntil]
  );

  useEffect(() => {
    dualClipRef.current = (clip) => {
      const heard = heardBetween(clip.startedAt, clip.endedAt);
      queueRef.current = queueRef.current.then(() => processDualClip(clip, heard));
    };
  }, [processDualClip]);

  const processClip = useCallback(
    async (blob, endedAt, heard) => {
      try {
        const { wav, rms } = await toWav16k(blob);
        if (rms < SILENCE_RMS) {
          setClipStats((c) => ({ ...c, silent: c.silent + 1 })); // silence — don't spend a Gemini call
          dropUntil(endedAt);
          return;
        }
        setClipStats((c) => ({ ...c, sent: c.sent + 1 }));
        setIsTranscribing(true);
        const lastSpeaker = linesRef.current.at(-1)?.speaker || "";
        const segments = await transcribeClip(wav, { doctorName, patientName, recent: recentText(), heard, lastSpeaker });
        addSegments(segments);
        dropUntil(endedAt); // the clean Gemini lines now replace the live captions of this clip
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsTranscribing(false);
      }
    },
    [doctorName, patientName, dropUntil]
  );

  const recordClip = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || !recordingRef.current) return;
    const mimeType = pickRecorderMime();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const parts = [];
    const startedAt = Date.now();
    recorder.ondataavailable = (e) => e.data && e.data.size && parts.push(e.data);
    recorder.onstop = () => {
      if (parts.length) {
        const blob = new Blob(parts, { type: recorder.mimeType || mimeType });
        const endedAt = Date.now();
        // what the live captions heard during this clip → sent along so Gemini can't invent things
        const heard = heardBetween(startedAt, endedAt);
        queueRef.current = queueRef.current.then(() => processClip(blob, endedAt, heard)); // one at a time, in order
      }
      if (recordingRef.current) recordClipRef.current?.(); // next clip
    };
    recorder.start();
    recorderRef.current = recorder;
    clipTimerRef.current = setTimeout(() => recorder.state !== "inactive" && recorder.stop(), CLIP_MS);
  }, [processClip]);

  useEffect(() => {
    recordClipRef.current = recordClip;
  }, [recordClip]);

  const stopRecording = useCallback(() => {
    recordingRef.current = false;
    clearTimeout(clipTimerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    dualRef.current?.pause(); // 2-mic mode: hands over the last part
  }, []);

  const resumeRecording = useCallback(() => {
    recordingRef.current = true;
    if (dualRef.current) dualRef.current.start({ clipMs: CLIP_MS, onClip: (clip) => dualClipRef.current?.(clip) });
    else recordClip();
  }, [recordClip]);

  // ── audio level bars ───────────────────────────────────────────────
  const startMeter = useCallback((streams) => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const analysers = streams.map((stream) => {
      const a = ctx.createAnalyser();
      a.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(a);
      return a;
    });
    audioCtxRef.current = ctx;
    const data = new Uint8Array(512);
    const level = (a) => {
      a.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      return Math.sqrt(sum / data.length);
    };
    let history = Array(BARS).fill(0);
    let last = 0;
    let loudFrames = 0;
    let lastLoudAt = performance.now();
    let silentShown = false;
    let shownSpeaker = null;

    const tick = (now) => {
      rafRef.current = requestAnimationFrame(tick);
      if (now - last < 70) return; // ~14 updates per second
      last = now;
      const rmsList = analysers.map(level);
      const rms = Math.max(...rmsList);
      history = [...history.slice(1), Math.min(1, rms * 6)];
      setLevels(history);
      loudFrames = rms > 0.02 ? Math.min(loudFrames + 1, 6) : Math.max(loudFrames - 1, 0);
      setSpeaking(loudFrames >= 2);

      // 2 mics: the louder one is the person speaking
      if (rmsList.length === 2) {
        const who = rms > 0.02 ? (rmsList[0] >= rmsList[1] ? "doctor" : "patient") : null;
        if (who) speakerHistoryRef.current = [...speakerHistoryRef.current.filter((h) => h.t > now - 2000), { t: now, speaker: who }];
        const show = loudFrames >= 2 ? who || shownSpeaker : null;
        if (show !== shownSpeaker) {
          shownSpeaker = show;
          setActiveSpeaker(show);
        }
      }

      // no sound at all for 6 s → probably muted / wrong microphone
      if (rms > 0.01) lastLoudAt = now;
      const silent = now - lastLoudAt > 6000;
      if (silent !== silentShown) {
        silentShown = silent;
        setMicSilent(silent);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopMeter = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLevels(Array(BARS).fill(0));
    setSpeaking(false);
    setMicSilent(false);
    setActiveSpeaker(null);
    speakerHistoryRef.current = [];
  }, []);

  // ── start / pause / resume ─────────────────────────────────────────
  const startSession = useCallback(async () => {
    setError("");
    try {
      if (micMode === "dual") {
        if (!doctorMicId || !patientMicId || doctorMicId === patientMicId) {
          setError("2-microphone mode: choose a different microphone for the doctor and for the patient.");
          return;
        }
        // no auto-gain / echo cancellation — we need the real loudness of each mic
        const open = (id) =>
          navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: id }, echoCancellation: false, autoGainControl: false, noiseSuppression: true, channelCount: 1 },
          });
        const doctorStream = await open(doctorMicId);
        const patientStream = await open(patientMicId);
        allStreamsRef.current = [doctorStream, patientStream];
        startMeter([doctorStream, patientStream]);
        dualRef.current = new DualMicRecorder(doctorStream, patientStream);
        recordingRef.current = true;
        dualRef.current.start({ clipMs: CLIP_MS, onClip: (clip) => dualClipRef.current?.(clip) });
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
        });
        streamRef.current = stream;
        allStreamsRef.current = [stream];
        startMeter([stream]);
        recordingRef.current = true;
        recordClip();
      }
      startCaptions();
      setStatus("running");
    } catch (err) {
      console.error(err);
      setError(
        err?.name === "OverconstrainedError" || err?.name === "NotFoundError"
          ? "A chosen microphone isn't connected. Plug it in and pick it again."
          : "Microphone access was blocked. Allow the microphone in the browser and try again."
      );
    }
  }, [micMode, doctorMicId, patientMicId, recordClip, startMeter, startCaptions]);

  const toggleMic = useCallback(() => {
    if (status === "running") {
      stopRecording();
      stopCaptions();
      allStreamsRef.current.forEach((s) => s.getAudioTracks().forEach((t) => (t.enabled = false)));
      setStatus("paused");
    } else if (status === "paused") {
      allStreamsRef.current.forEach((s) => s.getAudioTracks().forEach((t) => (t.enabled = true)));
      resumeRecording();
      startCaptions();
      setStatus("running");
    }
  }, [status, stopRecording, resumeRecording, startCaptions, stopCaptions]);

  const toggleCam = useCallback(async () => {
    if (camOn) {
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
      setCamOn(false);
      return;
    }
    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } });
      camStreamRef.current = cam;
      setCamOn(true);
    } catch {
      setToast("Camera access was blocked");
    }
  }, [camOn]);

  useEffect(() => {
    if (camOn && videoRef.current && camStreamRef.current) {
      videoRef.current.srcObject = camStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [camOn]);

  // release everything when leaving the page
  useEffect(
    () => () => {
      recordingRef.current = false;
      clearTimeout(clipTimerRef.current);
      try {
        recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
      } catch {
        /* ignore */
      }
      dualRef.current?.close();
      allStreamsRef.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close().catch(() => {});
    },
    []
  );

  // ── AI analysis (throttled) ────────────────────────────────────────
  const lastAnalyzeRef = useRef(0);
  const analyzeTimerRef = useRef(null);
  const patientAge = patient?.age || null;
  const patientGender = patient?.gender || null;
  const runAnalysis = useCallback(async () => {
    lastAnalyzeRef.current = Date.now();
    setIsAnalyzing(true);
    try {
      const result = await analyzeConsultation({
        transcript: linesRef.current.map(({ speaker, text }) => ({ speaker, text })),
        vitals,
        patient: { age: patientAge, gender: patientGender },
        previousDiagnoses: previousVisit?.diagnoses || [],
        previousVisitDate: previousVisit ? formatDate(previousVisit.date) : null,
      });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [vitals, previousVisit, patientAge, patientGender]);

  useEffect(() => {
    if (status === "idle" || status === "ended") return undefined;
    const wait = Math.max(2500, ANALYZE_EVERY_MS - (Date.now() - lastAnalyzeRef.current));
    clearTimeout(analyzeTimerRef.current);
    analyzeTimerRef.current = setTimeout(runAnalysis, lastAnalyzeRef.current ? wait : 500);
    return () => clearTimeout(analyzeTimerRef.current);
  }, [lines.length, vitals, status, runAnalysis]);

  // ── keep the visit saved while talking ────────────────────────────
  const summary = useCallback(
    () => ({
      transcript: linesRef.current.map(({ speaker, text, at }) => ({ speaker, text, at })),
      symptoms: (analysis?.symptoms || []).map((s) => s.label),
      otherFindings: analysis?.otherFindings || [],
      aiDiagnoses: (analysis?.diagnoses || []).map((d) => ({
        name: d.name,
        icd10: d.icd10 || null,
        probability: d.probability,
        agreement: d.agreement || null,
      })),
      insights: (analysis?.insights || []).map((i) => i.text),
      compliance: analysis?.compliance || "unknown",
      durationSec: seconds,
      micMode, // "dual" = speaker labels came from two microphones
    }),
    [analysis, seconds, micMode]
  );

  const lastSaveRef = useRef(0);
  useEffect(() => {
    if (!patientId || !visitId || status === "idle" || status === "ended") return;
    if (Date.now() - lastSaveRef.current < SAVE_EVERY_MS) return;
    lastSaveRef.current = Date.now();
    saveProgress(patientId, visitId, summary()).catch((err) => console.warn("autosave failed", err));
  }, [lines, analysis, patientId, visitId, status, summary]);

  // ── doctor actions ─────────────────────────────────────────────────
  /** wrong label? tap the name on a bubble → Doctor ↔ Patient (also teaches the next clips) */
  const swapSpeaker = useCallback((id) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, speaker: l.speaker === "patient" ? "doctor" : "patient", fixed: true } : l)));
  }, []);

  /** tick: AI suggestion → confirmed (tap again to undo) */
  const confirmDx = useCallback((d) => {
    const key = dxKey(d);
    setFinalDx((prev) => (prev.some((x) => x.key === key) ? prev.filter((x) => x.key !== key) : [...prev, slim(d, "ai")]));
    setRejected((prev) => prev.filter((x) => x.key !== key));
  }, []);

  /** AI suggestion is wrong → remove it (kept in the record as "rejected" to measure AI accuracy) */
  const removeDx = useCallback((d) => {
    const key = dxKey(d);
    setFinalDx((prev) => prev.filter((x) => x.key !== key));
    if (d.source === "ai" || d.source === "model" || !d.source) {
      setRejected((prev) => (prev.some((x) => x.key === key) ? prev : [...prev, { key, name: d.name, icd10: d.icd10 || null }]));
    }
  }, []);

  /** doctor edits a suggestion → picks the right ICD-10 disease; it is confirmed straight away */
  const editDx = useCallback((d, picked) => {
    const oldKey = dxKey(d);
    const item = slim({ name: picked.name || picked.title, icd10: picked.code, icdTitle: picked.title }, "edited", {
      aiName: d.aiName || d.name,
      aiIcd10: d.aiIcd10 || d.icd10 || null,
    });
    setFinalDx((prev) => [...prev.filter((x) => x.key !== oldKey && x.key !== item.key), item]);
    if (d.source !== "added") {
      setRejected((prev) => (prev.some((x) => x.key === oldKey) ? prev : [...prev, { key: oldKey, name: d.name, icd10: d.icd10 || null }]));
    }
  }, []);

  /** doctor adds a diagnosis the AI didn't suggest */
  const addDx = useCallback((picked) => {
    const item = slim({ name: picked.name || picked.title, icd10: picked.code, icdTitle: picked.title }, "added");
    setFinalDx((prev) => [...prev.filter((x) => x.key !== item.key), item]);
    setRejected((prev) => prev.filter((x) => x.key !== item.key));
  }, []);

  // saved into the visit: names (= patient badges) + full details for the report / prescription
  const diagnosisFields = useCallback(
    () => ({
      diagnoses: finalDx.map((d) => d.name),
      diagnosisDetails: finalDx.map(withoutKey),
      rejectedAiDiagnoses: rejected.map(withoutKey),
    }),
    [finalDx, rejected]
  );

  // what the doctor sees: confirmed first, then AI suggestions still open
  const dxView = useMemo(() => {
    const ai = analysis?.diagnoses || [];
    const finalKeys = new Set(finalDx.map((x) => x.key));
    const hidden = new Set(rejected.map((x) => x.key));
    const confirmedCards = finalDx.map((f) => {
      const fromAi = ai.find((d) => dxKey(d) === f.key);
      return { ...(fromAi || {}), ...f, confirmed: true };
    });
    const open = ai.filter((d) => !finalKeys.has(dxKey(d)) && !hidden.has(dxKey(d))).map((d) => ({ ...d, confirmed: false }));
    return [...confirmedCards, ...open];
  }, [analysis, finalDx, rejected]);

  const quickAction = useCallback(
    async (type) => {
      const labels = { ecg: "ECG ordered", labs: "Lab tests requested" };
      if (type === "rx") {
        if (!finalDx.length) {
          setToast("Confirm or edit at least one diagnosis first");
          return;
        }
        try {
          if (patientId && visitId) await saveProgress(patientId, visitId, diagnosisFields());
        } catch (err) {
          setToast(`Couldn't save: ${err.message}`);
          return;
        }
        setToast("Diagnosis saved — Prescription screen comes in the next step");
        return;
      }
      if (patientId && visitId) {
        try {
          await addOrder(patientId, visitId, { type, by: doctor?.fullName || "guest" });
        } catch (err) {
          setToast(`Couldn't save: ${err.message}`);
          return;
        }
      }
      setToast(labels[type]);
    },
    [patientId, visitId, doctor, finalDx, diagnosisFields]
  );

  const endSession = useCallback(async () => {
    if (!patientId || !visitId) return false;
    setStatus("ending");
    stopRecording();
    stopCaptions();
    stopMeter();
    // wait (max 12 s) for the last clip to be transcribed
    await Promise.race([queueRef.current, new Promise((r) => setTimeout(r, 12_000))]);
    dualRef.current?.close();
    dualRef.current = null;
    allStreamsRef.current.forEach((st) => st.getTracks().forEach((t) => t.stop()));
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    setCamOn(false);
    try {
      const s = summary();
      await completeVisit(patientId, visitId, {
        ...s,
        ...diagnosisFields(), // only what the doctor confirmed becomes the patient's diagnosis
        reason: finalDx.length ? finalDx.map((d) => d.name).join(", ") : s.symptoms.slice(0, 2).join(", ") || "Consultation",
        vitalsAtVisit: vitals,
      });
      setStatus("ended");
      return true;
    } catch (err) {
      setError(`Couldn't save the session: ${err.message}`);
      setStatus("paused");
      return false;
    }
  }, [patientId, visitId, stopRecording, stopCaptions, stopMeter, summary, diagnosisFields, finalDx, vitals]);

  return {
    patientId,
    patient,
    patientName,
    doctor,
    doctorName,
    loadError,
    status,
    seconds,
    lines,
    isTranscribing,
    error,
    toast,
    analysis,
    isAnalyzing,
    dxView,
    finalDx,
    levels,
    speaking,
    services,
    micSilent: micSilent && status === "running",
    clipStats,
    camOn,
    videoRef,
    live: {
      supported: live.supported,
      blocked: live.blocked,
      lang: live.lang,
      setLang: live.setLang,
      captions: live.captions,
      interim: live.interim,
      interimSpeaker: live.interimSpeaker,
    },
    startSession,
    toggleMic,
    toggleCam,
    swapSpeaker,
    activeSpeaker,
    mic: {
      mode: micMode,
      setMode: setMicMode,
      devices: micDevices,
      doctorId: doctorMicId,
      setDoctorId: setDoctorMicId,
      patientId: patientMicId,
      setPatientId: setPatientMicId,
      loadDevices: loadMicDevices,
    },
    confirmDx,
    removeDx,
    editDx,
    addDx,
    quickAction,
    endSession,
    dismissError: () => setError(""),
  };
}

export default useConsultation;
