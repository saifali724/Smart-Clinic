// src/features/auth/containers/LoginScreenContainer.jsx
// Login screen — page layout lives in AuthSplitLayout (shared with Forgot Password).

import { useLocation, useNavigate } from "react-router-dom";
import { loginContent } from "../data/loginContent";
import { useLoginCredentials } from "../hooks/useLoginCredentials";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import { DoctorLoginCard } from "../components/DoctorLoginCard";

export function LoginScreenContainer() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    credentials,
    isSubmitting,
    loginError,
    updateCredential,
    submitLogin,
  } = useLoginCredentials({
    onLoginSuccess: () => navigate("/home"),
    initialEmail: location.state?.email || "",
  });

  return (
    <AuthSplitLayout
      welcomeText={loginContent.topBar.welcome}
      topBarText={loginContent.topBar.signupText}
      topBarButton={loginContent.topBar.signupButton}
      onTopBarButton={() => navigate("/signup")}
    >
      <DoctorLoginCard
        content={loginContent.form}
        credentials={credentials}
        isSubmitting={isSubmitting}
        loginError={loginError}
        onCredentialChange={updateCredential}
        onSubmit={submitLogin}
        onForgotPassword={() => navigate("/forgot-password", { state: { email: credentials.email } })}
      />
    </AuthSplitLayout>
  );
}

export default LoginScreenContainer;
