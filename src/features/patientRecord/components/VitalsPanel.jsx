// src/features/patientRecord/components/VitalsPanel.jsx
//
// Figma: 6 boxes 68px tall, 16px apart, radius 10; label 11px, value 18px bold
// in the vital's colour, unit 11px; an 8px bar along the bottom.
// Values come live from the sensors (see services/vitalsService.js).

import RecordPanel from "./RecordPanel";

function timeAgo(ms) {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function SensorState({ vital }) {
  if (vital.status === "live") {
    return (
      <span className="flex items-center gap-[6px] text-[10px] font-medium leading-none text-[#32E293]">
        <span className="rec-pulse h-[6px] w-[6px] rounded-full bg-[#32E293]" />
        Live
      </span>
    );
  }
  if (vital.status === "stale") {
    return (
      <span className="text-[10px] font-medium leading-none text-[#596685]">
        {timeAgo(vital.time)}
      </span>
    );
  }
  return <span className="text-[10px] font-medium leading-none text-[#596685]">Waiting for sensor</span>;
}

function VitalBox({ vital }) {
  const waiting = vital.status === "waiting";
  return (
    <div className="relative h-[68px] overflow-hidden rounded-[10px] border-[0.5px] border-[#2E3852] bg-[#1A1F2E]">
      <div className="flex items-start justify-between pl-[16px] pr-[14px] pt-[10px]">
        <p className="text-[11px] font-normal leading-[13px] text-[#8C99B8]">{vital.label}</p>
        <SensorState vital={vital} />
      </div>

      <div className="mt-[3px] flex items-baseline pl-[16px]">
        {/* key = value → the number replays a small animation whenever it changes */}
        <span
          key={vital.text}
          className={`text-[18px] font-bold leading-[22px] ${waiting ? "" : "rec-flash"}`}
          style={{ color: waiting ? "#596685" : vital.color }}
        >
          {vital.text}
        </span>
        {vital.unit && (
          <span className="ml-[2px] text-[11px] font-normal leading-[13px] text-[#596685]">
            {vital.unit}
          </span>
        )}
      </div>

      {/* bar: track + fill (fill = 60% of the vital colour) */}
      <div className="absolute bottom-0 left-0 right-0 h-[8px] bg-[#0C0F18]">
        <div
          className="h-full rounded-[4px] transition-[width] duration-700 ease-out"
          style={{ width: `${vital.percent}%`, backgroundColor: vital.color, opacity: 0.6 }}
        />
      </div>
    </div>
  );
}

export function VitalsPanel({ vitals, anyLive, isLoading, delay }) {
  const right = isLoading ? null : anyLive ? (
    <span className="flex items-center gap-[6px] text-[10px] font-bold leading-none text-[#32E293]">
      <span className="rec-pulse h-[6px] w-[6px] rounded-full bg-[#32E293]" />
      LIVE
    </span>
  ) : (
    <span className="text-[10px] font-bold leading-none text-[#596685]">SENSORS IDLE</span>
  );

  return (
    <RecordPanel title="Vitals & Health Metrics" right={right} delay={delay}>
      <div className="m-stagger mt-[16px] space-y-[16px] px-[19px]" style={{ "--m-base": `${delay + 140}ms`, "--m-step": "70ms" }}>
        {isLoading
          ? vitals.map((v) => <div key={v.key} className="rec-skeleton h-[68px] rounded-[10px]" />)
          : vitals.map((v) => <VitalBox key={v.key} vital={v} />)}
      </div>
    </RecordPanel>
  );
}

export default VitalsPanel;
