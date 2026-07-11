// src/features/patients/components/PatientActionBar.jsx

import { useNavigate } from "react-router-dom";
import { actionBarItems } from "../data/patientRecordContent";

export default function PatientActionBar() {
  const navigate = useNavigate();

  return (
    <div className="grid h-full w-full grid-cols-5 items-center rounded-[10px] border border-[#2e3852] bg-[#1a1f2e] pl-[36px]">
      {actionBarItems.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => item.route && navigate(item.route)}
          className={`justify-self-start whitespace-pre text-[13px] font-medium transition hover:text-[#00bfd8] ${
            item.accent ? "text-[#00bfd8]" : "text-[#8c99b8]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}