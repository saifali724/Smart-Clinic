export function HospitalSsoButton({ children }) {
  return (
    <button
      type="button"
      className="relative flex h-[46px] w-full items-center justify-center rounded-[9px] border border-[#253451] bg-[#151B2C] text-[13px] font-semibold tracking-[0.03em] text-[#8C95A9] transition hover:border-[#00CFE8]/60 hover:text-[#DDE7F5]"
    >
      <span>{children}</span>

      <span className="absolute right-[22px] top-1/2 -translate-y-1/2 text-[18px] font-normal leading-none text-[#737D90]">
        →
      </span>
    </button>
  );
}