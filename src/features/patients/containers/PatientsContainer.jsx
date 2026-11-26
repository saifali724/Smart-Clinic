// src/features/patients/containers/PatientsContainer.jsx
//
// Responsive layout:
//   • Phone (< 768px): everything in one column, the page scrolls.
//   • Tablet (768–1279px): Personal Info + Vitals side by side, Medications/History full width below.
//   • Desktop (≥ 1280px): Figma layout — fits one screen, 3 columns (424 : 440 : 472),
//     each column scrolls inside itself, action bar pinned to the bottom.

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
    <main className="relative flex min-h-screen w-full flex-col bg-[#0c0f18] font-sans text-white xl:h-screen xl:min-h-[760px] xl:overflow-hidden">
      {/* 80px grid overlay — like Figma */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(46,56,82,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(46,56,82,0.25) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* nav — full width */}
      <PatientRecordTopBar />

      {/* header card */}
      <div className="relative z-10 mx-[12px] mt-[12px] shrink-0 sm:mx-[24px] sm:mt-[16px] xl:mx-[36px] xl:min-h-[110px]">
        <PatientRecordHeader patient={personalInfo} />
      </div>

      {/* columns */}
      <section className="relative z-10 mx-[12px] mt-[12px] grid grid-cols-1 gap-[12px] sm:mx-[24px] sm:mt-[16px] sm:gap-[16px] md:grid-cols-2 xl:mx-[36px] xl:mb-[26px] xl:min-h-0 xl:flex-1 xl:grid-cols-[424fr_440fr_472fr]">
        <PersonalInfoCard
          personalInfo={personalInfo}
          onFieldChange={updatePersonalField}
          onSave={savePersonalInfo}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
        />

        <VitalsCard vitals={vitals} />

        {/* Column 3 — medications + visit history in one card (full width on tablet) */}
        <div className="flex min-h-0 flex-col rounded-[16px] border border-[#2e3852] bg-[#141824] px-[14px] pb-[16px] pt-[20px] sm:px-[16px] sm:pt-[22px] md:col-span-2 xl:col-span-1 xl:h-full xl:overflow-y-auto">
          <div className="grid gap-x-[16px] md:grid-cols-2 xl:block">
            <div>
              <p className="pl-[8px] text-[10px] font-bold tracking-[0.06em] text-[#00bfd8]">
                CURRENT MEDICATIONS
              </p>
              <div className="mt-[14px]">
                <MedicationsCard medications={medications} />
              </div>
            </div>

            <div className="mt-[28px] md:mt-0 xl:mt-[28px]">
              <p className="pl-[8px] text-[10px] font-bold tracking-[0.06em] text-[#00bfd8]">
                VISIT HISTORY
              </p>
              <div className="mt-[12px]">
                <VisitHistoryCard visitHistory={visitHistory} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* action bar — normal flow on small screens; pinned 4px from the bottom on desktop (Figma) */}
      <div className="relative z-20 mx-[12px] my-[12px] sm:mx-[24px] sm:my-[16px] xl:absolute xl:bottom-[4px] xl:left-[36px] xl:right-[36px] xl:m-0 xl:h-[38px]">
        <PatientActionBar />
      </div>
    </main>
  );
}
