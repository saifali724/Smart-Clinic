import { cn } from "../../utils/cn";

export function SocialButton({ icon, children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-[54px] w-full items-center justify-center gap-3 rounded-clinic-sm",
        "border border-clinic-border bg-clinic-card/80",
        "text-[14px] font-bold text-clinic-heading",
        "transition-all duration-200 hover:border-clinic-primary/50 hover:bg-clinic-cardSoft",
        "focus:outline-none focus:ring-2 focus:ring-clinic-primary/50",
        className
      )}
      {...props}
    >
      {icon ? (
        <img src={icon} alt="" className="h-5 w-5 object-contain" />
      ) : null}

      <span>{children}</span>
    </button>
  );
}