// src/features/patientRecord/components/RecordActionBar.jsx
// Figma: one 38px bar, 5 actions starting 36px in, 13px medium text,
// "Start Consultation" in cyan. No emojis. Small screens get a button grid.

import { ACTIONS } from "../data/recordConfig";

export function RecordActionBar({ onAction }) {
  return (
    <nav style={{ "--m-base": "420ms", "--m-step": "50ms" }} className="m-stagger rec-no-print grid w-full grid-cols-2 gap-[8px] rounded-[10px] border border-[#2E3852] bg-[#1A1F2E] p-[8px] sm:grid-cols-3 xl:h-full xl:grid-cols-[repeat(4,268px)_1fr] xl:items-start xl:gap-0 xl:p-0 xl:pl-[35px] xl:pt-[7px]">
      {ACTIONS.map((action, i) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action.id)}
          className={`min-h-[40px] rounded-[8px] px-[8px] text-[13px] font-medium leading-[16px] transition-colors duration-200 xl:min-h-0 xl:justify-self-start xl:rounded-none xl:bg-transparent xl:px-0 ${
            action.accent
              ? "bg-[#00BFD8]/10 text-[#00BFD8] hover:bg-[#00BFD8]/20 xl:hover:bg-transparent xl:hover:text-[#33D3E8]"
              : "bg-[#0C0F18] text-[#8C99B8] hover:text-[#EDF2FC]"
          } ${i === ACTIONS.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
        >
          {action.label}
        </button>
      ))}
    </nav>
  );
}

export default RecordActionBar;
