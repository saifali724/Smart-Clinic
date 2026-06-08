// src/features/auth/containers/SignupScreenContainer.jsx

import { useNavigate } from "react-router-dom";
import { SignupCard } from "../components/SignupCard";
import { signupContent } from "../data/signupContent";

export function SignupScreenContainer() {
  const navigate = useNavigate();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#070B15] font-sans text-white">
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
          50%       { box-shadow: 0 0 0 6px rgba(8,207,232,0.12); }
        }
        @keyframes shimmerBar {
          0%   { background-position: 0% 0%; }
          100% { background-position: 0% 200%; }
        }
        .anim-fade-up    { animation: fadeSlideUp 0.6s ease both; }
        .anim-fade-right { animation: fadeSlideRight 0.6s ease both; }
        .anim-fade-in    { animation: fadeIn 0.5s ease both; }
        .step-active-pulse { animation: stepPulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(35,48,76,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(35,48,76,0.34)_1px,transparent_1px)] bg-[size:56px_56px]" />

      {/* Top bar */}
      <div
        className="absolute left-[40px] top-[20px] flex items-center gap-[20px] anim-fade-in"
        style={{ animationDelay: "0ms" }}
      >
        <span className="text-[12px] font-medium text-[#8794A9]">
          {signupContent.topBar.text}
        </span>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="h-[28px] w-[80px] rounded-[6px] border border-[#08CFE8] bg-transparent text-[11px] font-bold text-[#08D4E9] transition-all duration-300 hover:bg-[#08CFE8]/10 hover:shadow-[0_0_12px_rgba(8,207,232,0.3)]"
        >
          {signupContent.topBar.button}
        </button>
      </div>

      {/* Signup card */}
      <div
        className="absolute left-[40px] top-[62px] anim-fade-up"
        style={{ animationDelay: "150ms" }}
      >
        <SignupCard />
      </div>

      {/* RIGHT PANEL */}
      <aside
        className="absolute right-0 top-0 h-full overflow-hidden anim-fade-right"
        style={{ width: "36%", background: "#111827", animationDelay: "100ms" }}
      >
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(35,48,76,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(35,48,76,0.25)_1px,transparent_1px)] bg-[size:56px_56px]" />

        {/* Purple circle top-right */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            right: "-100px", top: "-80px",
            width: "280px", height: "280px",
            background: "rgba(88,60,140,0.18)",
          }}
        />

        {/* Teal circle bottom-left */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            left: "-80px", bottom: "-80px",
            width: "260px", height: "260px",
            background: "rgba(13,80,104,0.22)",
          }}
        />

        <div className="relative z-10 flex h-full flex-col px-[36px] pt-[48px] pb-[32px]">

          {/* Brand */}
          <div className="mb-[36px] anim-fade-up" style={{ animationDelay: "200ms" }}>
            <span className="text-[28px] font-black text-[#10D5EA]">
              {signupContent.rightPanel.brandCyan}
            </span>
            <span className="text-[28px] font-black text-[#3DF5A0]">
              {signupContent.rightPanel.brandGreen}
            </span>
          </div>

          {/* Steps */}
          <div className="mb-[auto]">
            <p
              className="mb-[24px] text-[10px] font-extrabold tracking-[0.12em] text-[#64748B] anim-fade-up"
              style={{ animationDelay: "250ms" }}
            >
              {signupContent.rightPanel.title}
            </p>

            <div className="relative">
              <div
                className="absolute bg-[#26344F]"
                style={{ left: "15px", top: "28px", width: "1px", height: "calc(100% - 56px)" }}
              />

              <div className="space-y-[32px]">
                {signupContent.rightPanel.steps.map((step, index) => (
                  <div
                    key={step.number}
                    className="relative flex items-start gap-[16px] anim-fade-up"
                    style={{ animationDelay: `${300 + index * 80}ms` }}
                  >
                    <div
                      className={`relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-300 ${step.active ? "step-active-pulse" : ""}`}
                      style={
                        step.active
                          ? { border: "1.5px solid #08CFE8", background: "rgba(8,207,232,0.12)", color: "#08D4E9" }
                          : { border: "1.5px solid #2A3650", background: "#151F30", color: "#4A5568" }
                      }
                    >
                      {step.number}
                    </div>
                    <div className="pt-[4px]">
                      <h3
                        className="text-[14px] font-bold leading-none"
                        style={{ color: step.active ? "#EEF4FC" : "#8A9AB5" }}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-[6px] text-[11px] font-medium text-[#4A5568]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Protected */}
          <div className="mt-[40px] anim-fade-up" style={{ animationDelay: "600ms" }}>
            <p className="mb-[12px] text-[10px] font-extrabold tracking-[0.1em] text-[#1EE48A]">
              {signupContent.rightPanel.protectedTitle}
            </p>
            <div className="space-y-[8px]">
              {signupContent.rightPanel.protectedItems.map((item, index) => (
                <div
                  key={item}
                  className="flex h-[38px] items-center rounded-[8px] border border-[#1E2D42] bg-[#141E2E] px-[16px] text-[12px] font-medium text-[#8EA6BE] transition-all duration-300 hover:border-[#08CFE8]/30 hover:bg-[#1A2840]"
                  style={{
                    animation: "fadeSlideUp 0.5s ease both",
                    animationDelay: `${650 + index * 60}ms`,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div
            className="mt-[16px] rounded-[8px] border border-[#1E2D42] bg-[#0D1520] px-[16px] py-[14px] anim-fade-up"
            style={{ animationDelay: "900ms" }}
          >
            <p className="text-[11px] font-medium leading-[16px] text-[#8794A9]">
              "{signupContent.rightPanel.quote}"
            </p>
            <p className="mt-[8px] text-[11px] font-semibold text-[#08D4E9]">
              — {signupContent.rightPanel.doctor}
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}

export default SignupScreenContainer;