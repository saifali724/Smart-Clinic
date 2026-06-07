// src/features/auth/containers/SignupScreenContainer.jsx

import { useNavigate } from "react-router-dom";
import { SignupCard } from "../components/SignupCard";
import { signupContent } from "../data/signupContent";

export function SignupScreenContainer() {
  const navigate = useNavigate();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#070B15] font-sans text-white">
      {/* Full screen grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(35,48,76,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(35,48,76,0.34)_1px,transparent_1px)] bg-[size:56px_56px]" />

      {/* Top bar */}
      <div className="absolute left-[40px] top-[28px] flex items-center gap-[20px]">
        <span className="text-[12px] font-medium text-[#8794A9]">
          {signupContent.topBar.text}
        </span>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="h-[28px] w-[80px] rounded-[6px] border border-[#08CFE8] bg-transparent text-[11px] font-bold text-[#08D4E9]"
        >
          {signupContent.topBar.button}
        </button>
      </div>

      {/* Signup card — centered vertically with breathing room top/bottom */}
      <div className="absolute left-[40px] top-[76px] bottom-[0px] flex items-center">
        <SignupCard />
      </div>

      {/* RIGHT SIDE — Registration Steps */}
      <aside className="absolute right-0 top-0 h-full w-[36%] overflow-hidden bg-[#151B2B]/96">
        <div className="pointer-events-none absolute right-[-88px] top-[-34px] h-[235px] w-[235px] rounded-full bg-[#252849]/85" />
        <div className="pointer-events-none absolute bottom-[-135px] left-[55px] h-[300px] w-[300px] rounded-full bg-[#0D3748]/35" />

        <div className="relative z-10 px-[32px] pt-[48px]">
          <h2 className="text-[22px] font-extrabold tracking-[0.02em] text-[#19D3C5]">
            {signupContent.rightPanel.brand}
          </h2>

          <div className="mt-[40px]">
            <p className="text-[9px] font-extrabold tracking-[0.1em] text-[#64748B]">
              {signupContent.rightPanel.title}
            </p>

            <div className="relative mt-[18px] space-y-[36px]">
              <div className="absolute left-[10px] top-[22px] h-[200px] w-px bg-[#26344F]" />

              {signupContent.rightPanel.steps.map((step) => (
                <div key={step.number} className="relative flex gap-[14px]">
                  <div
                    className={
                      step.active
                        ? "relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#08CFE8] bg-[#08CFE8]/20 text-[10px] font-bold text-[#08D4E9]"
                        : "relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#35435C] bg-[#1A2133] text-[10px] font-bold text-[#64748B]"
                    }
                  >
                    {step.number}
                  </div>
                  <div>
                    <h3 className={step.active ? "text-[13px] font-bold text-[#DDEBFF]" : "text-[13px] font-bold text-[#A7B4C9]"}>
                      {step.title}
                    </h3>
                    <p className="mt-[3px] text-[10px] font-medium text-[#64748B]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-[48px]">
            <p className="text-[9px] font-extrabold tracking-[0.08em] text-[#1EE48A]">
              {signupContent.rightPanel.protectedTitle}
            </p>
            <div className="mt-[12px] space-y-[8px]">
              {signupContent.rightPanel.protectedItems.map((item) => (
                <div
                  key={item}
                  className="flex h-[32px] items-center rounded-[6px] border border-[#252F45] bg-[#1A2133] px-[16px] text-[10px] font-medium text-[#8EA6BE]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-[16px] rounded-[8px] border border-[#26344F] bg-[#090F1B] px-[14px] py-[12px]">
            <p className="text-[10px] font-medium text-[#8794A9]">
              "{signupContent.rightPanel.quote}"
            </p>
            <p className="mt-[6px] text-[10px] font-semibold text-[#08D4E9]">
              — {signupContent.rightPanel.doctor}
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}

export default SignupScreenContainer;