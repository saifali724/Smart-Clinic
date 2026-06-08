// src/features/auth/hooks/useLoginCredentials.js

import { useState } from "react";
import { loginWithCredentials } from "../services/authService";

const initialCredentials = {
  email: "",
  password: "",
  rememberMe: true,
  role: "Physician",
};

export function useLoginCredentials({ onLoginSuccess }) {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  function updateCredential(field, value) {
    setCredentials((current) => ({
      ...current,
      [field]: value,
    }));

    setLoginError("");
  }

  function validateLogin() {
    if (!credentials.email.trim()) return "Email address is required.";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(credentials.email)) {
      return "Please enter a valid email address.";
    }

    if (!credentials.password) return "Password is required.";
    if (credentials.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  }

  async function submitLogin(event) {
    event.preventDefault();

    const validationError = validateLogin();

    if (validationError) {
      setLoginError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setLoginError("");

      const response = await loginWithCredentials({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      onLoginSuccess?.(response);
    } catch (error) {
      console.error("Login failed:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setLoginError("Invalid email or password.");
      } else if (error.code === "auth/invalid-email") {
        setLoginError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setLoginError("Too many attempts. Please try again later.");
      } else {
        setLoginError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    credentials,
    isSubmitting,
    loginError,
    updateCredential,
    submitLogin,
  };
}

export default useLoginCredentials;