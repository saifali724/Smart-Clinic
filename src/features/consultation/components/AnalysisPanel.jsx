// src/features/consultation/components/AnalysisPanel.jsx
// Right column (Figma 376×796): detected symptoms, suggested diagnosis
// (Gemini + WHO ICD-10, cross-checked with our XGBoost model), doctor Confirm / Edit / Remove / Add,
// Generate Prescription, End Session, session duration.

import { useEffect, useState } from "react";
import { searchIcd } from "../services/consultApi";
import { formatDuration } from "../utils/audio";
import { CheckIcon, SparkleIcon, StopIcon } from "./Icons";
import { ServiceDot } from "./TranscriptPanel";

const DX_COLORS = ["#FF9E3D", "#00BFD8", "#8C99B8"];

const pct = (p) => (p >= 99.5 ? ">99" : p < 1 ? "<1" : String(Math.round(p)));

function Symptoms({ analysis, isAnalyzing, status }) {
  const items = [
    ...(analysis?.vitalFindings || [])
      .filter((f) => f.level === "critical" || f.level === "warning")
      .map((f) => ({ text: f.title.split(" — ")[0], tag: "sensor" })),
    ...(analysis?.symptoms || []).filter((s) => s.source === "conversation").map((s) => ({ text: s.label, tag: "" })),
    ...(analysis?.otherFindings || []).map((t) => ({ text: t, tag: "note" })),
  ];
  if (!items.length) {
    return (
      <div className="flex h-[36px] items-center rounded-[8px] border-[0.5px] border-[#2E3852] bg-[#1A1F2E] px-[14px] text-[12px] text-[#596685]">
        {status === "idle" ? "Waiting for the session" : isAnalyzing ? "Analysing…" : "No symptoms detected yet"}
      </div>
    );
  }
  return items.map((it, i) => (
    <div
      key={`${it.text}-${i}`}
      className="c-bubble-in flex h-[36px] items-center justify-between gap-[8px] rounded-[8px] border-[0.5px] border-[#2E3852] bg-[#1A1F2E] px-[14px]"
      style={{ animationDelay: `${i * 40}ms` }}
    >
      <p className="truncate whitespace-pre text-[12px] font-normal leading-[15px] text-[#EDF2FC]">{`◆  ${it.text}`}</p>
      {it.tag && <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.04em] text-[#596685]">{it.tag}</span>}
    </div>
  ));
}

const AGREEMENT = {
  agree: { text: "AI + model agree", color: "#32E293" },
  disagree: { text: "Model disagrees — review", color: "#FF9E3D" },
  "ai-only": { text: "AI (ICD-10)", color: "#8C99B8" },
  "model-only": { text: "Model only — review", color: "#FF9E3D" },
};

const SOURCE_TAG = { edited: "Edited by doctor", added: "Added by doctor" };

/** ICD-10 search box used by "Edit" and "+ Add" */
function DxSearch({ initial = "", onPick, onCancel, search }) {
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    const term = q.trim();
    if (picked || term.length < 2) return undefined;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      search(term, ctrl.signal)
        .then(setResults)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, picked, search]);

  const shown = q.trim().length < 2 ? [] : results;

  return (
    <div className="c-bubble-in rounded-[10px] border border-[#00BFD8]/60 bg-[#0C0F18] p-[10px]" onClick={(e) => e.stopPropagation()}>
      {!picked ? (
        <>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search disease or ICD-10 code"
            className="h-[34px] w-full rounded-[8px] border border-[#2E3852] bg-[#141824] px-[10px] text-[12px] text-[#EDF2FC] outline-none placeholder:text-[#596685] focus:border-[#00BFD8]"
          />
          <div className="mt-[6px] max-h-[180px] space-y-[2px] overflow-y-auto">
            {loading && shown.length === 0 && <p className="px-[6px] py-[6px] text-[11px] text-[#596685]">Searching…</p>}
            {!loading && q.trim().length >= 2 && shown.length === 0 && (
              <p className="px-[6px] py-[6px] text-[11px] text-[#596685]">No match — try another word</p>
            )}
            {shown.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => {
                  setPicked(r);
                  setName(r.title.split(",")[0]);
                }}
                className="flex w-full items-start gap-[8px] rounded-[6px] px-[6px] py-[5px] text-left text-[11px] leading-[14px] text-[#EDF2FC] hover:bg-[#1A1F2E]"
              >
                <span className="w-[44px] shrink-0 font-semibold text-[#00BFD8]">{r.code}</span>
                <span>{r.title}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-[6px]">
          <p className="text-[10px] text-[#596685]">
            <span className="font-semibold text-[#00BFD8]">{picked.code}</span> · {picked.title}
          </p>
          <label className="block text-[10px] text-[#596685]">
            Name on the prescription
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-[4px] h-[34px] w-full rounded-[8px] border border-[#2E3852] bg-[#141824] px-[10px] text-[12px] text-[#EDF2FC] outline-none focus:border-[#00BFD8]"
            />
          </label>
        </div>
      )}
      <div className="mt-[8px] flex justify-end gap-[8px]">
        <button
          type="button"
          onClick={picked ? () => setPicked(null) : onCancel}
          className="h-[28px] rounded-[7px] border border-[#2E3852] px-[10px] text-[11px] text-[#8C99B8] hover:text-[#EDF2FC]"
        >
          {picked ? "Back" : "Cancel"}
        </button>
        <button
          type="button"
          disabled={!picked || !name.trim()}
          onClick={() => onPick({ ...picked, name: name.trim() })}
          className="h-[28px] rounded-[7px] bg-[#32E293] px-[12px] text-[11px] font-bold text-[#0C0F18] disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, color }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="h-[28px] flex-1 rounded-[7px] border text-[11px] font-semibold transition hover:brightness-125"
      style={{ borderColor: `${color}80`, color, backgroundColor: `${color}14` }}
    >
      {children}
    </button>
  );
}

function DiagnosisCard({ d, index, c }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const color = d.confirmed ? "#32E293" : DX_COLORS[index] || DX_COLORS[2];
  const lead = index === 0 || d.confirmed;
  const agree = AGREEMENT[d.agreement];
  const hasDetails = d.evidenceFor?.length || d.tests?.length || d.model;
  const isDoctor = d.source === "edited" || d.source === "added";

  return (
    <div
      className="c-bubble-in relative overflow-hidden rounded-[10px] bg-[#1A1F2E]"
      style={{ border: lead ? `1.5px solid ${color}` : "0.5px solid #2E3852", animationDelay: `${index * 70}ms` }}
    >
      <button type="button" onClick={() => setOpen((o) => !o)} className="block w-full px-[16px] pb-[18px] pt-[11px] text-left">
        <p className="pr-[34px] text-[14px] font-semibold leading-[17px] text-[#EDF2FC]">{d.name}</p>
        {d.icd10 && (
          <p className="mt-[3px] truncate pr-[34px] text-[10px] leading-[12px] text-[#596685]">
            ICD-10 {d.icd10}{d.icdTitle && d.icdTitle !== d.name ? ` · ${d.icdTitle}` : ""}
          </p>
        )}
        <p className="mt-[5px] text-[11px] font-normal leading-[13px]" style={{ color }}>
          {isDoctor
            ? SOURCE_TAG[d.source]
            : `${pct(d.probability ?? 0)}% likelihood${d.confirmed ? "  ·  confirmed" : ""}`}
          <span className="text-[#596685]">{`  ·  ${open ? "close" : "options"}`}</span>
        </p>
        {!isDoctor && agree && (
          <span
            className="mt-[6px] inline-flex items-center gap-[5px] rounded-full px-[7px] py-[2px] text-[9px] font-bold uppercase tracking-[0.03em]"
            style={{ color: agree.color, backgroundColor: `${agree.color}1A` }}
          >
            <span className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: agree.color }} />
            {agree.text}
          </span>
        )}
        {isDoctor && d.aiName && <p className="mt-[4px] text-[10px] text-[#596685]">AI had suggested: {d.aiName}</p>}
      </button>

      {open && (
        <div className="space-y-[8px] px-[16px] pb-[18px] text-[11px] leading-[15px] text-[#8C99B8]">
          {hasDetails ? (
            <>
              {d.evidenceFor?.length > 0 && (
                <p>
                  <span className="text-[#596685]">Why: </span>
                  {d.evidenceFor.join("; ")}
                </p>
              )}
              {d.evidenceAgainst?.length > 0 && (
                <p>
                  <span className="text-[#596685]">Against: </span>
                  {d.evidenceAgainst.join("; ")}
                </p>
              )}
              {d.tests?.length > 0 && (
                <p>
                  <span className="text-[#596685]">Confirm with: </span>
                  {d.tests.join(", ")}
                </p>
              )}
              {d.model && (
                <p>
                  <span className="text-[#596685]">Our model: </span>
                  {d.model.name} {pct(d.model.probability)}%
                  {d.model.reasons?.length ? ` — ${d.model.reasons.map((r) => r.label.toLowerCase()).join(", ")}` : ""}
                </p>
              )}
            </>
          ) : null}

          {editing ? (
            <DxSearch
              initial={d.name}
              search={c.searchIcd}
              onCancel={() => setEditing(false)}
              onPick={(picked) => {
                setEditing(false);
                setOpen(false);
                c.editDx(d, picked);
              }}
            />
          ) : (
            <div className="flex gap-[8px]">
              {!d.confirmed && <ActionButton color="#32E293" onClick={() => c.confirmDx(d)}>Confirm</ActionButton>}
              <ActionButton color="#00BFD8" onClick={() => setEditing(true)}>Edit</ActionButton>
              <ActionButton color="#FF6060" onClick={() => c.removeDx(d)}>
                {d.confirmed && d.source === "ai" ? "Undo" : "Remove"}
              </ActionButton>
            </div>
          )}
        </div>
      )}

      {/* quick confirm tick */}
      <button
        type="button"
        onClick={() => (d.confirmed && d.source !== "ai" ? setOpen(true) : c.confirmDx(d))}
        title={d.confirmed ? "Confirmed by doctor" : "Confirm this diagnosis"}
        className={`absolute right-[10px] top-[10px] flex h-[26px] w-[26px] items-center justify-center rounded-full border transition ${
          d.confirmed ? "border-[#32E293] bg-[#32E293] text-[#0C0F18]" : "border-[#2E3852] text-[#596685] hover:border-[#32E293] hover:text-[#32E293]"
        }`}
      >
        <CheckIcon size={14} />
      </button>

      {!isDoctor && (
        <span
          className="absolute bottom-0 left-0 h-[6px] transition-[width] duration-700 ease-out"
          style={{ width: `${Math.max(2, d.probability ?? 0)}%`, backgroundColor: color, opacity: 0.5 }}
        />
      )}
    </div>
  );
}

export function AnalysisPanel({ c, onEnd }) {
  const diagnoses = c.dxView || [];
  const busy = c.status === "ending";
  const [adding, setAdding] = useState(false);
  const cx = { ...c, searchIcd };
  return (
    <section
      className="m-right flex min-h-0 flex-col rounded-[20px] border border-[#2E3852] bg-[#141824] px-[16px] pb-[17px] pt-[22px] sm:px-[19px] xl:h-full xl:pt-[27px]"
      style={{ animationDelay: "200ms" }}
    >
      <div className="flex items-center justify-between pl-[4px]">
        <p className="text-[10px] font-bold uppercase leading-[12px] text-[#936AFF]">AI Clinical Analysis</p>
        <span className="text-[10px] font-medium">
          {c.isAnalyzing ? (
            <span className="c-rec-pulse text-[#596685]">updating…</span>
          ) : (
            <ServiceDot label="Model" state={c.services.model === "unknown" ? "down" : c.services.model} />
          )}
        </span>
      </div>

      <div className="min-h-0 xl:flex-1 xl:overflow-y-auto">
        <p className="mt-[24px] pl-[4px] text-[9px] font-bold uppercase leading-[11px] text-[#596685]">Detected Symptoms</p>
        <div className="mt-[9px] space-y-[8px]">
          <Symptoms analysis={c.analysis} isAnalyzing={c.isAnalyzing} status={c.status} />
        </div>

        <div className="mt-[22px] flex items-baseline justify-between pl-[4px]">
          <p className="text-[9px] font-bold uppercase leading-[11px] text-[#FF9E3D]">Suggested Diagnosis</p>
          {c.status !== "idle" && !adding && (
            <button type="button" onClick={() => setAdding(true)} className="text-[10px] font-semibold text-[#00BFD8] hover:underline">
              + Add diagnosis
            </button>
          )}
        </div>
        {c.analysis?.needsReview && diagnoses.length > 0 && (
          <p className="mt-[8px] rounded-[8px] border border-[#FF9E3D]/40 bg-[#FF9E3D]/10 px-[10px] py-[6px] text-[10px] leading-[14px] text-[#FFB870]">
            Not certain yet — ask more questions or order the suggested tests before confirming.
          </p>
        )}
        <div className="mt-[11px] space-y-[12px]">
          {adding && (
            <DxSearch
              search={searchIcd}
              onCancel={() => setAdding(false)}
              onPick={(picked) => {
                setAdding(false);
                c.addDx(picked);
              }}
            />
          )}
          {diagnoses.length ? (
            diagnoses.map((d, i) => <DiagnosisCard key={d.key || d.name} d={d} index={i} c={cx} />)
          ) : (
            <div className="flex min-h-[64px] items-center rounded-[10px] border-[0.5px] border-[#2E3852] bg-[#1A1F2E] px-[16px] text-[12px] leading-[16px] text-[#596685]">
              {c.status === "idle" ? "Suggestions appear during the conversation" : "Not enough information yet"}
            </div>
          )}
        </div>
        {c.analysis?.askNext?.length > 0 && (
          <div className="mt-[14px] rounded-[10px] border-[0.5px] border-[#2E3852] bg-[#1A1F2E] px-[14px] py-[10px]">
            <p className="text-[9px] font-bold uppercase leading-[11px] text-[#596685]">Ask next</p>
            <ul className="mt-[6px] space-y-[4px] text-[11px] leading-[15px] text-[#8C99B8]">
              {c.analysis.askNext.map((q) => (
                <li key={q}>{`–  ${q}`}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-[10px] pl-[4px] text-[9px] leading-[12px] text-[#596685]">
          Tap a diagnosis for options. Only diagnoses you confirm are saved.
        </p>
      </div>

      <button
        type="button"
        onClick={() => c.quickAction("rx")}
        disabled={c.status === "idle" || busy || c.status === "ended" || !c.finalDx?.length}
        title={c.finalDx?.length ? "" : "Confirm at least one diagnosis first"}
        style={{ animationDelay: "460ms" }}
        className="m-up mt-[16px] flex h-[52px] w-full shrink-0 items-center justify-center gap-[12px] rounded-[14px] border-[1.5px] border-[#32E293] bg-[#32E293]/15 text-[14px] font-bold leading-none text-[#32E293] transition hover:bg-[#32E293]/25 disabled:opacity-40"
      >
        <SparkleIcon size={16} /> GENERATE PRESCRIPTION
      </button>

      <button
        type="button"
        onClick={onEnd}
        disabled={c.status === "idle" || busy || c.status === "ended"}
        style={{ animationDelay: "520ms" }}
        className="m-up mt-[14px] flex h-[44px] w-full shrink-0 items-center justify-center gap-[12px] rounded-[12px] border border-[#FF6060] bg-[#FF6060]/[0.12] text-[14px] font-semibold leading-none text-[#FF6060] transition hover:bg-[#FF6060]/20 disabled:opacity-40"
      >
        <StopIcon size={15} /> {busy ? "Saving session…" : "End Session"}
      </button>

      <div style={{ animationDelay: "580ms" }} className="m-up mt-[14px] flex h-[80px] shrink-0 items-start justify-between gap-[12px] rounded-[12px] border border-[#2E3852] bg-[#1A1F2E] px-[16px] pt-[17px]">
        <div>
          <p className="text-[10px] font-bold uppercase leading-[12px] text-[#596685]">Session Duration</p>
          <p className="mt-[8px] text-[24px] font-extrabold leading-[34px] text-[#00BFD8] sm:text-[28px]">{formatDuration(c.seconds)}</p>
        </div>
        <div className="min-w-0 pt-[1px] text-right sm:text-left">
          <p className="truncate text-[11px] leading-[13px] text-[#8C99B8]">Patient: {c.patientName}</p>
          <p className="mt-[7px] truncate text-[11px] leading-[13px] text-[#596685]">
            ID #{c.patientId || "—"}{c.doctor?.specialization ? ` — ${c.doctor.specialization}` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

export default AnalysisPanel;
