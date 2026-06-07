// src/features/auth/hooks/useSignupCredentials.js

import { useState } from "react";

const initialSignupCredentials = {
  firstName: "Sarah",
  lastName: "",
  email: "",
  phone: "",
  specialization: "",
  license: "",
  hospital: "",
  designation: "",
  agreeTerms: true,
};

export function useSignupCredentials() {
  const [credentials, setCredentials] = useState(initialSignupCredentials);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateCredential = (field, value) => {
    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [field]: value,
    }));
  };

  const submitSignup = (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    console.log("Doctor signup data:", credentials);

    setTimeout(() => {
      setIsSubmitting(false);
    }, 600);
  };

  return {
    credentials,
    isSubmitting,
    updateCredential,
    submitSignup,
  };
}

export default useSignupCredentials;