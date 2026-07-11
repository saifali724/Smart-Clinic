// src/features/patients/components/PatientRecordTopBar.jsx

import { useNavigate } from "react-router-dom";

export default function PatientRecordTopBar() {
  const navigate = useNavigate();

  return (
    <header className="relative z-10 flex h-[64px] w-full shrink-0 items-center bg-[#141824] px-[36px]">
      <p className="text-[22px] font-bold text-[#00bfd8]">MediScan AI</p>
      <p className="ml-[54px] text-[14px] font-medium text-[#8c99b8]">Patient Record</p>

      <button
        type="button"
        onClick={() => navigate("/idscanner")}
        className="ml-auto h-[32px] w-[140px] rounded-[8px] border border-[#2e3852] bg-[#1a1f2e] text-[12px] font-medium text-[#8c99b8] transition hover:border-[#00bfd8] hover:text-[#00bfd8]"
      >
        ← Back to Scanner
      </button>
    </header>
  );
}