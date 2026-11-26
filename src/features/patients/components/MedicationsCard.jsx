// src/features/patients/components/MedicationsCard.jsx

export default function MedicationsCard({ medications }) {
  if (medications.length === 0) {
    return (
      <div className="flex min-h-[56px] w-full items-center rounded-[10px] border-[0.5px] border-[#2e3852] bg-[#1a1f2e] px-[16px]">
        <p className="text-[12px] text-[#596685]">No previous medications on record.</p>
      </div>
    );
  }

  return (
    <div className="space-y-[14px]">
      {medications.map((med, i) => (
        <div
          key={i}
          className="flex min-h-[56px] w-full items-center gap-[10px] rounded-[10px] border-[0.5px] border-[#2e3852] bg-[#1a1f2e] py-[8px] pl-[12px] pr-[14px]"
        >
          {/* accent bar 6×24 */}
          <div className="h-[24px] w-[6px] shrink-0 rounded-[3px]" style={{ backgroundColor: med.color }} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-[18px] text-[#edf2fc]">{med.name}</p>
            <p className="mt-[2px] truncate text-[11px] font-normal leading-[14px] text-[#8c99b8]">
              {med.schedule}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
