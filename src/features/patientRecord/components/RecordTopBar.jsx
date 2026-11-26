// src/features/patientRecord/components/RecordTopBar.jsx
// Figma: 64px bar, logo at 36px, "Patient Record" at 220px, back button 140×32 at the right.

import { useNavigate } from "react-router-dom";

export function RecordTopBar() {
  const navigate = useNavigate();

  return (
    <header className="m-down rec-no-print relative z-10 flex h-[56px] w-full shrink-0 items-center gap-[12px] bg-[#141824] px-[16px] sm:h-[64px] sm:pl-[36px] sm:pr-[40px]">
      <p className="shrink-0 text-[19px] font-bold leading-none text-[#00BFD8] sm:text-[22px]">
        MediScan AI
      </p>
      <p className="ml-[37px] hidden text-[14px] font-medium leading-none text-[#8C99B8] md:ml-[49px] md:block">
        Patient Record
      </p>

      <button
        type="button"
        onClick={() => navigate("/idscanner")}
        className="ml-auto flex h-[32px] shrink-0 items-center justify-center rounded-[8px] border border-[#2E3852] bg-[#1A1F2E] px-[12px] text-[12px] font-medium leading-none text-[#8C99B8] transition-colors duration-200 hover:border-[#00BFD8] hover:text-[#00BFD8] sm:w-[140px] sm:px-0"
      >
        ← <span className="ml-[4px] hidden min-[400px]:inline">Back to</span>
        <span className="ml-[4px]">Scanner</span>
      </button>
    </header>
  );
}

export default RecordTopBar;
