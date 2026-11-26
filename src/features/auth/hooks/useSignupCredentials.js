// src/features/auth/hooks/useSignupCredentials.js

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupDoctor } from "../services/authService";

const initialSignupCredentials = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  specialization: "",
  license: "",
  hospital: "",
  designation: "",
  password: "",
  confirmPassword: "",
  agreeTerms: true,
};

export function useSignupCredentials() {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState(initialSignupCredentials);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  const updateCredential = (field, value) => {
    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [field]: value,
    }));

    setSignupError("");
    setSignupSuccess("");
  };

  const validateSignup = () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      specialization,
      license,
      hospital,
      password,
      confirmPassword,
      agreeTerms,
    } = credentials;

    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";
    if (!email.trim()) return "Email address is required.";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return "Please enter a valid email address.";

    if (!phone.trim()) return "Phone number is required.";
    if (!specialization.trim()) return "Specialization is required.";
    if (!license.trim()) return "Medical license number is required.";
    if (!hospital.trim()) return "Hospital/clinic name is required.";

    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";

    if (!agreeTerms) return "Please accept the terms and conditions.";

    return "";
  };

  const submitSignup = async (event) => {
    event.preventDefault();

    const validationError = validateSignup();
    if (validationError) {
      setSignupError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setSignupError("");
      setSignupSuccess("");

      await signupDoctor({
        fullName: `${credentials.firstName.trim()} ${credentials.lastName.trim()}`,
        email: credentials.email.trim(),
        password: credentials.password,
        phone: credentials.phone.trim(),
        specialization: credentials.specialization.trim(),
        licenseNumber: credentials.license.trim(),
        hospitalName: credentials.hospital.trim(),
        designation: credentials.designation.trim(),
      });

      setSignupSuccess("Doctor account created successfully.");

      setTimeout(() => {
        navigate("/home");
      }, 700);
    } catch (error) {
      console.error("Signup failed:", error);

      if (error.code === "auth/email-already-in-use") {
        setSignupError("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setSignupError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setSignupError("Password is too weak. Use at least 6 characters.");
      } else if (error.code === "auth/operation-not-allowed") {
        setSignupError("Email/password sign-up is turned off in Firebase (Authentication → Sign-in method).");
      } else if (error.code === "auth/network-request-failed") {
        setSignupError("No internet connection. Please check your network and try again.");
      } else {
        setSignupError(`Signup failed: ${error.message || "please try again."}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    credentials,
    isSubmitting,
    signupError,
    signupSuccess,
    updateCredential,
    submitSignup,
  };
}

export default useSignupCredentials;