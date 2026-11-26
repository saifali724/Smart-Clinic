export function SecurityNotice({ text, twoFactor }) {
  return (
    <div className="space-y-[15px]">
      <div className="flex min-h-[37px] items-center justify-center rounded-[7px] px-[12px] py-[9px] border border-[#1B263C] bg-[#070C15]">
        <p className="text-center text-[10px] font-medium leading-[14px] tracking-[0.02em] text-[#58657A]">
          {text}
        </p>
      </div>

      <button
        type="button"
        className="mx-auto flex items-center gap-[8px] text-[12px] font-bold leading-none tracking-[0.01em] text-[#00D4E9] transition hover:text-[#33E9F8]"
      >
        {twoFactor}
        <span>→</span>
      </button>
    </div>
  );
}