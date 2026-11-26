// src/features/patientRecord/components/RecordHeader.jsx
//
// Figma header (1368×110, radius 18): avatar 68px, name 26px, details line,
// condition badges 118×24, and on the right: last visit + logged-in doctor.
//
// Rules:
//  • "Active" badge is always shown (the patient is being checked now)
//  • other badges = major issues from the LAST visit; none on a first visit
//  • "Last Visit" line only if the patient has been here before
//  • doctor line = the doctor who is logged in right now

import { BADGE_COLORS, BADGE_FALLBACK } from "../data/recordConfig";
import { ageFromDob, formatDate, initials, withDrPrefix } from "../utils/format";

function badgeColor(label, index) {
  return BADGE_COLORS[label.trim().toLowerCase()] || BADGE_FALLBACK[index % BADGE_FALLBACK.length];
}

function Badge({ label, color, delay }) {
  return (
    <span
      className="rec-badge-in flex h-[24px] min-w-[118px] items-center rounded-[12px] px-[12px] text-[10px] font-semibold leading-none"
      style={{
        color,
        border: `0.8px solid ${color}`,
        backgroundColor: `${color}26`, // 15%
        animationDelay: `${delay}ms`,
      }}
    >
      {label}
    </span>
  );
}

export function RecordHeader({ patient, patientId, conditions, lastVisit, doctor, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex min-h-[110px] w-full items-start gap-[18px] rounded-[18px] border border-[#2E3852] bg-[#141824] px-[20px] pb-[18px] pt-[16px]">
        <div className="rec-skeleton h-[52px] w-[52px] shrink-0 rounded-full sm:h-[68px] sm:w-[68px]" />
        <div className="flex-1 space-y-[10px] pt-[4px]">
          <div className="rec-skeleton h-[24px] w-[200px] max-w-full rounded-[6px]" />
          <div className="rec-skeleton h-[12px] w-[380px] max-w-full rounded-[6px]" />
          <div className="rec-skeleton h-[24px] w-[118px] rounded-[12px]" />
        </div>
      </div>
    );
  }

  const age = patient?.age || ageFromDob(patient?.dateOfBirth);
  const details = [
    patientId && `ID: #${patientId}`,
    patient?.fatherName && `Father: ${patient.fatherName}`,
    patient?.dateOfBirth && `DOB: ${patient.dateOfBirth}`,
    age && `Age: ${age}`,
    patient?.gender && `Gender: ${patient.gender}`,
    patient?.bloodGroup && `Blood: ${patient.bloodGroup}`,
  ].filter(Boolean);

  const doctorLine = doctor?.fullName
    ? [withDrPrefix(doctor.fullName), doctor.specialization].filter(Boolean).join(" — ")
    : "";

  const lastVisitDate = lastVisit ? formatDate(lastVisit.date) : "";

  return (
    <div className="rec-fade-in flex w-full flex-col rounded-[18px] border border-[#2E3852] bg-[#141824] sm:min-h-[110px] sm:flex-row sm:items-start">
      {/* left: avatar + name + details + badges */}
      <div className="flex min-w-0 flex-1 items-start gap-[14px] px-[14px] pb-[16px] pt-[14px] sm:gap-[18px] sm:pb-[15px] sm:pl-[19px] sm:pr-[16px] sm:pt-[11px]">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-[#00BFD8] bg-[#00BFD8]/[0.12] sm:mt-[4px] sm:h-[68px] sm:w-[68px]">
          <span className="text-[18px] font-bold leading-none text-[#00BFD8] sm:text-[22px]">
            {initials(patient?.fullName)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[20px] font-extrabold leading-[26px] text-[#EDF2FC] sm:text-[26px] sm:leading-[31px]">
            {patient?.fullName || "Unnamed patient"}
          </h1>

          {details.length > 0 && (
            <p className="mt-[3px] flex flex-wrap text-[12px] font-normal leading-[15px] text-[#8C99B8] sm:mt-[1px]">
              {details.map((item, i) => (
                <span key={item} className="whitespace-nowrap">
                  {item}
                  {i < details.length - 1 && <span className="whitespace-pre">{"  ·  "}</span>}
                </span>
              ))}
            </p>
          )}

          <div className="mt-[9px] flex flex-wrap gap-[8px] sm:gap-[10px]">
            <Badge label="Active" color={BADGE_COLORS.active} delay={150} />
            {conditions.map((c, i) => (
              <Badge key={c} label={c} color={badgeColor(c, i)} delay={220 + i * 70} />
            ))}
          </div>
        </div>
      </div>

      {/* right: last visit + doctor */}
      {(lastVisitDate || doctorLine) && (
        <div className="border-t border-[#2E3852] px-[14px] pb-[14px] pt-[12px] sm:shrink-0 sm:border-0 sm:pb-[15px] sm:pl-0 sm:pr-[49px] sm:pt-[15px]">
          {lastVisitDate && (
            <p className="text-[12px] font-normal leading-[15px] text-[#8C99B8]">
              Last Visit: {lastVisitDate}
            </p>
          )}
          {doctorLine && (
            <p
              className={`text-[13px] font-semibold leading-[16px] text-[#EDF2FC] ${
                lastVisitDate ? "mt-[5px]" : ""
              }`}
            >
              {doctorLine}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default RecordHeader;
