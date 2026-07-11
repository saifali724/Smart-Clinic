// src/features/patients/components/MedicationsCard.jsx

export default function MedicationsCard({ medications }) {
  if (medications.length === 0) {
    return (
      <div className="flex h-[56px] w-full items-center rounded-[10px] border-[0.5px] border-[#2e3852] bg-[#1a1f2e] px-[16px]">
        <p className="text-[12px] text-[#596685]">No previous medications on record.</p>
      </div>
    );
  }

  return (
    <div className="space-y-[14px]">
      {medications.map((med, i) => (
        <div
          key={i}
          className="relative h-[56px] w-full rounded-[10px] border-[0.5px] border-[#2e3852] bg-[#1a1f2e]"
        >
          {/* accent bar — 12,16 · 6×24 */}
          <div
            className="absolute rounded-[3px]"
            style={{ left: 12, top: 16, width: 6, height: 24, backgroundColor: med.color }}
          />
          <p
            className="absolute whitespace-nowrap text-[14px] font-semibold text-[#edf2fc]"
            style={{ left: 28, top: 12 }}
          >
            {med.name}
          </p>
          <p
            className="absolute whitespace-nowrap text-[11px] font-normal text-[#8c99b8]"
            style={{ left: 28, top: 32 }}
          >
            {med.schedule}
          </p>
        </div>
      ))}
    </div>
  );
}