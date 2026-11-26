// src/features/patients/components/PatientRecordTopBar.jsx

import { useNavigate } from "react-router-dom";

export default function PatientRecordTopBar() {
  const navigate = useNavigate();

  return (
    <header className="relative z-10 flex h-[56px] w-full shrink-0 items-center gap-[12px] bg-[#141824] px-[16px] sm:h-[64px] sm:px-[36px]">
      <p className="shrink-0 text-[19px] font-bold text-[#00bfd8] sm:text-[22px]">MediScan AI</p>
      <p className="ml-[20px] hidden text-[14px] font-medium text-[#8c99b8] md:ml-[54px] md:block">
        Patient Record
      </p>

      <button
        type="button"
        onClick={() => navigate("/idscanner")}
        className="ml-auto h-[32px] shrink-0 rounded-[8px] border border-[#2e3852] bg-[#1a1f2e] px-[12px] text-[12px] font-medium text-[#8c99b8] transition hover:border-[#00bfd8] hover:text-[#00bfd8] sm:w-[140px] sm:px-0"
      >
        ← <span className="hidden min-[400px]:inline">Back to </span>Scanner
      </button>
    </header>
  );
}
