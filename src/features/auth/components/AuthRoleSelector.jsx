export function AuthRoleSelector({ label, roles, selectedRole, onRoleChange }) {
  return (
    <div>
      <p className="mb-[8px] text-[10px] font-black leading-none tracking-[0.06em] text-[#748096]">
        {label}
      </p>

      <div className="grid grid-cols-1 gap-[8px] min-[400px]:grid-cols-3 min-[400px]:gap-[10px]">
        {roles.map((role) => {
          const isActive = role === selectedRole;

          return (
            <button
              key={role}
              type="button"
              onClick={() => onRoleChange(role)}
              className={[
                "h-[32px] rounded-[8px] px-[6px] border text-[11px] font-bold leading-none transition",
                isActive
                  ? "border-[#00D4E9] bg-[#102032] text-[#00D4E9]"
                  : "border-[#1F2B43] bg-[#161D2E] text-[#8D96A9] hover:border-[#00D4E9]/50",
              ].join(" ")}
            >
              {role}
            </button>
          );
        })}
      </div>
    </div>
  );
}