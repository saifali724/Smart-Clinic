export function AuthFooterLinks({ footer }) {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-[10px] gap-y-[6px] text-center text-[11px] font-medium leading-none text-[#637088]">
      <span>{footer.copyright}</span>

      {footer.links.map((link) => (
        <span key={link} className="flex items-center gap-[10px]">
          <span>·</span>

          <button type="button" className="transition hover:text-[#00D4E9]">
            {link}
          </button>
        </span>
      ))}
    </footer>
  );
}
