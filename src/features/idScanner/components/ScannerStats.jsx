// src/features/idScanner/components/ScannerStats.jsx

import { scannerStats } from "../data/idScannerContent";

export function ScannerStats() {
  return (
    <div className="mt-[18px] grid grid-cols-1 gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
      {scannerStats.map((stat) => (
        <div
          key={stat.label}
          className="h-[86px] rounded-[10px] border border-[#24324D] bg-[#0F1626] px-[18px] py-[15px]"
        >
          <p
            className="text-[30px] font-black leading-none tracking-[-0.02em]"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>

          <p className="mt-[10px] text-[10px] font-medium text-[#59657B]">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ScannerStats;