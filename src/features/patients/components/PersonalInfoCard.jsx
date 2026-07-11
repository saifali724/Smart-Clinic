// src/features/patients/components/PersonalInfoCard.jsx

import { personalInfoFields } from "../data/patientRecordContent";

export default function PersonalInfoCard({
  personalInfo, onFieldChange, onSave, isSaving, saveSuccess,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[16px] border border-[#2e3852] bg-[#141824] px-[20px] pb-[20px] pt-[22px]">
      <p className="pl-[4px] text-[10px] font-bold tracking-[0.06em] text-[#00bfd8]">
        PERSONAL INFORMATION
      </p>

      {/* fields — 56px tall, 14px apart (Figma 70px pitch) */}
      <div className="mt-[14px] min-h-0 flex-1 space-y-[14px] overflow-y-auto">
        {personalInfoFields.map((f) => (
          <div
            key={f.name}
            className="relative h-[56px] w-full shrink-0 rounded-[10px] border-[0.6px] border-[#2e3852] bg-[#0c0f18]"
          >
            <p
              className="absolute whitespace-nowrap text-[9px] font-bold tracking-[0.06em] text-[#596685]"
              style={{ left: 16, top: 8 }}
            >
              {f.label}
            </p>
            <input
              name={f.name}
              value={personalInfo[f.name] ?? ""}
              onChange={(e) => onFieldChange(f.name, e.target.value)}
              className="absolute border-none bg-transparent text-[12px] font-medium text-[#edf2fc] outline-none placeholder:text-[#2e3852]"
              style={{ left: 16, right: 16, top: 24, height: 20 }}
            />
          </div>
        ))}
      </div>

      {/* save button — pinned to card bottom */}
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className={`mt-[16px] h-[40px] w-full shrink-0 rounded-[8px] text-[10px] font-black uppercase tracking-[0.06em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
          saveSuccess
            ? "bg-[#32e293] text-[#071018]"
            : "bg-[#00bfd8] text-[#071018] hover:bg-[#1EE7FF]"
        }`}
      >
        {isSaving ? "SAVING..." : saveSuccess ? "✓ SAVED" : "SAVE PATIENT INFO"}
      </button>
    </div>
  );
}