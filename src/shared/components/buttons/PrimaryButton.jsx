import { cn } from "../../utils/cn";

export function PrimaryButton({
  children,
  type = "button",
  isLoading = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={isLoading}
      className={cn(
        "flex h-[56px] w-full items-center justify-center rounded-clinic-sm",
        "bg-gradient-to-r from-clinic-primary to-clinic-cyan",
        "text-[15px] font-extrabold tracking-[-0.01em] text-[#031318]",
        "shadow-tealGlow transition-all duration-200",
        "hover:-translate-y-0.5 hover:brightness-110",
        "active:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-clinic-primary/60 focus:ring-offset-2 focus:ring-offset-clinic-panel",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
        className
      )}
      {...props}
    >
      {isLoading ? "Logging in..." : children}
    </button>
  );
}