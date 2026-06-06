export function AuthTopBar({ content }) {
  return (
    <header className="absolute left-0 right-0 top-[54px] z-20 hidden items-center justify-between px-[86px] lg:flex">
      <p className="ml-[525px] text-[12px] font-medium tracking-[0.01em] text-[#8794A9]">
        {content.welcome}
      </p>

      <div className="flex items-center gap-4">
        <span className="text-[12px] font-medium text-[#9AA5B7]">
          {content.signupText}
        </span>

        <button
          type="button"
          className="h-[30px] w-[96px] rounded-[6px] border border-[#08CFE8] text-[11px] font-bold text-[#08D4E9] transition hover:bg-[#08D4E9]/10"
        >
          {content.signupButton}
        </button>
      </div>
    </header>
  );
}