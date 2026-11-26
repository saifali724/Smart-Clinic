// src/features/patientRecord/components/HistoryPanel.jsx
//
// Third column of Figma: CURRENT MEDICATIONS (56px boxes, colour bar 6×24)
// then VISIT HISTORY (56px boxes: date, doctor, reason at 152px).
// Both lists come live from the database; first-visit patients see a short note.

import { MEDICATION_COLORS } from "../data/recordConfig";
import { formatDate, shortDoctorName } from "../utils/format";
import RecordPanel from "./RecordPanel";

function EmptyRow({ children, dark }) {
  return (
    <div
      className={`flex h-[56px] items-center rounded-[10px] border-[0.5px] border-[#2E3852] px-[16px] text-[12px] font-normal leading-[15px] text-[#596685] ${
        dark ? "bg-[#0C0F18]" : "bg-[#1A1F2E]"
      }`}
    >
      {children}
    </div>
  );
}

function Medication({ med, index }) {
  const color = med.color || MEDICATION_COLORS[index % MEDICATION_COLORS.length];
  return (
    <div
      className="rec-fade-up relative h-[56px] rounded-[10px] border-[0.5px] border-[#2E3852] bg-[#1A1F2E] pl-[28px] pr-[14px] pt-[12px]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span
        className="absolute left-[12px] top-[16px] h-[24px] w-[6px] rounded-[3px]"
        style={{ backgroundColor: color }}
      />
      <p className="truncate text-[14px] font-semibold leading-[17px] text-[#EDF2FC]">{med.name}</p>
      <p className="mt-[3px] truncate text-[11px] font-normal leading-[13px] text-[#8C99B8]">
        {med.schedule}
      </p>
    </div>
  );
}

function Visit({ visit, index }) {
  const reason =
    visit.reason ||
    (Array.isArray(visit.diagnoses) && visit.diagnoses.length ? visit.diagnoses.join(", ") : "Consultation");
  return (
    <div
      className="rec-fade-up h-[56px] rounded-[10px] border-[0.5px] border-[#2E3852] bg-[#0C0F18] px-[16px] pt-[10px]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <p className="text-[11px] font-semibold leading-[13px] text-[#00BFD8]">{formatDate(visit.date)}</p>
      <div className="mt-[7px] flex text-[12px] font-normal leading-[15px]">
        <p className="w-[136px] shrink-0 truncate pr-[12px] text-[#EDF2FC]">
          {shortDoctorName(visit.doctorName) || "—"}
        </p>
        <p className="min-w-0 flex-1 truncate text-[#8C99B8]">{reason}</p>
      </div>
    </div>
  );
}

export function HistoryPanel({ medications, visits, isLoading, delay, className }) {
  return (
    <RecordPanel title="Current Medications" delay={delay} className={className}>
      <div className="grid gap-x-[16px] pl-[15px] pr-[19px] md:grid-cols-2 xl:block">
        {/* medications */}
        <div className="mt-[14px] space-y-[14px]">
          {isLoading ? (
            [0, 1].map((i) => <div key={i} className="rec-skeleton h-[56px] rounded-[10px]" />)
          ) : medications.length ? (
            medications.map((m, i) => <Medication key={m.id || i} med={m} index={i} />)
          ) : (
            <EmptyRow>No current medications on record</EmptyRow>
          )}
        </div>

        {/* visit history */}
        <div className="mt-[28px] md:mt-[-12px] xl:mt-[28px]">
          {/* on tablets this column sits next to medications, so it gets its own title */}
          <h2 className="pl-[8px] text-[10px] font-bold uppercase leading-[12px] text-[#00BFD8]">
            Visit History
          </h2>
          <div className="mt-[12px] space-y-[14px]">
            {isLoading ? (
              [0, 1].map((i) => <div key={i} className="rec-skeleton h-[56px] rounded-[10px]" />)
            ) : visits.length ? (
              visits.map((v, i) => <Visit key={v.id} visit={v} index={i} />)
            ) : (
              <EmptyRow dark>First visit — no previous history</EmptyRow>
            )}
          </div>
        </div>
      </div>
    </RecordPanel>
  );
}

export default HistoryPanel;
