// src/features/patients/components/VisitHistoryCard.jsx

export default function VisitHistoryCard({ visitHistory }) {
  if (visitHistory.length === 0) {
    return (
      <div className="flex h-[56px] w-full items-center rounded-[10px] border-[0.5px] border-[#2e3852] bg-[#0c0f18] px-[16px]">
        <p className="text-[12px] text-[#596685]">No previous visits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-[14px]">
      {visitHistory.map((v, i) => (
        <div
          key={i}
          className="relative h-[56px] w-full rounded-[10px] border-[0.5px] border-[#2e3852] bg-[#0c0f18]"
        >
          <p
            className="absolute whitespace-nowrap text-[11px] font-semibold text-[#00bfd8]"
            style={{ left: 16, top: 10 }}
          >
            {v.date}
          </p>
          <p
            className="absolute whitespace-nowrap text-[12px] font-normal text-[#edf2fc]"
            style={{ left: 16, top: 30 }}
          >
            {v.doctor}
          </p>
          <p
            className="absolute whitespace-nowrap text-[12px] font-normal text-[#8c99b8]"
            style={{ left: 152, top: 30 }}
          >
            {v.reason}
          </p>
        </div>
      ))}
    </div>
  );
}