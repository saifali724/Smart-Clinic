// src/features/idScanner/components/SystemLog.jsx

import { systemLog } from "../data/idScannerContent";

export function SystemLog() {
  return (
    <div className="mt-[16px] rounded-[12px] border border-[#24324D] bg-[#0B0E14] px-[18px] py-[15px]">
      <div className="mb-[12px] flex items-center gap-[8px]">
        <span className="h-[7px] w-[7px] rounded-full bg-[#3CF3A7] shadow-[0_0_10px_rgba(60,243,167,0.8)]" />
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#8B96AA]">
          System Log
        </p>
      </div>

      <div className="space-y-[7px] font-mono">
        {systemLog.map((entry, i) => (
          <p
            key={i}
            className={`text-[11px] leading-[16px] ${
              entry.tone === "primary" ? "text-[#00C2E0]" : "text-[#8B96AA]"
            }`}
          >
            <span className="text-[#59657B]">[{entry.time}]</span> {entry.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default SystemLog;