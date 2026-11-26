// src/features/auth/hooks/useForgotPassword.js
// The 4 steps of Forgot Password:  email → otp → password → done

import { useCallback, useEffect, useState } from "react";
import { requestResetCode, setNewPassword, verifyResetCode } from "../services/passwordResetService";
import { forgotPasswordContent } from "../data/forgotPasswordContent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useForgotPassword(initialEmail = "") {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0); // seconds until "Resend code" works
  const [shakeKey, setShakeKey] = useState(0); // bump → OTP boxes shake

  // resend countdown
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const passwordChecks = forgotPasswordContent.password.rules.map((r) => ({
    ...r,
    ok: r.test(newPassword),
  }));
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const passwordValid = passwordChecks.every((c) => c.ok) && passwordsMatch;

  // ── step 1: send code ───────────────────────────────────────
  const sendCode = useCallback(async () => {
    const clean = email.trim();
    if (!EMAIL_RE.test(clean)) {
      setError("Please enter a valid email address.");
      return false;
    }
    setIsBusy(true);
    setError("");
    try {
      const res = await requestResetCode(clean);
      setCooldown(res.cooldown || 60);
      setOtp("");
      setStep("otp");
      return true;
    } catch (err) {
      setError(err.message);
      if (err.retryAfter) {
        setCooldown(err.retryAfter);
        // a code was already sent a moment ago — let them type it
        if (step === "email") setStep("otp");
      }
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [email, step]);

  const submitEmail = (event) => {
    event.preventDefault();
    sendCode();
  };

  const resendCode = () => {
    if (cooldown > 0 || isBusy) return;
    sendCode();
  };

  const changeEmail = () => {
    setStep("email");
    setOtp("");
    setError("");
  };

  // ── step 2: check code ──────────────────────────────────────
  const verifyCode = useCallback(
    async (code) => {
      if (code.length !== 6 || isBusy) return;
      setIsBusy(true);
      setError("");
      try {
        const res = await verifyResetCode(email.trim(), code);
        setResetToken(res.resetToken);
        setStep("password");
      } catch (err) {
        setError(err.message);
        setOtp("");
        setShakeKey((k) => k + 1);
      } finally {
        setIsBusy(false);
      }
    },
    [email, isBusy]
  );

  const updateOtp = (value) => {
    setOtp(value);
    if (error) setError("");
    if (value.length === 6) verifyCode(value); // check as soon as all 6 digits are in
  };

  const submitOtp = (event) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError("Enter all 6 digits of the code.");
      setShakeKey((k) => k + 1);
      return;
    }
    verifyCode(otp);
  };

  // ── step 3: new password ────────────────────────────────────
  const submitPassword = async (event) => {
    event.preventDefault();
    if (!passwordValid) {
      setError(
        passwordsMatch
          ? "Your password doesn't meet all the rules below."
          : "The two passwords don't match."
      );
      return;
    }
    setIsBusy(true);
    setError("");
    try {
      await setNewPassword(email.trim(), resetToken, newPassword);
      setStep("done");
      setNewPasswordValue("");
      setConfirmPassword("");
      setResetToken("");
    } catch (err) {
      setError(err.message);
      if (err.restart) {
        setStep("email");
        setResetToken("");
      }
    } finally {
      setIsBusy(false);
    }
  };

  return {
    step,
    email,
    otp,
    newPassword,
    confirmPassword,
    isBusy,
    error,
    cooldown,
    shakeKey,
    passwordChecks,
    passwordsMatch,
    passwordValid,
    setEmail: (v) => {
      setEmail(v);
      if (error) setError("");
    },
    setNewPassword: (v) => {
      setNewPasswordValue(v);
      if (error) setError("");
    },
    setConfirmPassword: (v) => {
      setConfirmPassword(v);
      if (error) setError("");
    },
    updateOtp,
    submitEmail,
    submitOtp,
    resendCode,
    changeEmail,
    submitPassword,
  };
}

export default useForgotPassword;
