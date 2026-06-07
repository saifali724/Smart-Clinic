export function AuthFooterLinks({ footer }) {
  return (
    <footer className="mt-[31px] flex items-center justify-center gap-[10px] text-[11px] font-medium leading-none text-[#637088]">
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