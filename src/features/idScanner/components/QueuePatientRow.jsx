// src/features/idScanner/components/QueuePatientRow.jsx

function getPriorityStyles(priority) {
  if (priority === "Critical") {
    return "border-[#FF5C7A] bg-[#FF5C7A]/10 text-[#FF5C7A]";
  }

  if (priority === "Urgent") {
    return "border-[#FF8A3D] bg-[#FF8A3D]/10 text-[#FF8A3D]";
  }

  // Normal Schedule (and any unknown value) stays muted.
  return "border-[#64748B] bg-[#64748B]/10 text-[#8B96AA]";
}

function getStatusStyles(status) {
  if (status === "Scanning") {
    return "border-[#00C2E0] bg-[#00C2E0]/10 text-[#00C2E0]";
  }

  if (status === "Waiting") {
    return "border-[#D78A21] bg-[#D78A21]/10 text-[#FFB020]";
  }

  if (status === "Completed") {
    return "border-[#3CF3A7] bg-[#3CF3A7]/10 text-[#3CF3A7]";
  }

  return "border-[#64748B] bg-[#64748B]/10 text-[#8B96AA]";
}

export function QueuePatientRow({ patient, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(patient)}
      className={`flex h-[58px] w-full items-center rounded-[9px] border px-[13px] text-left transition-all duration-300 ${
        selected || patient.status === "Scanning"
          ? "border-[#00C2E0] bg-[#0B2433]"
          : "border-[#1A263A] bg-[#0B0E14] hover:border-[#00C2E0]/40"
      }`}
    >
      <div
        className={`mr-[12px] flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border text-[11px] font-black ${
          selected || patient.status === "Scanning"
            ? "border-[#00C2E0] bg-[#092C3B] text-[#00C2E0]"
            : "border-[#26344F] bg-[#182235] text-[#8B96AA]"
        }`}
      >
        {patient.initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-black leading-none text-[#EEF4FC]">
          {patient.token}
        </p>

        <p className="mt-[7px] truncate text-[10px] font-medium text-[#59657B]">
          {patient.id}
          <span className="mx-[10px] text-[#334155]">·</span>
          <span className="text-[#8B96AA]">{patient.time}</span>
        </p>
      </div>

      {patient.priority && (
        <span
          className={`ml-[10px] flex h-[21px] items-center justify-center rounded-full border px-[12px] text-[8px] font-black ${getPriorityStyles(
            patient.priority,
          )}`}
        >
          {patient.priority}
        </span>
      )}

      <span
        className={`ml-[10px] flex h-[21px] min-w-[78px] items-center justify-center rounded-full border px-[12px] text-[8px] font-black ${getStatusStyles(
          patient.status,
        )}`}
      >
        {patient.status}
      </span>
    </button>
  );
}

export default QueuePatientRow;