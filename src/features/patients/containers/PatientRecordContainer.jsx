// src/features/patients/containers/PatientsContainer.jsx

import PatientRecordTopBar from "../components/PatientRecordTopBar";
import PatientRecordHeader from "../components/PatientRecordHeader";
import PersonalInfoCard from "../components/PersonalInfoCard";
import VitalsCard from "../components/VitalsCard";
import MedicationsCard from "../components/MedicationsCard";
import VisitHistoryCard from "../components/VisitHistoryCard";
import PatientActionBar from "../components/PatientActionBar";
import { usePatients } from "../hooks/usePatients";

export default function PatientsContainer() {
  const {
    personalInfo, updatePersonalField, savePersonalInfo,
    isSaving, saveSuccess, vitals, medications, visitHistory,
  } = usePatients();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0c0f18] font-sans text-white">
      {/* Grid overlay like Figma */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(46,56,82,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(46,56,82,0.25)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 flex h-full flex-col">
        <PatientRecordTopBar />
        <PatientRecordHeader patient={personalInfo} />

        {/* 3-column body — exact Figma widths: 424 · 440 · remaining */}
        <section className="mx-[36px] mt-[16px] grid min-h-0 flex-1 grid-cols-[424px_440px_1fr] gap-[16px]">
          {/* Col 1 — Personal Info */}
          <PersonalInfoCard
            personalInfo={personalInfo}
            onFieldChange={updatePersonalField}
            onSave={savePersonalInfo}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
          />

          {/* Col 2 — Vitals */}
          <VitalsCard vitals={vitals} />

          {/* Col 3 — Medications + Visit History stacked */}
          <div className="flex min-h-0 flex-col rounded-[16px] border border-[#2e3852] bg-[#141824] px-[16px] py-[22px]">
            <div className="flex-1 overflow-y-auto pr-[4px]">
              <MedicationsCard medications={medications} />
              <div className="mt-[20px]">
                <VisitHistoryCard visitHistory={visitHistory} />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom action bar */}
        <div className="shrink-0 px-0 py-[10px]">
          <PatientActionBar />
        </div>
      </div>
    </main>
  );
}