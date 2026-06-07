// src/features/auth/components/SignupCard.jsx

import { useNavigate } from "react-router-dom";
import { signupContent } from "../data/signupContent";
import { useSignupCredentials } from "../hooks/useSignupCredentials";

export function SignupCard() {
  const navigate = useNavigate();

  const { credentials, isSubmitting, updateCredential, submitSignup } =
    useSignupCredentials();

  return (
    <section className="w-[980px] rounded-[30px] border border-[#26344F] bg-[#151B2B] px-[48px] py-[38px] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      {/* Header */}
      <h1 className="text-[34px] font-extrabold leading-none tracking-[0.01em] text-[#F5FBFF]">
        {signupContent.form.title}
      </h1>

      <p className="mt-[12px] text-[15px] font-medium text-[#77869B]">
        {signupContent.form.subtitle}
      </p>

      <div className="mt-[16px] flex h-[28px] w-[210px] items-center justify-center rounded-full border border-[#08CFE8] text-[11px] font-semibold text-[#08D4E9]">
        {signupContent.form.stepBadge}
      </div>

      <div className="mt-[18px] h-px w-full bg-[#24314A]" />

      {/* Form */}
      <form onSubmit={submitSignup} className="mt-[20px]">
        <div className="grid grid-cols-2 gap-x-[20px] gap-y-[16px]">

          {/* First Name */}
          <div>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.firstName.label}
            </label>
            <input
              value={credentials.firstName}
              onChange={(e) => updateCredential("firstName", e.target.value)}
              placeholder={signupContent.form.fields.firstName.placeholder}
              className="h-[48px] w-full rounded-[9px] border border-[#08CFE8] bg-[#172033] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B]"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.lastName.label}
            </label>
            <input
              value={credentials.lastName}
              onChange={(e) => updateCredential("lastName", e.target.value)}
              placeholder={signupContent.form.fields.lastName.placeholder}
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] focus:border-[#08CFE8]"
            />
          </div>

          {/* Professional Email */}
          <div>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.email.label}
            </label>
            <input
              value={credentials.email}
              onChange={(e) => updateCredential("email", e.target.value)}
              placeholder={signupContent.form.fields.email.placeholder}
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] focus:border-[#08CFE8]"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.phone.label}
            </label>
            <input
              value={credentials.phone}
              onChange={(e) => updateCredential("phone", e.target.value)}
              placeholder={signupContent.form.fields.phone.placeholder}
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] focus:border-[#08CFE8]"
            />
          </div>

          {/* Medical Specialization */}
          <div>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.specialization.label}
            </label>
            <select
              value={credentials.specialization}
              onChange={(e) => updateCredential("specialization", e.target.value)}
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#64748B] outline-none focus:border-[#08CFE8]"
            >
              <option value="">Cardiology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>

          {/* PMC License */}
          <div>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.license.label}
            </label>
            <div className="relative">
              <input
                value={credentials.license}
                onChange={(e) => updateCredential("license", e.target.value)}
                placeholder={signupContent.form.fields.license.placeholder}
                className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] pr-[40px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] focus:border-[#08CFE8]"
              />
              <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[15px] text-[#1EE48A]">
                ✓
              </span>
            </div>
          </div>

          {/* Hospital */}
          <div>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.hospital.label}
            </label>
            <input
              value={credentials.hospital}
              onChange={(e) => updateCredential("hospital", e.target.value)}
              placeholder={signupContent.form.fields.hospital.placeholder}
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#DDEBFF] outline-none placeholder:text-[#64748B] focus:border-[#08CFE8]"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
              {signupContent.form.fields.designation.label}
            </label>
            <select
              value={credentials.designation}
              onChange={(e) => updateCredential("designation", e.target.value)}
              className="h-[48px] w-full rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px] text-[14px] font-medium text-[#64748B] outline-none focus:border-[#08CFE8]"
            >
              <option value="">Senior Consultant</option>
              <option value="Consultant">Consultant</option>
              <option value="Senior Consultant">Senior Consultant</option>
              <option value="Medical Officer">Medical Officer</option>
            </select>
          </div>
        </div>

        {/* Profile Photo */}
        <div className="mt-[18px]">
          <label className="mb-[8px] block text-[10px] font-extrabold tracking-[0.08em] text-[#77869B]">
            {signupContent.form.uploadTitle}
          </label>
          <div className="flex h-[58px] items-center rounded-[9px] border border-[#252F45] bg-[#1A2133] px-[18px]">
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

        {/* Agreement */}
        <label className="mt-[16px] flex items-center gap-[10px] text-[12px] font-medium text-[#8794A9]">
          <input
            type="checkbox"
            checked={credentials.agreeTerms}
            onChange={(e) => updateCredential("agreeTerms", e.target.checked)}
            className="h-[14px] w-[14px] accent-[#08D4E9]"
          />
          <span>{signupContent.form.agreement}</span>
        </label>

        {/* Buttons */}
        <div className="mt-[18px] flex items-center gap-[28px]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[50px] flex-1 rounded-[9px] bg-[#08D4E9] text-[14px] font-extrabold text-[#06101D] shadow-[0_18px_35px_rgba(8,212,233,0.24)] transition hover:bg-[#19E6F4] disabled:opacity-70"
          >
            {isSubmitting ? "Please wait..." : `${signupContent.form.button} →`}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-[12px] font-semibold text-[#64748B] transition hover:text-[#08D4E9]"
          >
            ← {signupContent.form.back}
          </button>
        </div>

        {/* Footer */}
        <p className="mt-[22px] text-center text-[11px] font-medium text-[#64748B]">
          {signupContent.form.copyright}
        </p>
      </form>
    </section>
  );
}

export default SignupCard;