// src/features/auth/data/forgotPasswordContent.js

export const forgotPasswordContent = {
  topBar: {
    welcome: "Account recovery",
    text: "Remembered it?",
    button: "Sign In",
  },

  steps: ["Email", "Verify", "New Password"],

  email: {
    title: "Forgot Password",
    subtitle: "Enter your account email and we'll send you a 6-digit code",
    label: "EMAIL ADDRESS",
    placeholder: "dr.sarah.mitchell@hospital.com",
    button: "Send Code",
    sending: "Sending Code...",
  },

  otp: {
    title: "Enter Code",
    subtitlePrefix: "We sent a 6-digit code to",
    label: "VERIFICATION CODE",
    button: "Verify Code",
    verifying: "Verifying...",
    resend: "Resend code",
    resendIn: "Resend code in",
    changeEmail: "Change email",
    hint: "The code expires in 10 minutes. Check your spam folder if you can't find it.",
  },

  password: {
    title: "New Password",
    subtitle: "Choose a strong password you haven't used before",
    newLabel: "NEW PASSWORD",
    confirmLabel: "CONFIRM PASSWORD",
    placeholder: "••••••••••••",
    button: "Update Password",
    saving: "Updating...",
    rules: [
      { id: "length", text: "At least 8 characters", test: (p) => p.length >= 8 },
      { id: "letter", text: "Contains a letter", test: (p) => /[A-Za-z]/.test(p) },
      { id: "number", text: "Contains a number", test: (p) => /\d/.test(p) },
    ],
    matchRule: "Both passwords match",
  },

  done: {
    title: "Password Updated",
    subtitle: "Your password has been changed. You can now sign in with your new password.",
    button: "Back to Sign In",
  },

  backToLogin: "Back to Sign In",
  securityText: "Codes are single-use  ·  Expire in 10 minutes  ·  5 tries per code",
};
