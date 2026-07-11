// src/features/patients/hooks/usePatients.js

import { useCallback, useEffect, useState } from "react";
import { defaultVitals, emptyPersonalInfo } from "../data/patientRecordContent";

export function usePatients() {
  const [personalInfo, setPersonalInfo] = useState({ ...emptyPersonalInfo });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [vitals, setVitals] = useState(defaultVitals);
  const [medications, setMedications] = useState([]);
  const [visitHistory, setVisitHistory] = useState([]);

  function updatePersonalField(name, value) {
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
  }

  async function savePersonalInfo() {
    setIsSaving(true);
    try {
      console.log("Saving patient info:", personalInfo);
      await new Promise((r) => setTimeout(r, 600));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  }

  const pushVitalReading = useCallback((key, value, fillPx) => {
    setVitals((prev) =>
      prev.map((v) => (v.key === key ? { ...v, value, fillPx: Math.min(fillPx, 400) } : v))
    );
  }, []);

  useEffect(() => {
    setMedications([
      { name: "Amlodipine 5mg", schedule: "Once daily — morning", color: "#ff9e3d" },
      { name: "Metformin 500mg", schedule: "Twice daily — with meals", color: "#936aff" },
      { name: "Atorvastatin 20mg", schedule: "Once daily — bedtime", color: "#00bfd8" },
      { name: "Aspirin 75mg", schedule: "Once daily — morning", color: "#32e293" },
    ]);
    setVisitHistory([
      { date: "Nov 12, 2024", doctor: "Dr. Khalid", reason: "Hypertension follow-up" },
      { date: "Sep 05, 2024", doctor: "Dr. Sarah", reason: "Diabetes review" },
      { date: "Jul 21, 2024", doctor: "Dr. Khalid", reason: "Cardiac check" },
      { date: "May 10, 2024", doctor: "Dr. Sarah", reason: "Routine examination" },
    ]);
  }, []);

  return {
    personalInfo, updatePersonalField, savePersonalInfo,
    isSaving, saveSuccess, vitals, pushVitalReading,
    medications, visitHistory,
  };
}

export default usePatients;