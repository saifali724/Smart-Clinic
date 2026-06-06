import { cn } from "../../utils/cn";

export function AuthInput({
  id,
  label,
  error,
  leftIcon,
  className = "",
  ...props
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={id}
        className="block text-[13px] font-bold tracking-[-0.01em] text-clinic-heading"
      >
        {label}
      </label>

      <div
        className={cn(
          "flex h-[56px] items-center gap-3 rounded-clinic-sm border px-4",
          "bg-clinic-card/85 shadow-inputGlow transition-all duration-200",
          error
            ? "border-clinic-danger/70"
            : "border-clinic-border focus-within:border-clinic-primary/70"
        )}
      >
        {leftIcon ? (
          <span className="text-[18px] text-clinic-muted">{leftIcon}</span>
        ) : null}

        <input
          id={id}
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-clinic-heading outline-none placeholder:text-clinic-faint"
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[12px] font-semibold text-clinic-danger">{error}</p>
      ) : null}
    </div>
  );
}