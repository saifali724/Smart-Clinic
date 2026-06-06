import { useState } from "react";
import { loginWithCredentials } from "../services/authService";

const initialCredentials = {
  email: "dr.sarah.mitchell@hospital.com",
  password: "password123",
  rememberMe: true,
  role: "Physician",
};

export function useLoginCredentials({ onLoginSuccess }) {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateCredential(field, value) {
    setCredentials((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submitLogin(event) {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      const response = await loginWithCredentials(credentials);

      if (response?.success) {
        onLoginSuccess?.(response);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    credentials,
    isSubmitting,
    updateCredential,
    submitLogin,
  };
}