// src/features/consultation/components/TranscriptPanel.jsx
// Middle column (Figma 580×796): chat bubbles 440 wide — doctor left (purple), patient right (cyan),
// "AI Transcribing…" pill, and the start screen with patient consent.

import { useEffect, useRef, useState } from "react";
import { CAPTION_LANGS } from "../hooks/useLiveCaptions";
import { MicIcon } from "./Icons";
import { MicSetup } from "./MicSetup";

/** words appear here the moment someone speaks; Gemini's clean lines replace them a few seconds later */
function LiveCaption({ live, doctorName, patientName }) {
  // group phrases by speaker (2-mic mode); in 1-mic mode speaker is unknown → one box
  const groups = [];
  for (const c of live.captions) {
    const last = groups[groups.length - 1];
    if (last && last.speaker === c.speaker) last.text += ` ${c.text}`;
    else groups.push({ speaker: c.speaker, text: c.text, id: c.id });
  }
  if (live.interim) {
    const last = groups[groups.length - 1];
    if (last && last.speaker === live.interimSpeaker && !last.interim) last.interim = live.interim;
    else groups.push({ speaker: live.interimSpeaker, text: "", interim: live.interim, id: "interim" });
  }
  return groups.map((g) => {
    const known = g.speaker === "doctor" || g.speaker === "patient";
    const color = g.speaker === "doctor" ? "#936AFF" : g.speaker === "patient" ? "#00BFD8" : "#596685";
    const align = g.speaker === "patient" ? "justify-end" : g.speaker === "doctor" ? "justify-start" : "justify-center";
    return (
      <div key={g.id} className={`c-bubble-in flex ${align}`}>
        <div
          className={`rounded-[12px] border border-dashed bg-[#1A1F2E]/70 px-[12px] pb-[10px] pt-[9px] ${known ? "w-[88%] max-w-[440px] sm:w-[76%]" : "w-full max-w-[520px]"}`}
          style={{ borderColor: color }}
        >
          <p className="flex items-center gap-[6px] text-[10px] font-semibold uppercase leading-[12px] tracking-[0.04em]" style={{ color: known ? color : "#8C99B8" }}>
            <span className="c-rec-pulse h-[6px] w-[6px] rounded-full bg-[#FF6060]" />
            {known ? `${g.speaker === "doctor" ? doctorName : patientName}  ·  live` : "Live"}
            <span className="font-normal normal-case tracking-normal text-[#596685]">— cleaning up in English…</span>
          </p>
          <p className="mt-[6px] text-[12px] leading-[17px] text-[#EDF2FC]" dir="auto">
            {g.text}
            {g.interim && <span className="text-[#8C99B8]">{`${g.text ? " " : ""}${g.interim}`}</span>}
          </p>
        </div>
      </div>
    );
  });
}

function LangSwitch({ live }) {
  if (!live.supported) return null;
  return (
    <div className="flex shrink-0 overflow-hidden rounded-[7px] border border-[#2E3852] text-[10px] font-semibold">
      {CAPTION_LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => live.setLang(l.id)}
          title="Language people are speaking (for live captions)"
          className={`px-[8px] py-[3px] transition ${live.lang === l.id ? "bg-[#00BFD8] text-[#0C0F18]" : "text-[#8C99B8] hover:text-[#EDF2FC]"}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function Bubble({ line, name, onSwap }) {
  const isDoctor = line.speaker !== "patient";
  const color = isDoctor ? "#936AFF" : "#00BFD8";
  return (
    <div className={`c-bubble-in flex ${isDoctor ? "justify-start" : "justify-end"}`}>
      <div
        className="w-[88%] max-w-[440px] rounded-[12px] px-[12px] pb-[11px] pt-[10px] sm:w-[76%]"
        style={{ border: `0.8px solid ${color}`, backgroundColor: `${color}14` }}
      >
        <button
          type="button"
          onClick={onSwap}
          title="Wrong speaker? Tap to switch Doctor / Patient"
          className="group flex items-center gap-[6px] text-[10px] font-semibold leading-[12px]"
          style={{ color }}
        >
          {name}
          <span className="rounded-[4px] border border-current px-[4px] py-[1px] text-[8px] font-bold uppercase opacity-40 transition group-hover:opacity-100">
            {line.fixed ? "fixed" : "switch"}
          </span>
        </button>
        <p className="mt-[6px] text-[11px] font-normal leading-[13px] text-[#EDF2FC]">{line.text}</p>
      </div>
    </div>
  );
}

export function ServiceDot({ label, state }) {
  const color = state === "ok" ? "#32E293" : state === "checking" ? "#8C99B8" : "#FF6060";
  const text = state === "ok" ? "online" : state === "checking" ? "checking…" : "offline";
  return (
    <span className="flex items-center gap-[6px]" style={{ color }}>
      <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: color }} />
      {label} {text}
    </span>
  );
}

function StartCard({ c }) {
  const [consent, setConsent] = useState(false);
  return (
    <div className="c-fade-up mx-auto my-auto w-full max-w-[380px] rounded-[16px] border border-[#2E3852] bg-[#1A1F2E] px-[20px] py-[24px] text-center">
      <span className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#00BFD8]/15 text-[#00BFD8]">
        <MicIcon size={24} />
      </span>
      <p className="mt-[14px] text-[15px] font-bold text-[#EDF2FC]">Start live consultation</p>
      <p className="mt-[6px] text-[12px] leading-[18px] text-[#8C99B8]">
        The conversation is recorded, written down in English and analysed by AI. The doctor confirms every diagnosis.
      </p>
      <label className="mt-[16px] flex cursor-pointer items-start gap-[10px] rounded-[10px] border border-[#2E3852] bg-[#0C0F18] px-[12px] py-[10px] text-left text-[12px] leading-[17px] text-[#EDF2FC]">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-[2px] h-[14px] w-[14px] shrink-0 accent-[#00BFD8]" />
        {c.patientName} agrees to this consultation being recorded
      </label>
      <MicSetup mic={c.mic} />

      <div className="mt-[12px] flex justify-center gap-[14px] text-[11px]">
        <ServiceDot label="Backend" state={c.services.backend} />
        <ServiceDot label="AI model" state={c.services.model} />
      </div>
      {(c.services.backend === "down" || c.services.model === "down") && (
        <p className="mt-[8px] text-[11px] leading-[16px] text-[#FF8A8A]">
          {c.services.backend === "down"
            ? "Backend is off — run: cd backend\\node_ocr  →  npm start"
            : "AI model is off — double-click backend\\ai_service\\run.bat"}
        </p>
      )}

      <button
        type="button"
        onClick={c.startSession}
        disabled={
          !consent ||
          !c.patientId ||
          (c.mic.mode === "dual" && (!c.mic.doctorId || !c.mic.patientId || c.mic.doctorId === c.mic.patientId))
        }
        className="mt-[14px] h-[44px] w-full rounded-[12px] bg-[#00BFD8] text-[13px] font-bold text-[#0C0F18] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Start Session
      </button>
    </div>
  );
}

export function TranscriptPanel({ c }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [c.lines.length, c.isTranscribing]);

  const live = c.live;
  const hasCaption = c.status !== "idle" && (live.captions.length > 0 || Boolean(live.interim));
  const showTyping = c.status === "running" && !hasCaption && (c.isTranscribing || c.speaking);

  return (
    <section
      className="c-fade-up flex min-h-[420px] flex-col rounded-[20px] border border-[#2E3852] bg-[#141824] pb-[16px] pt-[22px] xl:h-full xl:min-h-0 xl:pt-[27px]"
      style={{ animationDelay: "130ms" }}
    >
      <div className="flex items-center justify-between gap-[12px] pl-[20px] pr-[12px] sm:pl-[27px]">
        <p className="text-[10px] font-bold uppercase leading-[12px] text-[#00BFD8]">Live Transcript</p>
        <div className="flex min-w-0 items-center gap-[10px]">
          <p className="hidden truncate text-[11px] font-normal leading-[13px] text-[#8C99B8] sm:block">
            {c.status === "idle"
              ? "AI-powered  ·  auto-translated to English"
              : `${c.mic.mode === "dual" ? "2 mics  ·  " : ""}Clips sent ${c.clipStats.sent}  ·  silent ${c.clipStats.silent}`}
          </p>
          <LangSwitch live={live} />
        </div>
      </div>

      {c.status !== "idle" && (!live.supported || live.blocked) && (
        <p className="mx-[16px] mt-[10px] text-[10px] leading-[14px] text-[#596685] sm:mx-[20px]">
          {live.blocked
            ? "Live captions were blocked by the browser — the transcript still appears every few seconds."
            : "Word-by-word live captions need Chrome or Edge — the transcript still appears every few seconds."}
        </p>
      )}

      {c.micSilent && (
        <div className="mx-[16px] mt-[12px] rounded-[10px] border border-[#FF9E3D]/50 bg-[#FF9E3D]/10 px-[12px] py-[9px] text-[11px] leading-[16px] text-[#FFB870] sm:mx-[20px]">
          <b>No sound from your microphone.</b> Check that the mic isn't muted in Windows, and that the right microphone is
          selected — click the lock icon left of the address bar → Microphone. Silent clips are not sent to the AI.
        </div>
      )}

      {c.error && (
        <button
          type="button"
          onClick={c.dismissError}
          className="mx-[16px] mt-[12px] rounded-[10px] border border-[#FF6060]/40 bg-[#FF6060]/10 px-[12px] py-[8px] text-left text-[11px] leading-[15px] text-[#FF8A8A] sm:mx-[20px]"
        >
          {c.error} <span className="text-[#8C99B8]">(tap to hide)</span>
        </button>
      )}

      <div ref={scrollRef} className="mt-[19px] flex min-h-0 flex-1 flex-col space-y-[12px] overflow-y-auto px-[16px] sm:px-[20px] sm:pr-[24px]">
        {c.status === "idle" ? (
          <StartCard c={c} />
        ) : c.lines.length === 0 && !showTyping && !hasCaption ? (
          <p className="my-auto text-center text-[12px] text-[#596685]">Listening… start speaking and the conversation appears here.</p>
        ) : (
          c.lines.map((line) => (
            <Bubble
              key={line.id}
              line={line}
              name={line.speaker === "patient" ? c.patientName : c.doctorName}
              onSwap={() => c.swapSpeaker(line.id)}
            />
          ))
        )}

        {hasCaption && <LiveCaption live={live} doctorName={c.doctorName} patientName={c.patientName} />}

        {showTyping && (
          <div className="c-bubble-in flex h-[36px] w-[220px] shrink-0 items-center gap-[6px] rounded-[18px] border border-[#2E3852] bg-[#1A1F2E] px-[14px]">
            {[0.6, 0.8, 1].map((o, i) => (
              <span key={i} className="c-dot h-[8px] w-[8px] rounded-full bg-[#00BFD8]" style={{ opacity: o, animationDelay: `${i * 0.15}s` }} />
            ))}
            <span className="ml-[2px] text-[11px] text-[#8C99B8]">AI Transcribing...</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default TranscriptPanel;
