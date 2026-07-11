// src/features/patients/components/PatientRecordHeader.jsx

import { conditionBadges } from "../data/patientRecordContent";

export default function PatientRecordHeader({ patient }) {
  const initials =
    (patient.fullName || "")
      .split(" ").filter(Boolean).map((w) => w[0]).join("")
      .toUpperCase().slice(0, 2) || "—";

  const meta = [
    "ID: #PT-2847",
    patient.dateOfBirth && `DOB: ${patient.dateOfBirth}`,
    patient.age && `Age: ${patient.age}`,
    patient.gender && `Gender: ${patient.gender}`,
  ].filter(Boolean).join("  ·  ");

  return (
    <div className="relative h-full w-full rounded-[18px] border border-[#2e3852] bg-[#141824]">
      {/* avatar — 20,16 · 68×68 */}
      <div
        className="absolute flex items-center justify-center rounded-full border-2 border-[#00bfd8] bg-[#0c0f18]"
        style={{ left: 20, top: 16, width: 68, height: 68 }}
      >
        <span className="text-[22px] font-bold text-[#00bfd8]">{initials}</span>
      </div>

      {/* name — 106,8 */}
      <p
        className="absolute whitespace-nowrap text-[26px] font-extrabold leading-normal text-[#edf2fc]"
        style={{ left: 106, top: 8 }}
      >
        {patient.fullName || "Patient Name"}
      </p>

      {/* meta — 106,44 */}
      <p
        className="absolute whitespace-pre text-[12px] font-normal text-[#8c99b8]"
        style={{ left: 106, top: 44 }}
      >
        {meta}
      </p>

      {/* badges — 106,68 · 118 wide · 128 pitch */}
      {conditionBadges.map((b, i) => (
        <div
          key={b.label}
          className="absolute flex items-center justify-center rounded-[12px]"
          style={{
            left: 106 + i * 128,
            top: 68,
            width: 118,
            height: 24,
            border: `0.8px solid ${b.border}`,
            background: b.bg,
          }}
        >
          <span className="text-[10px] font-semibold" style={{ color: b.text }}>
            {b.label}
          </span>
        </div>
      ))}

      {/* right side — anchored to the right edge like Figma */}
      <div className="absolute text-right" style={{ right: 20, top: 16 }}>
        <p className="text-[12px] font-normal text-[#8c99b8]">Last Visit: Nov 12, 2024</p>
        <p className="mt-[4px] text-[13px] font-semibold text-[#edf2fc]">
          Dr. Khalid Mahmood — Cardiology
        </p>
      </div>
    </div>
  );
}