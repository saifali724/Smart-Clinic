// src/features/auth/containers/SignupScreenContainer.jsx
//
// Responsive layout:
//   • Phone / tablet (< 1024px): brand + "Sign In" on top, the form, then the
//     registration steps & security info underneath.
//   • Laptop / desktop (≥ 1024px): form on the left, info panel on the right
//     (36%, max 520px like Figma) that stays in place while the form scrolls.

import { useNavigate } from "react-router-dom";
import { SignupCard } from "../components/SignupCard";
import { signupContent } from "../data/signupContent";

function Brand({ size = "text-[32px]" }) {
  return (
    <p className={`${size} font-black leading-none`}>
      <span className="text-[#10D5EA]">{signupContent.rightPanel.brandCyan}</span>
      <span className="text-[#3DF5A0]">{signupContent.rightPanel.brandGreen}</span>
    </p>
  );
}

function RegistrationSteps() {
  return (
    <div>
      <p className="mb-[20px] text-[12px] font-extrabold tracking-[0.14em] text-[#64748B]">
        {signupContent.rightPanel.title}
      </p>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-[36px] h-[calc(100%-36px)] w-px bg-[#26344F]" />

        <div className="space-y-[clamp(18px,3vh,31px)]">
          {signupContent.rightPanel.steps.map((step, index) => (
            <div
              key={step.number}
              className="anim-fade-up relative flex items-start gap-[18px]"
              style={{ animationDelay: `${300 + index * 80}ms` }}
            >
              <div
                className={`relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[14px] font-bold transition-all duration-300 ${
                  step.active ? "step-active-pulse" : ""
                }`}
                style={
                  step.active
                    ? { border: "1.5px solid #08CFE8", background: "rgba(8,207,232,0.12)", color: "#08D4E9" }
                    : { border: "1.5px solid #2A3650", background: "#151F30", color: "#4A5568" }
                }
              >
                {step.number}
              </div>

              <div className="pt-[5px]">
                <h3
                  className="text-[15px] font-bold leading-none xl:text-[16px]"
                  style={{ color: step.active ? "#EEF4FC" : "#8A9AB5" }}
                >
                  {step.title}
                </h3>
                <p className="mt-[7px] text-[13px] font-medium text-[#4A5568]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataProtected() {
  return (
    <div>
      <p className="mb-[12px] text-[12px] font-extrabold tracking-[0.12em] text-[#1EE48A]">
        {signupContent.rightPanel.protectedTitle}
      </p>

      <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-1">
        {signupContent.rightPanel.protectedItems.map((item) => (
          <div
            key={item}
            className="flex h-[44px] items-center rounded-[9px] border border-[#1E2D42] bg-[#141E2E] px-[18px] text-[14px] font-medium text-[#9EB3CB] transition-all duration-300 hover:border-[#08CFE8]/30 hover:bg-[#1A2840]"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-[14px] rounded-[9px] border border-[#1E2D42] bg-[#0D1520] px-[18px] py-[14px]">
        <p className="text-[13px] font-medium leading-[19px] text-[#8794A9]">
          "{signupContent.rightPanel.quote}"
        </p>
        <p className="mt-[8px] text-[13px] font-semibold text-[#08D4E9]">
          — {signupContent.rightPanel.doctor}
        </p>
      </div>
    </div>
  );
}

export function SignupScreenContainer() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-[#070B15] font-sans text-white lg:flex-row">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes stepPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(8,207,232,0); }
          50%       { box-shadow: 0 0 0 8px rgba(8,207,232,0.13); }
        }
        .anim-fade-up    { animation: fadeSlideUp 0.6s ease both; }
        .anim-fade-right { animation: fadeSlideRight 0.6s ease both; }
        .anim-fade-in    { animation: fadeIn 0.5s ease both; }
        .step-active-pulse { animation: stepPulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* ───────────── LEFT: form ───────────── */}
      <section className="relative min-w-0 flex-1">
        {/* grid background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(35,48,76,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(35,48,76,0.34)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative z-10 mx-auto w-full max-w-[980px] px-[16px] pb-[32px] pt-[20px] sm:px-[32px] sm:pt-[28px] xl:px-[48px] xl:pt-[32px]">
          {/* Top bar */}
          <div className="anim-fade-in flex flex-wrap items-center justify-between gap-[12px] lg:justify-start lg:gap-[20px]">
            <div className="lg:hidden">
              <Brand size="text-[22px]" />
            </div>

            <div className="flex items-center gap-[12px] lg:gap-[20px]">
              <span className="hidden text-[12px] font-medium text-[#8794A9] sm:inline">
                {signupContent.topBar.text}
              </span>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="h-[32px] rounded-[8px] border border-[#08CFE8] bg-transparent px-[16px] text-[12px] font-bold text-[#08D4E9] transition-all duration-300 hover:bg-[#08CFE8]/10 hover:shadow-[0_0_12px_rgba(8,207,232,0.3)]"
              >
                {signupContent.topBar.button}
              </button>
            </div>
          </div>

          <div className="anim-fade-up mt-[18px] sm:mt-[22px]" style={{ animationDelay: "150ms" }}>
            <SignupCard />
          </div>
        </div>
      </section>

      {/* ───────────── RIGHT: steps + security ───────────── */}
      <aside className="anim-fade-right relative w-full overflow-hidden bg-[#0E1420] lg:w-[36%] lg:max-w-[520px] lg:shrink-0">
        <div className="pointer-events-none absolute right-[-90px] top-[-70px] h-[275px] w-[275px] rounded-full bg-[rgba(88,60,140,0.24)]" />
        <div className="pointer-events-none absolute bottom-[-95px] left-[-95px] h-[305px] w-[305px] rounded-full bg-[rgba(13,80,104,0.24)]" />

        <div className="relative z-10 flex flex-col gap-[32px] px-[16px] py-[32px] sm:px-[32px] lg:sticky lg:top-0 lg:h-screen lg:gap-0 lg:overflow-y-auto lg:px-[clamp(28px,3vw,44px)] lg:pb-[30px] lg:pt-[clamp(28px,5vh,50px)]">
          <div className="hidden lg:mb-[clamp(20px,4vh,34px)] lg:block">
            <Brand />
          </div>

          <RegistrationSteps />

          {/* spacer pushes the security section to the bottom on desktop */}
          <div className="hidden min-h-[24px] flex-1 lg:block" />

          <DataProtected />
        </div>
      </aside>
    </main>
  );
}

export default SignupScreenContainer;
