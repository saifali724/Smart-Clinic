// src/features/idScanner/components/IdScannerTopBar.jsx

export function IdScannerTopBar() {
  return (
    <header className="flex h-[54px] items-center justify-between border-b border-[#1F2937] bg-[#131926] px-[30px]">
      <div className="flex items-center gap-[38px]">
        <h1 className="text-[21px] font-black tracking-[-0.03em] text-[#00C2E0]">
          MediScan AI
        </h1>

        <p className="hidden text-[13px] font-medium text-[#8B96AA] sm:block">
          Patient ID Scanner
        </p>
      </div>

      <div className="flex items-center gap-[12px] text-[12px] font-medium text-[#8B96AA]">
        <span className="h-[7px] w-[7px] rounded-full bg-[#3CF3A7] shadow-[0_0_12px_rgba(60,243,167,0.8)]" />
        <span>Dr. Sarah Mitchell</span>
        <span className="text-[#41506A]">·</span>
        <span>Cardiology</span>
      </div>
    </header>
  );
}

export default IdScannerTopBar;