// src/features/auth/components/SignupCard.jsx

import { useNavigate } from "react-router-dom";
import { signupContent } from "../data/signupContent";
import { useSignupCredentials } from "../hooks/useSignupCredentials";

export function SignupCard() {
  const navigate = useNavigate();

  const {
    credentials,
    isSubmitting,
    signupError,
    signupSuccess,
    updateCredential,
    submitSignup,
  } = useSignupCredentials();

  return (
    <section
      className="w-full rounded-[20px] border border-[#26344F] bg-[#151B2B] px-[18px] py-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:rounded-[24px] sm:px-[32px] sm:py-[32px] xl:rounded-[30px] xl:px-[48px] xl:py-[38px]"
      style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "150ms" }}
    >
      {/* Header */}
      <h1
        className="text-[26px] font-extrabold leading-[1.1] sm:text-[30px] xl:text-[34px] tracking-[0.01em] text-[#F5FBFF]"
        style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "200ms" }}
      >
        {signupContent.form.title}
      </h1>

      <p
        className="mt-[10px] text-[13px] font-medium leading-[19px] text-[#77869B] sm:mt-[12px] sm:text-[15px] sm:leading-normal"
        style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "250ms" }}
      >
        {signupContent.form.subtitle}
      </p>

      <div
        className="mt-[16px] inline-flex h-[28px] items-center justify-center rounded-full px-[14px] border border-[#08CFE8] text-[11px] font-semibold text-[#08D4E9]"
        style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "300ms" }}
      >
        {signupContent.form.stepBadge}
      </div>

      <div className="mt-[18px] h-px w-full bg-[#24314A]" />

      <form onSubmit={submitSignup} className="mt-[20px]">
        <div className="grid grid-cols-1 gap-x-[20px] gap-y-[14px] sm:grid-cols-2 sm:gap-y-[16px]">
          {[
            { field: "firstName", type: "text" },
            { field: "lastName", type: "text" },
            { field: "email", type: "email" },
            { field: "phone", type: "tel" },
          ].map(({ field, type }, index) => (
            <div
              key={field}
              style={{
                animation: "fadeSlideUp 0.5s ease both",
                animationDelay: `${350 + index * 60}ms`,
              }}
            >
              <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
                {signupContent.form.fields[field].label}
              </label>
              <input
                type={type}
                value={credentials[field]}
                onChange={(e) => updateCredential(field, e.target.value)}
                placeholder={signupContent.form.fields[field].placeholder}
                className={`h-[48px] w-full rounded-[9px] border bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] transition-all duration-300 focus:shadow-[0_0_12px_rgba(8,207,232,0.2)] ${
                  field === "firstName"
                    ? "border-[#08CFE8] bg-[#172033]"
                    : "border-[#252F45] focus:border-[#08CFE8]"
                }`}
              />
            </div>
          ))}

          {/* Specialization */}
          <div style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "590ms" }}>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.specialization.label}
            </label>
            <select
              value={credentials.specialization}
              onChange={(e) => updateCredential("specialization", e.target.value)}
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none transition-all duration-300 focus:border-[#08CFE8] focus:shadow-[0_0_12px_rgba(8,207,232,0.2)]"
            >
              <option value="">Select specialization</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>

          {/* License */}
          <div style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "650ms" }}>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.license.label}
            </label>
            <div className="relative">
              <input
                value={credentials.license}
                onChange={(e) => updateCredential("license", e.target.value)}
                placeholder={signupContent.form.fields.license.placeholder}
                className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] pr-[40px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] transition-all duration-300 focus:border-[#08CFE8] focus:shadow-[0_0_12px_rgba(8,207,232,0.2)]"
              />
              <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[15px] text-[#1EE48A]">
                ✓
              </span>
            </div>
          </div>

          {/* Hospital */}
          <div style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "710ms" }}>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.hospital.label}
            </label>
            <input
              value={credentials.hospital}
              onChange={(e) => updateCredential("hospital", e.target.value)}
              placeholder={signupContent.form.fields.hospital.placeholder}
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] transition-all duration-300 focus:border-[#08CFE8] focus:shadow-[0_0_12px_rgba(8,207,232,0.2)]"
            />
          </div>

          {/* Designation */}
          <div style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "770ms" }}>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.designation.label}
            </label>
            <select
              value={credentials.designation}
              onChange={(e) => updateCredential("designation", e.target.value)}
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none transition-all duration-300 focus:border-[#08CFE8] focus:shadow-[0_0_12px_rgba(8,207,232,0.2)]"
            >
              <option value="">Select designation</option>
              <option value="Consultant">Consultant</option>
              <option value="Senior Consultant">Senior Consultant</option>
              <option value="Medical Officer">Medical Officer</option>
            </select>
          </div>

          {/* Password */}
          <div style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "830ms" }}>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              PASSWORD
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => updateCredential("password", e.target.value)}
              placeholder="Create secure password"
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] transition-all duration-300 focus:border-[#08CFE8] focus:shadow-[0_0_12px_rgba(8,207,232,0.2)]"
            />
          </div>

          {/* Confirm Password */}
          <div style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "890ms" }}>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              value={credentials.confirmPassword}
              onChange={(e) => updateCredential("confirmPassword", e.target.value)}
              placeholder="Confirm secure password"
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] transition-all duration-300 focus:border-[#08CFE8] focus:shadow-[0_0_12px_rgba(8,207,232,0.2)]"
            />
          </div>
        </div>

        {/* Profile Photo */}
        <div
          className="mt-[18px]"
          style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "950ms" }}
        >
          <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
            {signupContent.form.uploadTitle}
          </label>
          <div className="flex min-h-[58px] items-center rounded-[9px] py-[10px] border border-[#252F45] bg-[#1A2133] px-[18px] transition-all duration-300 hover:border-[#08CFE8]/40 hover:bg-[#1D2540]">
            <span className="mr-[14px] text-[20px] text-[#8EA6BE]">⌕</span>
            <div>
              <p className="text-[13px] font-medium text-[#8EA6BE]">
                Drop your photo here, or{" "}
                <span className="font-bold text-[#08D4E9]">browse</span>
              </p>
              <p className="mt-[3px] text-[11px] font-medium text-[#64748B]">
                {signupContent.form.uploadNote}
              </p>
            </div>
          </div>
        </div>

        {/* Error / Success Message */}
        {(signupError || signupSuccess) && (
          <div
            className={`mt-[14px] rounded-[9px] border px-[14px] py-[11px] text-[12px] font-semibold ${
              signupError
                ? "border-[#FF5C7A]/40 bg-[#FF5C7A]/10 text-[#FF8FA3]"
                : "border-[#1EE48A]/40 bg-[#1EE48A]/10 text-[#6DFFB4]"
            }`}
          >
            {signupError || signupSuccess}
          </div>
        )}

        {/* Agreement */}
        <label
          className="mt-[16px] flex items-start gap-[10px] text-[12px] font-medium leading-[17px] text-[#8794A9]"
          style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "1000ms" }}
        >
          <input
            type="checkbox"
            checked={credentials.agreeTerms}
            onChange={(e) => updateCredential("agreeTerms", e.target.checked)}
            className="mt-[1px] h-[14px] w-[14px] shrink-0 accent-[#08D4E9]"
          />
          <span>{signupContent.form.agreement}</span>
        </label>

        {/* Buttons */}
        <div
          className="mt-[18px] flex flex-col items-stretch gap-[14px] sm:flex-row sm:items-center sm:gap-[28px]"
          style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "1050ms" }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[50px] flex-1 rounded-[9px] bg-[#08D4E9] px-[14px] py-[10px] text-[14px] font-extrabold text-[#06101D] shadow-[0_18px_35px_rgba(8,212,233,0.24)] transition-all duration-300 hover:bg-[#19E6F4] hover:shadow-[0_18px_40px_rgba(8,212,233,0.4)] hover:scale-[1.01] disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : `${signupContent.form.button} →`}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-[12px] font-semibold text-[#64748B] transition-all duration-300 hover:text-[#08D4E9]"
          >
            ← {signupContent.form.back}
          </button>
        </div>

        <p
          className="mt-[22px] text-center text-[11px] font-medium text-[#64748B]"
          style={{ animation: "fadeSlideUp 0.5s ease both", animationDelay: "1100ms" }}
        >
          {signupContent.form.copyright}
        </p>
      </form>
    </section>
  );
}

export default SignupCard;