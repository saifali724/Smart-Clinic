import { assetPaths } from "../../../shared/constants/assetPaths";
import { PrimaryButton } from "../../../shared/components/buttons/PrimaryButton";
import { SocialButton } from "../../../shared/components/buttons/SocialButton";
import { AuthInput } from "../../../shared/components/inputs/AuthInput";
import { PasswordInput } from "../../../shared/components/inputs/PasswordInput";

export function LoginForm({
  content,
  credentials,
  errors,
  isSubmitting,
  onCredentialChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AuthInput
        id="login-email"
        label={content.emailLabel}
        type="email"
        value={credentials.email}
        placeholder={content.emailPlaceholder}
        autoComplete="email"
        leftIcon="✉️"
        error={errors.email}
        onChange={(event) => onCredentialChange("email", event.target.value)}
      />

      <PasswordInput
        id="login-password"
        label={content.passwordLabel}
        value={credentials.password}
        placeholder={content.passwordPlaceholder}
        error={errors.password}
        onChange={(event) => onCredentialChange("password", event.target.value)}
      />

      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-3 text-[13px] font-bold text-clinic-muted">
          <input
            type="checkbox"
            checked={credentials.rememberMe}
            onChange={(event) =>
              onCredentialChange("rememberMe", event.target.checked)
            }
            className="h-[17px] w-[17px] rounded border-clinic-border bg-clinic-card text-clinic-primary focus:ring-clinic-primary/40"
          />

          <span>{content.rememberLabel}</span>
        </label>

        <button
          type="button"
          className="text-[13px] font-extrabold text-clinic-primary transition hover:text-clinic-cyan"
        >
          {content.forgotPasswordLabel}
        </button>
      </div>

      {errors.form ? (
        <div className="rounded-clinic-sm border border-clinic-danger/40 bg-clinic-danger/10 px-4 py-3 text-[13px] font-bold text-clinic-danger">
          {errors.form}
        </div>
      ) : null}

      <PrimaryButton type="submit" isLoading={isSubmitting}>
        {content.submitLabel}
      </PrimaryButton>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-clinic-border" />
        <span className="text-[12px] font-black uppercase tracking-[0.18em] text-clinic-faint">
          {content.dividerText}
        </span>
        <div className="h-px flex-1 bg-clinic-border" />
      </div>

      <SocialButton icon={assetPaths.icons.google}>
        {content.googleLabel}
      </SocialButton>
    </form>
  );
}