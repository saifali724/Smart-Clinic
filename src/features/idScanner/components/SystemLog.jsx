// src/features/idScanner/components/SystemLog.jsx

import { systemLog } from "../data/idScannerContent";

export function SystemLog() {
  return (
    <div style={{ animationDelay: "560ms" }} className="s-up mt-[16px] h-[140px] shrink-0 overflow-hidden rounded-[14px] border border-[#2E3852] bg-[#1A1F2E] px-[14px] pt-[15px] sm:px-[19px]">
      <p className="flex items-center gap-[6px] text-[11px] font-bold uppercase leading-[13px] text-[#32E293]">
        <span className="s-blink h-[7px] w-[7px] rounded-full bg-[#32E293]" />
        System Log
      </p>

      <div className="mt-[7px] space-y-[9px]">
        {systemLog.map((entry, i) => (
          <p
            key={i}
            style={{ animationDelay: `${700 + i * 160}ms` }}
            className={`s-type truncate whitespace-pre text-[11px] font-normal leading-[13px] ${
              entry.tone === "primary" ? "text-[#00BFD8]" : "text-[#8C99B8]"
            }`}
          >
            {`[${entry.time}]  ${entry.text}`}
          </p>
        ))}
      </div>
    </div>
  );
}

export default SystemLog;