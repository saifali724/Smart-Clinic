import { HospitalSsoButton } from "./HospitalSsoButton";
import { SecurityNotice } from "./SecurityNotice";
import { AuthRoleSelector } from "./AuthRoleSelector";

export function DoctorLoginCard({
  content,
  credentials,
  isSubmitting,
  onCredentialChange,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="h-[611px] w-[576px] rounded-[22px] border border-[#26354F] bg-[#121827] px-[34px] pb-[20px] pt-[39px] shadow-[0_28px_80px_rgba(0,0,0,0.22)]"
    >
      <h1 className="text-[29px] font-black leading-none tracking-[0.01em] text-[#EEF4FC]">
        {content.title}
      </h1>

      <p className="mt-[19px] border-b border-[#2A3852] pb-[13px] text-[14px] font-medium tracking-[0.04em] text-[#8B96AA]">
        {content.subtitle}
      </p>

      <div className="relative mt-[17px]">
        <HospitalSsoButton>{content.ssoButton}</HospitalSsoButton>
      </div>

      <div className="my-[14px] flex items-center gap-[15px]">
        <div className="h-px flex-1 bg-[#26334B]" />
        <span className="text-[11px] font-bold leading-none tracking-[0.12em] text-[#59657B]">
          {content.divider}
        </span>
        <div className="h-px flex-1 bg-[#26334B]" />
      </div>

      <div>
        <label className="mb-[7px] block text-[9px] font-black leading-none tracking-[0.06em] text-[#68758C]">
          {content.emailLabel}
        </label>

        <input
          type="email"
          value={credentials.email}
          onChange={(event) => onCredentialChange("email", event.target.value)}
          placeholder={content.emailPlaceholder}
          className="h-[45px] w-full rounded-[9px] border border-[#00D4E9] bg-[#121B2B] px-[21px] text-[13px] font-semibold tracking-[0.03em] text-[#DCE6F3] caret-[#00D4E9] outline-none shadow-[0_0_0_1px_rgba(0,212,233,0.18)] placeholder:text-[#7B8497]"
        />
      </div>

      <div className="mt-[17px]">
        <label className="mb-[7px] block text-[9px] font-black leading-none tracking-[0.06em] text-[#68758C]">
          {content.passwordLabel}
        </label>

        <div className="relative">
          <input
            type="password"
            value={credentials.password}
            onChange={(event) =>
              onCredentialChange("password", event.target.value)
            }
            placeholder={content.passwordPlaceholder}
            className="h-[45px] w-full rounded-[9px] border border-[#263552] bg-[#151B2B] px-[21px] pr-[48px] text-[13px] font-semibold tracking-[0.08em] text-[#DCE6F3] outline-none placeholder:text-[#A3AABD] focus:border-[#00D4E9]"
          />

          <button
            type="button"
            className="absolute right-[18px] top-1/2 -translate-y-1/2 text-[12px] leading-none text-[#A3AABD]"
          >
            👁
          </button>
        </div>
      </div>

      <div className="mt-[17px] flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-[7px] text-[13px] font-medium leading-none text-[#8C97AB]">
          <input
            type="checkbox"
            checked={credentials.rememberMe}
            onChange={(event) =>
              onCredentialChange("rememberMe", event.target.checked)
            }
            className="h-[14px] w-[14px] rounded border-[#00D4E9] bg-[#132033] accent-[#00D4E9]"
          />

          {content.rememberMe}
        </label>

        <button
          type="button"
          className="text-[12px] font-bold leading-none text-[#00D4E9]"
        >
          {content.forgotPassword}
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-[18px] h-[49px] w-full rounded-[9px] bg-[#10BCD1] text-[14px] font-black leading-none text-[#06111A] transition hover:bg-[#20D5E9] disabled:opacity-70"
      >
        {isSubmitting ? "Signing In..." : content.submitButton}
      </button>

      <div className="mt-[15px]">
        <SecurityNotice
          text={content.securityText}
          twoFactor={content.twoFactor}
        />
      </div>

      <div className="mt-[15px]">
        <AuthRoleSelector
          label={content.signInAs}
          roles={content.roles}
          selectedRole={credentials.role}
          onRoleChange={(role) => onCredentialChange("role", role)}
        />
      </div>
    </form>
  );
}