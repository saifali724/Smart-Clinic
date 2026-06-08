// src/features/auth/containers/LoginScreenContainer.jsx

import { useNavigate } from "react-router-dom";
import { loginContent } from "../data/loginContent";
import { useLoginCredentials } from "../hooks/useLoginCredentials";
import { LoginBrand } from "../components/LoginBrand";
import { MedicalIllustrationCard } from "../components/MedicalIllustrationCard";
import { LoginFeatureList } from "../components/LoginFeatureList";
import { DoctorLoginCard } from "../components/DoctorLoginCard";
import { AuthFooterLinks } from "../components/AuthFooterLinks";

const LEFT_PANEL_WIDTH = "35vw";

export function LoginScreenContainer() {
  const navigate = useNavigate();

  const {
    credentials,
    isSubmitting,
    loginError,
    updateCredential,
    submitLogin,
  } = useLoginCredentials({
    onLoginSuccess: () => navigate("/home"),
  });

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#070B15] font-sans text-white">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulseCyan {
          0%, 100% { box-shadow: 0 0 0 0 rgba(8,212,233,0); }
          50%       { box-shadow: 0 0 18px 4px rgba(8,212,233,0.18); }
        }
        @keyframes glowLine {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; filter: drop-shadow(0 0 4px #1EF1A0); }
        }
        @keyframes shimmerBar {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .anim-fade-up    { animation: fadeSlideUp 0.6s ease both; }
        .anim-fade-left  { animation: fadeSlideLeft 0.6s ease both; }
        .anim-fade-in    { animation: fadeIn 0.6s ease both; }
        .anim-float      { animation: floatCard 4s ease-in-out infinite; }
        .anim-pulse-cyan { animation: pulseCyan 2.5s ease-in-out infinite; }
        .anim-glow-line  { animation: glowLine 2s ease-in-out infinite; }
      `}</style>

      {/* Left panel background */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full anim-fade-in"
        style={{
          width: LEFT_PANEL_WIDTH,
          background: "#0B1322",
          animationDelay: "0ms",
        }}
      />

      {/* Grid right panel */}
      <div
        className="pointer-events-none absolute top-0 h-full bg-[linear-gradient(rgba(35,48,76,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(35,48,76,0.34)_1px,transparent_1px)] bg-[size:70px_70px] anim-fade-in"
        style={{
          left: LEFT_PANEL_WIDTH,
          width: `calc(100vw - ${LEFT_PANEL_WIDTH})`,
          animationDelay: "100ms",
        }}
      />

      {/* Teal circle */}
      <div
        className="pointer-events-none absolute anim-fade-in"
        style={{
          left: "-110px",
          top: "-92px",
          width: "375px",
          height: "375px",
          borderRadius: "50%",
          background: "rgba(13,55,72,0.45)",
          animationDelay: "200ms",
        }}
      />

      {/* Purple circle */}
      <div
        className="pointer-events-none absolute rounded-full anim-fade-in"
        style={{
          left: "30px",
          bottom: "-160px",
          width: "380px",
          height: "380px",
          background: "rgba(22,20,55,0.88)",
          animationDelay: "300ms",
        }}
      />

      {/* Divider */}
      <div
        className="absolute top-0 h-full w-px bg-[#1A2740] anim-fade-in"
        style={{ left: LEFT_PANEL_WIDTH, animationDelay: "200ms" }}
      />

      {/* Logo */}
      <div
        className="absolute left-[50px] top-[50px] anim-fade-up"
        style={{ animationDelay: "100ms" }}
      >
        <LoginBrand brand={loginContent.brand} />
      </div>

      {/* Medical card */}
      <div
        className="absolute left-[90px] top-[176px] anim-fade-up anim-float"
        style={{ animationDelay: "200ms" }}
      >
        <MedicalIllustrationCard />
      </div>

      {/* Feature cards */}
      <div
        className="absolute left-[50px] top-[590px] anim-fade-up"
        style={{ animationDelay: "350ms" }}
      >
        <LoginFeatureList features={loginContent.leftPanel.features} />
      </div>

      {/* Welcome text */}
      <p
        className="absolute top-[52px] text-[12px] font-medium leading-none text-[#8794A9] anim-fade-in"
        style={{ left: "calc(35vw + 80px)", animationDelay: "300ms" }}
      >
        {loginContent.topBar.welcome}
      </p>

      {/* Sign up button */}
      <div
        className="absolute right-[28px] top-[42px] flex items-center gap-[12px] anim-fade-in"
        style={{ animationDelay: "350ms" }}
      >
        <span className="text-[12px] font-medium leading-none text-[#9AA5B7]">
          {loginContent.topBar.signupText}
        </span>

        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="h-[30px] w-[96px] rounded-[6px] border border-[#08CFE8] bg-transparent text-[11px] font-bold leading-none text-[#08D4E9] transition-all duration-300 hover:bg-[#08CFE8]/10 hover:shadow-[0_0_12px_rgba(8,207,232,0.3)]"
        >
          {loginContent.topBar.signupButton}
        </button>
      </div>

      {/* Login form */}
      <div
        className="absolute top-[100px] anim-fade-left"
        style={{ left: "calc(35vw + 75px)", animationDelay: "250ms" }}
      >
        <DoctorLoginCard
          content={loginContent.form}
          credentials={credentials}
          isSubmitting={isSubmitting}
          loginError={loginError}
          onCredentialChange={updateCredential}
          onSubmit={submitLogin}
        />
      </div>

      {/* Footer */}
      <div
        className="absolute top-[880px] anim-fade-in"
        style={{ left: "calc(35vw + 385px)", animationDelay: "500ms" }}
      >
        <AuthFooterLinks footer={loginContent.footer} />
      </div>
    </main>
  );
}

export default LoginScreenContainer;