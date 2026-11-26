// src/features/auth/components/ForgotPasswordCard.jsx
// Same card style as the Doctor Login card (#121827, radius 22, 45px inputs,
// cyan 49px button). Shows one of 4 steps: email → code → new password → done.

import { useState } from "react";
import { forgotPasswordContent as c } from "../data/forgotPasswordContent";
import { OtpInput } from "./OtpInput";

const cardClass =
  "w-full rounded-[18px] sm:rounded-[22px] border border-[#26354F] bg-[#121827] px-[18px] pb-[22px] pt-[26px] sm:px-[34px] sm:pb-[26px] sm:pt-[39px] shadow-[0_28px_80px_rgba(0,0,0,0.22)]";

const labelClass = "mb-[7px] block text-[9px] font-black leading-none tracking-[0.06em] text-[#68758C]";

const inputClass =
  "h-[45px] w-full rounded-[9px] border border-[#263552] bg-[#151B2B] px-[21px] text-[13px] font-semibold tracking-[0.03em] text-[#DCE6F3] caret-[#00D4E9] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#7B8497] focus:border-[#00D4E9] focus:shadow-[0_0_0_1px_rgba(0,212,233,0.18)]";

const primaryButton =
  "mt-[18px] flex h-[49px] w-full items-center justify-center gap-[10px] rounded-[9px] bg-[#10BCD1] text-[14px] font-black leading-none text-[#06111A] transition hover:bg-[#20D5E9] disabled:cursor-not-allowed disabled:opacity-60";

const linkButton =
  "text-[12px] font-bold leading-none text-[#00D4E9] transition hover:text-[#5BE6F3] hover:underline underline-offset-4 disabled:cursor-not-allowed disabled:text-[#59657B] disabled:no-underline";

function maskEmail(email) {
  const [user, domain] = email.trim().split("@");
  if (!domain) return email;
  const shown = user.length <= 2 ? user[0] : `${user.slice(0, 2)}${"•".repeat(Math.min(user.length - 2, 6))}`;
  return `${shown}@${domain}`;
}

function Spinner() {
  return (
    <span className="h-[16px] w-[16px] animate-spin rounded-full border-2 border-[#06111A]/30 border-t-[#06111A]" />
  );
}

function StepIndicator({ step }) {
  const index = { email: 0, otp: 1, password: 2, done: 3 }[step];
  return (
    <ol className="mb-[22px] flex items-center gap-[8px] sm:mb-[26px]">
      {c.steps.map((label, i) => {
        const done = i < index;
        const active = i === index;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-[8px]">
            <span
              className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${
                done
                  ? "bg-[#3DF5A0] text-[#06111A]"
                  : active
                  ? "border-[1.5px] border-[#08CFE8] bg-[#08CFE8]/[0.12] text-[#08D4E9] shadow-[0_0_0_4px_rgba(8,207,232,0.10)]"
                  : "border-[1.5px] border-[#2A3650] bg-[#151F30] text-[#4A5568]"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={`hidden truncate text-[11px] font-bold tracking-[0.04em] min-[420px]:inline ${
                active ? "text-[#EEF4FC]" : done ? "text-[#8A9AB5]" : "text-[#4A5568]"
              }`}
            >
              {label}
            </span>
            {i < c.steps.length - 1 && (
              <span className="h-px min-w-[12px] flex-1 overflow-hidden bg-[#26334B]">
                <span
                  className="block h-full bg-[#3DF5A0] transition-all duration-500"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Header({ title, subtitle }) {
  return (
    <>
      <h1 className="text-[24px] font-black leading-none tracking-[0.01em] text-[#EEF4FC] sm:text-[29px]">
        {title}
      </h1>
      <p className="mt-[14px] border-b border-[#2A3852] pb-[13px] text-[13px] font-medium leading-[19px] tracking-[0.02em] text-[#8B96AA] sm:mt-[19px] sm:text-[14px]">
        {subtitle}
      </p>
    </>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="fp-step mt-[14px] rounded-[9px] border border-[#FF5C7A]/40 bg-[#FF5C7A]/10 px-[14px] py-[11px] text-[12px] font-semibold leading-[17px] text-[#FF8FA3]"
    >
      {message}
    </div>
  );
}

function PasswordField({ label, value, onChange, autoFocus, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={c.password.placeholder}
          className={`${inputClass} pr-[64px] tracking-[0.08em]`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#8C97AB] transition hover:text-[#00D4E9]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function Rule({ ok, text }) {
  return (
    <li
      className={`flex items-center gap-[8px] text-[12px] font-medium transition-colors duration-200 ${
        ok ? "text-[#3DF5A0]" : "text-[#637088]"
      }`}
    >
      <span
        className={`flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border text-[9px] transition-all duration-200 ${
          ok ? "border-[#3DF5A0] bg-[#3DF5A0]/15" : "border-[#2A3650]"
        }`}
      >
        {ok ? "✓" : ""}
      </span>
      {text}
    </li>
  );
}

export function ForgotPasswordCard({ flow, onBackToLogin }) {
  const { step } = flow;

  return (
    <div className={cardClass}>
      <StepIndicator step={step} />

      {/* key = step → each step slides in */}
      <div key={step} className="fp-step">
        {step === "email" && (
          <form onSubmit={flow.submitEmail} noValidate className="m-stagger" style={{ "--m-base": "80ms" }}>
            <Header title={c.email.title} subtitle={c.email.subtitle} />
            <div className="mt-[20px]">
              <label className={labelClass}>{c.email.label}</label>
              <input
                type="email"
                value={flow.email}
                autoFocus
                autoComplete="email"
                onChange={(e) => flow.setEmail(e.target.value)}
                placeholder={c.email.placeholder}
                className={`${inputClass} border-[#00D4E9] bg-[#121B2B] shadow-[0_0_0_1px_rgba(0,212,233,0.18)]`}
              />
            </div>
            <ErrorBox message={flow.error} />
            <button type="submit" disabled={flow.isBusy} className={primaryButton}>
              {flow.isBusy && <Spinner />}
              {flow.isBusy ? c.email.sending : c.email.button}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={flow.submitOtp} noValidate className="m-stagger" style={{ "--m-base": "80ms" }}>
            <Header
              title={c.otp.title}
              subtitle={
                <>
                  {c.otp.subtitlePrefix}{" "}
                  <span className="font-bold text-[#DCE6F3]">{maskEmail(flow.email)}</span>
                </>
              }
            />
            <div className="mt-[20px]">
              <label className={labelClass}>{c.otp.label}</label>
              <OtpInput
                value={flow.otp}
                onChange={flow.updateOtp}
                disabled={flow.isBusy}
                shakeKey={flow.shakeKey}
                hasError={Boolean(flow.error)}
                autoFocus
              />
            </div>

            <div className="mt-[14px] flex flex-wrap items-center justify-between gap-[10px]">
              <button type="button" onClick={flow.resendCode} disabled={flow.cooldown > 0 || flow.isBusy} className={linkButton}>
                {flow.cooldown > 0
                  ? `${c.otp.resendIn} ${Math.floor(flow.cooldown / 60)}:${String(flow.cooldown % 60).padStart(2, "0")}`
                  : c.otp.resend}
              </button>
              <button type="button" onClick={flow.changeEmail} disabled={flow.isBusy} className={linkButton}>
                {c.otp.changeEmail}
              </button>
            </div>

            <ErrorBox message={flow.error} />

            <button type="submit" disabled={flow.isBusy || flow.otp.length !== 6} className={primaryButton}>
              {flow.isBusy && <Spinner />}
              {flow.isBusy ? c.otp.verifying : c.otp.button}
            </button>
            <p className="mt-[12px] text-[11px] font-medium leading-[16px] text-[#637088]">{c.otp.hint}</p>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={flow.submitPassword} noValidate className="m-stagger" style={{ "--m-base": "80ms" }}>
            <Header title={c.password.title} subtitle={c.password.subtitle} />
            <div className="mt-[20px] space-y-[17px]">
              <PasswordField
                label={c.password.newLabel}
                value={flow.newPassword}
                onChange={flow.setNewPassword}
                autoFocus
                autoComplete="new-password"
              />
              <PasswordField
                label={c.password.confirmLabel}
                value={flow.confirmPassword}
                onChange={flow.setConfirmPassword}
                autoComplete="new-password"
              />
            </div>

            <ul className="mt-[14px] grid gap-[8px] sm:grid-cols-2">
              {flow.passwordChecks.map((r) => (
                <Rule key={r.id} ok={r.ok} text={r.text} />
              ))}
              <Rule ok={flow.passwordsMatch} text={c.password.matchRule} />
            </ul>

            <ErrorBox message={flow.error} />

            <button type="submit" disabled={flow.isBusy || !flow.passwordValid} className={primaryButton}>
              {flow.isBusy && <Spinner />}
              {flow.isBusy ? c.password.saving : c.password.button}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="fp-pop mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-[#3DF5A0] bg-[#3DF5A0]/[0.12]">
              <svg viewBox="0 0 24 24" className="h-[30px] w-[30px]" aria-hidden="true">
                <path
                  className="fp-check"
                  d="M5 12.5l4.5 4.5L19 7.5"
                  fill="none"
                  stroke="#3DF5A0"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="mt-[18px] text-[24px] font-black leading-none text-[#EEF4FC] sm:text-[29px]">
              {c.done.title}
            </h1>
            <p className="mx-auto mt-[14px] max-w-[420px] text-[13px] font-medium leading-[20px] text-[#8B96AA] sm:text-[14px]">
              {c.done.subtitle}
            </p>
            <button type="button" onClick={onBackToLogin} className={primaryButton}>
              {c.done.button}
            </button>
          </div>
        )}
      </div>

      {step !== "done" && (
        <>
          <div className="mt-[16px] text-center">
            <button type="button" onClick={onBackToLogin} className={linkButton}>
              ← {c.backToLogin}
            </button>
          </div>
          <div className="mt-[15px]">
            <div className="flex min-h-[37px] items-center justify-center rounded-[7px] border border-[#1B263C] bg-[#070C15] px-[12px] py-[9px]">
              <p className="text-center text-[10px] font-medium leading-[14px] tracking-[0.02em] text-[#58657A]">
                {c.securityText}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ForgotPasswordCard;
