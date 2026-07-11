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
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#0c0f18] font-sans text-white">
      {/* 80px grid overlay — like Figma */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(46,56,82,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(46,56,82,0.25) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* nav — full width, 64px */}
      <PatientRecordTopBar />

      {/* header card — 36px side margins, 110px tall */}
      <div className="relative z-10 mx-[36px] mt-[16px] h-[110px] shrink-0">
        <PatientRecordHeader patient={personalInfo} />
      </div>

      {/* 3 columns — Figma width ratio 424 : 440 : 472, 16px gaps.
          mb-[26px] + action bar at bottom-[4px] reproduces the exact
          16px overlap the Figma design has. */}
      <section className="relative z-10 mx-[36px] mb-[26px] mt-[16px] grid min-h-0 flex-1 grid-cols-[424fr_440fr_472fr] gap-[16px]">
        <PersonalInfoCard
          personalInfo={personalInfo}
          onFieldChange={updatePersonalField}
          onSave={savePersonalInfo}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
        />

        <VitalsCard vitals={vitals} />

        {/* Column 3 — medications + visit history in one card */}
        <div className="flex h-full min-h-0 flex-col overflow-y-auto rounded-[16px] border border-[#2e3852] bg-[#141824] px-[16px] pb-[16px] pt-[22px]">
          <p className="pl-[8px] text-[10px] font-bold tracking-[0.06em] text-[#00bfd8]">
            CURRENT MEDICATIONS
          </p>
          <div className="mt-[14px]">
            <MedicationsCard medications={medications} />
          </div>

          <p className="mt-[28px] pl-[8px] text-[10px] font-bold tracking-[0.06em] text-[#00bfd8]">
            VISIT HISTORY
          </p>
          <div className="mt-[12px]">
            <VisitHistoryCard visitHistory={visitHistory} />
          </div>
        </div>
      </section>

      {/* action bar — pinned 4px from bottom, overlapping columns like Figma */}
      <div className="absolute bottom-[4px] left-[36px] right-[36px] z-20 h-[38px]">
        <PatientActionBar />
      </div>
    </main>
  );
}