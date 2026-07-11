// src/features/patients/components/VitalsCard.jsx

export default function VitalsCard({ vitals }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[16px] border border-[#2e3852] bg-[#141824] px-[20px] pt-[22px]">
      <p className="pl-[4px] text-[10px] font-bold tracking-[0.06em] text-[#00bfd8]">
        VITALS &amp; HEALTH METRICS
      </p>

      {/* vitals — box 68px + bar 8px flush under, 8px between groups */}
      <div className="mt-[18px] min-h-0 flex-1 space-y-[8px] overflow-y-auto pb-[16px]">
        {vitals.map((v) => {
          const hasReading = v.fillPx > 0;
          return (
            <div key={v.key} className="shrink-0">
              <div className="relative h-[68px] w-full rounded-[10px] border-[0.5px] border-[#2e3852] bg-[#1a1f2e]">
                <p
                  className="absolute whitespace-nowrap text-[11px] font-normal text-[#8c99b8]"
                  style={{ left: 16, top: 10 }}
                >
                  {v.label}
                </p>
                <p className="absolute whitespace-nowrap" style={{ left: 16, top: 26 }}>
                  <span
                    className="text-[18px] font-bold"
                    style={{ color: hasReading ? v.color : "#596685" }}
                  >
                    {v.value}
                  </span>
                  {v.unit && (
                    <span className="ml-[4px] text-[11px] font-normal text-[#596685]">
                      {v.unit}
                    </span>
                  )}
                </p>
              </div>

              {/* progress bar — flush under the box */}
              <div className="h-[8px] w-full bg-[#0c0f18]">
                <div
                  className="h-full rounded-[4px] transition-all duration-700"
                  style={{
                    width: hasReading ? `${Math.min((v.fillPx / 400) * 100, 100)}%` : "0%",
                    backgroundColor: hasReading ? `${v.color}99` : "transparent",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}