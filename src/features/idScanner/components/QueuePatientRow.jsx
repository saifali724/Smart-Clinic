// src/features/idScanner/components/QueuePatientRow.jsx

// Status pill colours from the Figma file
const STATUS_COLORS = {
  Scanning: "#00BFD8",
  Waiting: "#FF9E3D",
  Completed: "#32E293",
  Scheduled: "#8C99B8",
};

// Priority shown as coloured text in the second line
const PRIORITY_COLORS = {
  Critical: "#FF6060",
  Urgent: "#FF9E3D",
};

export function QueuePatientRow({ patient, selected, onSelect, index = 0 }) {
  const active = selected || patient.status === "Scanning";
  const statusColor = STATUS_COLORS[patient.status] || "#8C99B8";
  const priorityColor = PRIORITY_COLORS[patient.priority] || "#8C99B8";

  return (
    <button
      type="button"
      onClick={() => onSelect(patient)}
      style={{ animationDelay: `${280 + Math.min(index, 10) * 55}ms` }}
      className={`s-up flex h-[60px] w-full items-center rounded-[12px] pl-[12px] pr-[12px] text-left sm:pl-[16px] sm:pr-[18px] transition-colors ${
        active
          ? "border-[1.5px] border-[#00BFD8] bg-[#00BFD8]/[0.07]"
          : "border-[0.5px] border-[#2E3852] bg-[#0C0F18] hover:border-[#00BFD8]/60"
      }`}
    >
      <div
        className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border text-[13px] font-bold leading-none ${
          active
            ? "border-[#00BFD8] bg-[#00BFD8]/20 text-[#00BFD8]"
            : "border-[#2E3852] bg-[#1A1F2E] text-[#8C99B8]"
        }`}
      >
        {patient.initials}
      </div>

      <div className="ml-[12px] min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-[17px] text-[#EDF2FC]">
          {patient.token}
        </p>
        <p className="mt-[3px] truncate whitespace-pre text-[11px] font-normal leading-[13px] text-[#8C99B8]">
          {patient.id}
          {/* time is hidden where the row is narrow (phones, and 1024–1279px) so the priority stays visible */}
          <span className="hidden sm:inline lg:hidden xl:inline">{`   ·   ${patient.time}`}</span>
          {patient.priority && (
            <>
              {"   ·   "}
              <span style={{ color: priorityColor }}>{patient.priority}</span>
            </>
          )}
        </p>
      </div>

      <span
        className="ml-[10px] flex h-[24px] w-[76px] shrink-0 sm:ml-[12px] sm:w-[88px] items-center justify-center rounded-[12px] border-[0.8px] text-[10px] font-semibold leading-none"
        style={{
          color: statusColor,
          borderColor: statusColor,
          backgroundColor: `${statusColor}26`, // 15% opacity
        }}
      >
        {patient.status}
      </span>
    </button>
  );
}

export default QueuePatientRow;