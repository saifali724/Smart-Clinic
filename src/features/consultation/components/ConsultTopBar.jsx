// src/features/consultation/components/ConsultTopBar.jsx
// Figma: 64px bar · logo · "Live Consultation" · REC pill 180×36 in the middle · session text right.

import { formatDuration } from "../utils/audio";

const STATE = {
  idle: { label: "READY", color: "#8C99B8", pulse: false },
  running: { label: "REC", color: "#FF6060", pulse: true },
  paused: { label: "PAUSED", color: "#FF9E3D", pulse: false },
  ending: { label: "SAVING", color: "#00BFD8", pulse: true },
  ended: { label: "SAVED", color: "#32E293", pulse: false },
};

export function ConsultTopBar({ status, seconds, patientName }) {
  const s = STATE[status] || STATE.idle;
  return (
    <header className="m-down relative z-10 flex h-[56px] w-full shrink-0 items-center gap-[12px] bg-[#141824] px-[16px] sm:h-[64px] sm:px-[36px]">
      <p className="shrink-0 text-[19px] font-bold leading-none text-[#00BFD8] sm:text-[22px]">MediScan AI</p>
      <p className="ml-[37px] hidden text-[14px] font-medium leading-none text-[#8C99B8] lg:ml-[49px] lg:block">
        Live Consultation
      </p>

      {/* REC pill — centred on wide screens */}
      <div
        className="ml-auto flex h-[32px] items-center gap-[8px] rounded-[18px] border px-[12px] sm:h-[36px] sm:w-[180px] sm:px-[17px] lg:absolute lg:left-1/2 lg:ml-0 lg:-translate-x-1/2"
        style={{ borderColor: s.color, backgroundColor: `${s.color}1F`, color: s.color }}
      >
        <span className={`h-[8px] w-[8px] shrink-0 rounded-full ${s.pulse ? "c-rec-pulse" : ""}`} style={{ backgroundColor: s.color }} />
        <span className="whitespace-pre text-[12px] font-bold leading-none sm:text-[13px]">
          {`${s.label}   ${formatDuration(seconds)}`}
        </span>
      </div>

      <p className="hidden truncate text-[13px] font-normal leading-none text-[#8C99B8] md:ml-auto md:block lg:max-w-[300px] xl:mr-[64px]">
        {status === "running" || status === "paused" ? "Session active" : status === "ended" ? "Session saved" : "Session ready"}
        {"  ·  "}
        {patientName}
      </p>
    </header>
  );
}

export default ConsultTopBar;
