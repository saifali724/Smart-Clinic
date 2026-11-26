// src/features/auth/containers/ForgotPasswordScreenContainer.jsx
// Forgot Password — same page layout as Login (AuthSplitLayout).
// Steps: email → 6-digit code from the email → new password → done.

import { useLocation, useNavigate } from "react-router-dom";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import { ForgotPasswordCard } from "../components/ForgotPasswordCard";
import { forgotPasswordContent } from "../data/forgotPasswordContent";
import { useForgotPassword } from "../hooks/useForgotPassword";

export function ForgotPasswordScreenContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  // if the doctor already typed their email on the login page, start with it
  const flow = useForgotPassword(location.state?.email || "");

  return (
    <AuthSplitLayout
      welcomeText={forgotPasswordContent.topBar.welcome}
      topBarText={forgotPasswordContent.topBar.text}
      topBarButton={forgotPasswordContent.topBar.button}
      onTopBarButton={() => navigate("/")}
    >
      <style>{`
        @keyframes fpStepIn {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fpShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-7px); }
          40% { transform: translateX(7px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes fpPop {
          0%   { opacity: 0; transform: scale(0.6); }
          70%  { opacity: 1; transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes fpDraw {
          from { stroke-dashoffset: 24; }
          to   { stroke-dashoffset: 0; }
        }
        .fp-step   { animation: fpStepIn 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        .otp-shake { animation: fpShake 0.4s ease; }
        .fp-pop    { animation: fpPop 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        .fp-check  { stroke-dasharray: 24; animation: fpDraw 0.4s 0.25s ease-out both; }
      `}</style>

      <ForgotPasswordCard
        flow={flow}
        onBackToLogin={() => navigate("/", { state: { email: flow.email } })}
      />
    </AuthSplitLayout>
  );
}

export default ForgotPasswordScreenContainer;
