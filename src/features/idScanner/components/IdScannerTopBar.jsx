// src/features/idScanner/components/IdScannerTopBar.jsx

export function IdScannerTopBar() {
  return (
    <header className="s-down flex h-[56px] items-center justify-between gap-[12px] bg-[#141824] px-[16px] sm:h-[64px] sm:px-[36px]">
      <div className="flex min-w-0 items-center gap-[20px] md:gap-[49px]">
        <h1 className="shrink-0 text-[19px] font-bold leading-none text-[#00BFD8] sm:text-[22px]">
          MediScan AI
        </h1>
        <p className="hidden truncate text-[14px] font-medium leading-none text-[#8C99B8] md:block">
          Patient ID Scanner
        </p>
      </div>

      <div className="flex min-w-0 items-center gap-[10px] sm:gap-[22px]">
        <span className="s-blink h-[8px] w-[8px] shrink-0 rounded-full bg-[#32E293]" />
        <p className="truncate text-[12px] font-normal leading-none text-[#8C99B8] sm:text-[13px]">
          Dr. Sarah Mitchell
          <span className="hidden sm:inline">{"  ·  "}Cardiology</span>
        </p>
      </div>
    </header>
  );
}

export default IdScannerTopBar;
