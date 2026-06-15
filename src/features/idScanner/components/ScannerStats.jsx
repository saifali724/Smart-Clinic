// src/features/idScanner/components/ScannerStats.jsx

import { scannerStats } from "../data/idScannerContent";

export function ScannerStats() {
  return (
    <div className="mt-[36px] grid grid-cols-1 gap-[10px] sm:grid-cols-2 xl:grid-cols-4">
      {scannerStats.map((stat) => (
        <div
          key={stat.label}
          className="h-[72px] rounded-[9px] border border-[#26344F] bg-[#171E30] px-[15px] py-[12px]"
        >
          <p
            className="text-[24px] font-black leading-none"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>

          <p className="mt-[8px] text-[9px] font-medium text-[#59657B]">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ScannerStats;