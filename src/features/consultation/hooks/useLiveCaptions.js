// src/features/consultation/hooks/useLiveCaptions.js
//
// INSTANT live captions while people speak (word by word), using the browser's own speech
// recognition (Chrome / Edge). No Gemini quota is used for this.
//
// The captions are a "first draft": a few seconds later Gemini returns the clean English
// transcript with Doctor / Patient labels for that clip, and the caption text it covers is removed
// (dropUntil). So the screen always shows something the moment someone speaks.

import { useCallback, useEffect, useRef, useState } from "react";

export const CAPTION_LANGS = [
  { id: "en-IN", label: "English" },
  { id: "ur-PK", label: "Urdu" },
];

const Recognition = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export function useLiveCaptions({ getSpeaker } = {}) {
  const supported = Boolean(Recognition);
  const [lang, setLang] = useState(CAPTION_LANGS[0].id);
  const [captions, setCaptions] = useState([]); // finished phrases not yet replaced by Gemini: [{ id, text, at }]
  const [interim, setInterim] = useState(""); // words being spoken right now
  const [interimSpeaker, setInterimSpeaker] = useState(null);
  const [blocked, setBlocked] = useState(false);

  const recRef = useRef(null);
  const activeRef = useRef(false);
  const langRef = useRef(lang);
  const restartRef = useRef(null);
  const launchRef = useRef(null); // lets onend start the next round
  const getSpeakerRef = useRef(getSpeaker);
  useEffect(() => {
    getSpeakerRef.current = getSpeaker;
  }, [getSpeaker]);

  const launch = useCallback(() => {
    if (!Recognition || !activeRef.current) return;
    const rec = new Recognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langRef.current;
    rec.onresult = (e) => {
      let live = "";
      const done = [];
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const text = e.results[i][0].transcript.trim();
        if (!text) continue;
        if (e.results[i].isFinal) done.push(text);
        else live += `${text} `;
      }
      if (done.length) {
        const at = Date.now();
        const speaker = getSpeakerRef.current?.() || null; // 2-mic mode: whose mic was louder
        setCaptions((prev) => [...prev, ...done.map((text, i) => ({ id: `${at}-${i}`, text, at, speaker }))].slice(-12));
      }
      setInterim(live.trim());
      setInterimSpeaker(live.trim() ? getSpeakerRef.current?.() || null : null);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        activeRef.current = false;
        setBlocked(true);
      }
    };
    // the browser stops after a pause in speech — start again while the session runs
    rec.onend = () => {
      setInterim("");
      if (activeRef.current) restartRef.current = setTimeout(() => launchRef.current?.(), 250);
    };
    try {
      rec.start();
      recRef.current = rec;
    } catch {
      /* already started */
    }
  }, []);

  useEffect(() => {
    launchRef.current = launch;
  }, [launch]);

  const start = useCallback(() => {
    if (!Recognition || activeRef.current) return;
    activeRef.current = true;
    setBlocked(false);
    launch();
  }, [launch]);

  const stop = useCallback(() => {
    activeRef.current = false;
    clearTimeout(restartRef.current);
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setInterim("");
  }, []);

  /** Gemini has transcribed audio up to this time → its captions are no longer needed. */
  const dropUntil = useCallback((time) => {
    setCaptions((prev) => prev.filter((c) => c.at > time));
  }, []);

  const clear = useCallback(() => {
    setCaptions([]);
    setInterim("");
  }, []);

  // switching language while recording → restart with the new language
  useEffect(() => {
    langRef.current = lang;
    if (activeRef.current) {
      try {
        recRef.current?.stop(); // onend starts it again with the new language
      } catch {
        /* ignore */
      }
    }
  }, [lang]);

  useEffect(() => () => stop(), [stop]);

  return { supported, blocked, lang, setLang, captions, interim, interimSpeaker, start, stop, dropUntil, clear };
}

export default useLiveCaptions;
