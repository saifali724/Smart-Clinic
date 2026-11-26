// src/features/patients/components/PatientRecordHeader.jsx
// Avatar + name + details + condition badges; last-visit info sits on the right on
// wide screens and drops underneath on phones.

import { conditionBadges } from "../data/patientRecordContent";

export default function PatientRecordHeader({ patient }) {
  const initials =
    (patient.fullName || "")
      .split(" ").filter(Boolean).map((w) => w[0]).join("")
      .toUpperCase().slice(0, 2) || "—";

  const meta = [
    patient.patientId && `ID: ${patient.patientId}`,
    patient.dateOfBirth && `DOB: ${patient.dateOfBirth}`,
    patient.age && `Age: ${patient.age}`,
    patient.gender && `Gender: ${patient.gender}`,
  ].filter(Boolean);

  return (
    <div className="flex h-full w-full flex-col gap-[14px] rounded-[18px] border border-[#2e3852] bg-[#141824] p-[14px] sm:flex-row sm:items-start sm:gap-[18px] sm:px-[20px] sm:py-[16px]">
      <div className="flex min-w-0 flex-1 items-start gap-[14px] sm:gap-[18px]">
        {/* avatar */}
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-[#00bfd8] bg-[#0c0f18] sm:h-[68px] sm:w-[68px]">
          <span className="text-[18px] font-bold text-[#00bfd8] sm:text-[22px]">{initials}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[20px] font-extrabold leading-tight text-[#edf2fc] sm:text-[26px]">
            {patient.fullName || "Patient Name"}
          </p>

          {meta.length > 0 && (
            <p className="mt-[4px] flex flex-wrap gap-x-[10px] gap-y-[2px] text-[12px] font-normal leading-[18px] text-[#8c99b8]">
              {meta.map((item, i) => (
                <span key={item} className="whitespace-nowrap">
                  {item}
                  {i < meta.length - 1 && <span className="ml-[10px] text-[#596685]">·</span>}
                </span>
              ))}
            </p>
          )}

          {/* condition badges — wrap onto a second line when narrow */}
          <div className="mt-[10px] flex flex-wrap gap-[8px] sm:gap-[10px]">
            {conditionBadges.map((b) => (
              <div
                key={b.label}
                className="flex h-[24px] min-w-[96px] items-center justify-center rounded-[12px] px-[12px] sm:min-w-[118px]"
                style={{ border: `0.8px solid ${b.border}`, background: b.bg }}
              >
                <span className="text-[10px] font-semibold" style={{ color: b.text }}>
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* last visit */}
      <div className="border-t border-[#2e3852] pt-[12px] sm:border-0 sm:pt-0 sm:text-right">
        <p className="text-[12px] font-normal text-[#8c99b8]">Last Visit: Nov 12, 2024</p>
        <p className="mt-[4px] text-[13px] font-semibold text-[#edf2fc]">
          Dr. Khalid Mahmood — Cardiology
        </p>
      </div>
    </div>
  );
}
