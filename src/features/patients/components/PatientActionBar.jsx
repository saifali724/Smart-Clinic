// src/features/patients/components/PatientActionBar.jsx
// One row of 5 actions on wide screens; a 2- or 3-column button grid on smaller ones.

import { useNavigate } from "react-router-dom";
import { actionBarItems } from "../data/patientRecordContent";

export default function PatientActionBar() {
  const navigate = useNavigate();

  return (
    <div className="grid w-full grid-cols-2 gap-[8px] rounded-[10px] border border-[#2e3852] bg-[#1a1f2e] p-[8px] sm:grid-cols-3 xl:h-full xl:grid-cols-5 xl:items-center xl:gap-0 xl:p-0 xl:pl-[36px]">
      {actionBarItems.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => item.route && navigate(item.route)}
          className={`min-h-[40px] whitespace-pre rounded-[8px] px-[8px] text-[12px] font-medium transition hover:text-[#00bfd8] sm:text-[13px] xl:min-h-0 xl:justify-self-start xl:rounded-none xl:bg-transparent xl:px-0 ${
            item.accent
              ? "bg-[#00bfd8]/10 text-[#00bfd8]"
              : "bg-[#0c0f18] text-[#8c99b8]"
          } ${i === actionBarItems.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
