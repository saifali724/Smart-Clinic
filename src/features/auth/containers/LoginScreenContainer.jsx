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

  const { credentials, isSubmitting, updateCredential, submitLogin } =
    useLoginCredentials({ onLoginSuccess: () => navigate("/home") });

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#070B15] font-sans text-white">
      {/* Left panel background */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full"
        style={{
          width: LEFT_PANEL_WIDTH,
          background: "#0B1322",
        }}
      />

      {/* Grid only on right panel */}
      <div
        className="pointer-events-none absolute top-0 h-full bg-[linear-gradient(rgba(35,48,76,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(35,48,76,0.34)_1px,transparent_1px)] bg-[size:70px_70px]"
        style={{
          left: LEFT_PANEL_WIDTH,
          width: `calc(100vw - ${LEFT_PANEL_WIDTH})`,
        }}
      />

      {/* Teal circle */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "-110px",
          top: "-92px",
          width: "375px",
          height: "375px",
          borderRadius: "50%",
          background: "rgba(13,55,72,0.45)",
        }}
      />

      {/* Purple circle — bottom-left, clipped */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          left: "30px",
          bottom: "-160px",
          width: "380px",
          height: "380px",
          background: "rgba(22,20,55,0.88)",
        }}
      />

      {/* Divider exactly at 35% */}
      <div
        className="absolute top-0 h-full w-px bg-[#1A2740]"
        style={{ left: LEFT_PANEL_WIDTH }}
      />

      {/* Logo */}
      <div className="absolute left-[50px] top-[50px]">
        <LoginBrand brand={loginContent.brand} />
      </div>

      {/* Medical card */}
      <div className="absolute left-[90px] top-[176px]">
        <MedicalIllustrationCard />
      </div>

      {/* Feature cards */}
      <div className="absolute left-[50px] top-[590px]">
        <LoginFeatureList features={loginContent.leftPanel.features} />
      </div>

      {/* ── RIGHT PANEL ── */}
      <p
        className="absolute top-[52px] text-[12px] font-medium leading-none text-[#8794A9]"
        style={{ left: "calc(35vw + 80px)" }}
      >
        {loginContent.topBar.welcome}
      </p>

      <div className="absolute right-[28px] top-[42px] flex items-center gap-[12px]">
        <span className="text-[12px] font-medium leading-none text-[#9AA5B7]">
          {loginContent.topBar.signupText}
        </span>

        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="h-[30px] w-[96px] rounded-[6px] border border-[#08CFE8] bg-transparent text-[11px] font-bold leading-none text-[#08D4E9]"
        >
          {loginContent.topBar.signupButton}
        </button>
      </div>

      <div
        className="absolute top-[100px]"
        style={{ left: "calc(35vw + 75px)" }}
      >
        <DoctorLoginCard
          content={loginContent.form}
          credentials={credentials}
          isSubmitting={isSubmitting}
          onCredentialChange={updateCredential}
          onSubmit={submitLogin}
        />
      </div>

      <div
        className="absolute top-[880px]"
        style={{ left: "calc(35vw + 385px)" }}
      >
        <AuthFooterLinks footer={loginContent.footer} />
      </div>
    </main>
  );
}