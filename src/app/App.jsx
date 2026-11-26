// src/app/App.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import HomePage from "../features/dashboard/pages/HomePage";
import IdScannerPage from "../features/idScanner/pages/IdScannerPage";
import PatientRecordPage from "../features/patientRecord/pages/PatientRecordPage";
import ConsultationPage from "../features/consultation/pages/ConsultationPage";
// ProtectedRoute (login required) is switched off for now — every screen is open.
// To turn it back on, wrap a route's element: <ProtectedRoute><Page /></ProtectedRoute>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/idscanner" element={<IdScannerPage />} />
        <Route path="/patientrecord" element={<PatientRecordPage />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}