// src/features/idScanner/components/PatientQueue.jsx

import QueuePatientRow from "./QueuePatientRow";

export function PatientQueue({ patients, selectedPatientId, onSelectPatient }) {
  const total = patients.length;
  const completed = patients.filter((p) => p.status === "Completed").length;
  const remaining = total - completed;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-x-[16px] gap-y-[6px] pl-[4px] pr-[4px] sm:pr-[17px]">
        <p className="text-[11px] font-bold uppercase leading-[13px] text-[#596685]">
          Today's Patient Queue
        </p>
        <p className="whitespace-pre text-[12px] font-normal leading-[15px] text-[#8C99B8]">
          {`${total} scheduled  ·  ${completed} completed  ·  ${remaining} remaining`}
        </p>
      </div>

      <div className="mt-[17px] min-h-0 flex-1 space-y-[14px] overflow-y-auto pb-[40px]">
        {patients.map((patient, i) => (
          <QueuePatientRow
            key={patient.id}
            index={i}
            patient={patient}
            selected={selectedPatientId === patient.id}
            onSelect={onSelectPatient}
          />
        ))}
      </div>
    </div>
  );
}

export default PatientQueue;