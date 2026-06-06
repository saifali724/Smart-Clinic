import { useState } from "react";
import { cn } from "../../utils/cn";

export function PasswordInput({
  id,
  label,
  value,
  placeholder,
  error,
  onChange,
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
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
        <span className="text-[18px] text-clinic-muted">🔒</span>

        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-clinic-heading outline-none placeholder:text-clinic-faint"
        />

        <button
          type="button"
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[14px] text-clinic-muted transition hover:bg-clinic-border/40 hover:text-clinic-heading"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? "🙈" : "👁"}
        </button>
      </div>

      {error ? (
        <p className="text-[12px] font-semibold text-clinic-danger">{error}</p>
      ) : null}
    </div>
  );
}