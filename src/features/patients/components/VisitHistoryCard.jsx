// src/features/patients/components/VisitHistoryCard.jsx

export default function VisitHistoryCard({ visitHistory }) {
  if (visitHistory.length === 0) {
    return (
      <div className="flex min-h-[56px] w-full items-center rounded-[10px] border-[0.5px] border-[#2e3852] bg-[#0c0f18] px-[16px]">
        <p className="text-[12px] text-[#596685]">No previous visits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-[14px]">
      {visitHistory.map((v, i) => (
        <div
          key={i}
          className="min-h-[56px] w-full rounded-[10px] border-[0.5px] border-[#2e3852] bg-[#0c0f18] px-[16px] py-[9px]"
        >
          <p className="text-[11px] font-semibold leading-[14px] text-[#00bfd8]">{v.date}</p>
          {/* doctor in a fixed 136px column, reason fills the rest (wraps if long) */}
          <div className="mt-[5px] flex gap-[12px] text-[12px] leading-[16px]">
            <p className="w-[124px] shrink-0 truncate font-normal text-[#edf2fc]">{v.doctor}</p>
            <p className="min-w-0 flex-1 font-normal text-[#8c99b8]">{v.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
