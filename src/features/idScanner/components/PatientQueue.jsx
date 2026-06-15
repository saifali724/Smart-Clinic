// src/features/idScanner/components/PatientQueue.jsx

import QueuePatientRow from "./QueuePatientRow";

export function PatientQueue({ patients, selectedPatientId, onSelectPatient }) {
  return (
    <div>
      <div className="mb-[16px] flex items-center justify-between px-[7px]">
        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#59657B]">
          Today's Patient Queue
        </p>

        <p className="text-[11px] font-medium text-[#8B96AA]">
          12 scheduled
          <span className="mx-[8px] text-[#41506A]">·</span>
          8 completed
          <span className="mx-[8px] text-[#41506A]">·</span>
          4 remaining
        </p>
      </div>

      <div className="space-y-[12px]">
        {patients.map((patient) => (
          <QueuePatientRow
            key={patient.id}
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