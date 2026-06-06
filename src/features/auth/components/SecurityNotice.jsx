export function SecurityNotice({ text, twoFactor }) {
  return (
    <div className="space-y-[15px]">
      <div className="flex h-[37px] items-center justify-center rounded-[7px] border border-[#1B263C] bg-[#070C15]">
        <p className="text-[10px] font-medium leading-none tracking-[0.02em] text-[#58657A]">
          {text}
        </p>
      </div>

      <button
        type="button"
        className="mx-auto flex items-center gap-[8px] text-[12px] font-bold leading-none tracking-[0.01em] text-[#00D4E9]"
      >
        {twoFactor}
        <span>→</span>
      </button>
    </div>
  );
}