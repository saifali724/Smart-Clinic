// src/features/patientRecord/components/PersonalInfoPanel.jsx
//
// Figma: 8 fields, each 56px tall, 14px apart, radius 10, 0.6px border.
// Full name + CNIC come from the CNIC scan; the doctor types the rest.
// Each field saves itself to the database when you leave it (no Save button
// in the design), and a small status shows "Saving…" / "Saved".

import { useEffect, useRef, useState } from "react";
import { PERSONAL_FIELDS } from "../data/recordConfig";
import RecordPanel from "./RecordPanel";

function SaveStatus({ state }) {
  if (state === "idle") return null;
  const map = {
    saving: { text: "Saving…", color: "#8C99B8" },
    saved: { text: "Saved", color: "#32E293" },
    error: { text: "Couldn't save", color: "#FF6060" },
  };
  const { text, color } = map[state];
  return (
    <span className="rec-fade-in text-[10px] font-medium leading-[12px]" style={{ color }}>
      {text}
    </span>
  );
}

export function PersonalInfoPanel({ patient, isLoading, onSave, focusRef, delay }) {
  const [draft, setDraft] = useState({});
  const [saveState, setSaveState] = useState("idle");
  const focusedRef = useRef(null);
  const savedTimer = useRef(null);

  // keep the boxes in sync with the database (live), but never overwrite
  // the field the doctor is typing in
  useEffect(() => {
    if (!patient) return;
    setDraft((prev) => {
      const next = { ...prev };
      for (const f of PERSONAL_FIELDS) {
        if (focusedRef.current !== f.name) next[f.name] = patient[f.name] ?? "";
      }
      return next;
    });
  }, [patient]);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  async function commit(name) {
    focusedRef.current = null;
    const value = (draft[name] ?? "").trim();
    if (value === (patient?.[name] ?? "")) return;
    setSaveState("saving");
    try {
      await onSave({ [name]: value });
      setSaveState("saved");
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      console.error("Save failed:", err);
      setSaveState("error");
    }
  }

  return (
    <RecordPanel title="Personal Information" right={<SaveStatus state={saveState} />} delay={delay}>
      <div className="m-stagger mt-[12px] space-y-[14px] px-[19px]" style={{ "--m-base": `${delay + 120}ms`, "--m-step": "45ms" }}>
        {PERSONAL_FIELDS.map((field, i) =>
          isLoading ? (
            <div key={field.name} className="rec-skeleton h-[56px] rounded-[10px]" />
          ) : (
            <label
              key={field.name}
              className="block h-[56px] cursor-text rounded-[10px] border-[0.6px] border-[#2E3852] bg-[#0C0F18] px-[16px] pt-[8px] transition-[border-color,box-shadow] duration-200 focus-within:border-[#00BFD8] focus-within:shadow-[0_0_0_3px_rgba(0,191,216,0.10)] hover:border-[#3A4766]"
            >
              <span className="block text-[9px] font-bold leading-[11px] text-[#596685]">
                {field.label}
              </span>
              <input
                ref={i === 0 ? focusRef : undefined}
                type={field.type || "text"}
                name={field.name}
                value={draft[field.name] ?? ""}
                placeholder={field.placeholder}
                onFocus={() => (focusedRef.current = field.name)}
                onChange={(e) => setDraft((d) => ({ ...d, [field.name]: e.target.value }))}
                onBlur={() => commit(field.name)}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                className="mt-[7px] block h-[15px] w-full truncate bg-transparent p-0 text-[12px] font-medium leading-[15px] text-[#EDF2FC] outline-none placeholder:text-[#596685]"
              />
            </label>
          )
        )}
      </div>
    </RecordPanel>
  );
}

export default PersonalInfoPanel;
