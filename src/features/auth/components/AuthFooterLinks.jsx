export function AuthFooterLinks({ footer }) {
  return (
    <footer className="flex items-center justify-center gap-[10px] text-[11px] font-medium leading-none text-[#637088]">
      <span>{footer.copyright}</span>

      {footer.links.map((link) => (
        <span key={link} className="flex items-center gap-[10px]">
          <span>·</span>

          <button type="button" className="text-[#637088]">
            {link}
          </button>
        </span>
      ))}
    </footer>
  );
}