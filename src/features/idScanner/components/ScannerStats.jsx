// src/features/idScanner/components/ScannerStats.jsx

import { useEffect, useState } from "react";
import { scannerStats } from "../data/idScannerContent";

/** "1,247" / "12s" → counts up from 0 when the screen opens, keeps the format */
function CountUp({ value, delay = 0 }) {
  const match = String(value).match(/^([^\d]*)([\d,]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : null;
  const [shown, setShown] = useState(target === null ? value : 0);

  useEffect(() => {
    if (target === null) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setShown(target), 0);
      return () => clearTimeout(t);
    }
    let raf;
    let start;
    const duration = 900;
    const step = (now) => {
      if (start === undefined) start = now + delay;
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      setShown(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, delay]);

  if (target === null) return value;
  const withCommas = match[2].includes(",") ? Number(shown).toLocaleString("en-US") : String(shown);
  return `${match[1]}${withCommas}${match[3]}`;
}

export function ScannerStats() {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-[10px] xl:grid-cols-4">
      {scannerStats.map((stat, i) => (
        <div
          key={stat.label}
          style={{ animationDelay: `${420 + i * 80}ms` }}
          className="s-pop h-[88px] rounded-[14px] border border-[#2E3852] bg-[#1A1F2E] px-[14px] pt-[15px] sm:px-[17px]"
        >
          <p
            className="text-[24px] font-extrabold leading-[34px] tabular-nums sm:text-[28px]"
            style={{ color: stat.color }}
          >
            <CountUp value={stat.value} delay={420 + i * 80} />
          </p>
          <p className="mt-[4px] text-[11px] font-normal leading-[13px] text-[#8C99B8]">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ScannerStats;
