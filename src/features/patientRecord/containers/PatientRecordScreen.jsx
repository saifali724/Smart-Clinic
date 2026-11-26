// src/features/patientRecord/containers/PatientRecordScreen.jsx
//
// 02 · Patient Record — built from the Figma file.
//
// Layout
//   • Desktop (≥1280px): exactly like Figma at 1440×900 — fits one screen,
//     header 1368×110, three columns 424 : 440 : 472 (16px gaps), cards scroll
//     inside themselves, action bar pinned 4px from the bottom.
//   • Tablet (768–1279px): Personal + Vitals side by side, Medications/History below.
//   • Phone (<768px): one column, the page scrolls.

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentDoctor } from "../hooks/useCurrentDoctor";
import { usePatientRecord } from "../hooks/usePatientRecord";
import { useLiveVitals } from "../hooks/useLiveVitals";
import RecordStyles from "../components/RecordStyles";
import RecordTopBar from "../components/RecordTopBar";
import RecordHeader from "../components/RecordHeader";
import PersonalInfoPanel from "../components/PersonalInfoPanel";
import VitalsPanel from "../components/VitalsPanel";
import HistoryPanel from "../components/HistoryPanel";
import RecordActionBar from "../components/RecordActionBar";

// 80px background grid (Figma)
const gridBackground = {
  backgroundImage:
    "linear-gradient(rgba(46,56,82,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(46,56,82,0.25) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
};

function MessageCard({ title, text, actionLabel, onAction }) {
  return (
    <div className="rec-fade-up mx-auto mt-[40px] w-full max-w-[460px] rounded-[16px] border border-[#2E3852] bg-[#141824] px-[24px] py-[28px] text-center">
      <p className="text-[16px] font-bold text-[#EDF2FC]">{title}</p>
      <p className="mt-[8px] text-[13px] leading-[19px] text-[#8C99B8]">{text}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-[18px] h-[40px] rounded-[10px] bg-[#00BFD8] px-[20px] text-[13px] font-bold text-[#0C0F18] transition hover:brightness-110"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function PatientRecordScreen() {
  const navigate = useNavigate();
  const { doctor, isLoading: doctorLoading } = useCurrentDoctor();
  const record = usePatientRecord(doctor, doctorLoading);
  const { vitals, anyLive } = useLiveVitals(record.patientId, record.currentVisitId);

  const firstFieldRef = useRef(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleAction = useCallback((id) => {
    if (id === "print") return window.print();
    if (id === "edit") return firstFieldRef.current?.focus();
    if (id === "consultation" && record.patientId) {
      return navigate(`/consultation?id=${encodeURIComponent(record.patientId)}`);
    }
    // Consultation, Prescriptions and Share screens are built next
    const names = {
      consultation: "Consultation",
      prescriptions: "Prescriptions",
      share: "Share",
    };
    setToast(`${names[id]} screen is coming in the next step`);
    return undefined;
  }, [navigate, record.patientId]);

  const isLoading = record.status === "loading";
  const showRecord = record.status === "ready" || isLoading;

  return (
    <main
      className="relative flex min-h-screen w-full flex-col bg-[#0C0F18] font-sans text-[#EDF2FC] xl:h-screen xl:min-h-[760px] xl:overflow-hidden"
      style={gridBackground}
    >
      <RecordStyles />
      <RecordTopBar />

      {record.error && record.status !== "error" && (
        <p className="rec-fade-in relative z-10 mx-[12px] mt-[12px] rounded-[10px] border border-[#FF6060]/40 bg-[#FF6060]/10 px-[14px] py-[10px] text-[12px] text-[#FF6060] sm:mx-[24px] xl:mx-[36px]">
          {record.error}
        </p>
      )}

      {record.status === "no-patient" && (
        <MessageCard
          title="No patient selected"
          text="Scan a patient's CNIC on the ID Scanner, and their record opens here."
          actionLabel="Go to Scanner"
          onAction={() => navigate("/idscanner")}
        />
      )}
      {record.status === "not-found" && (
        <MessageCard
          title="Patient not found"
          text={`There is no patient with ID ${record.patientId} in the database.`}
          actionLabel="Go to Scanner"
          onAction={() => navigate("/idscanner")}
        />
      )}
      {record.status === "error" && (
        <MessageCard
          title="Couldn't open the record"
          text={record.error}
          actionLabel="Try again"
          onAction={() => window.location.reload()}
        />
      )}

      {showRecord && (
        <>
          {/* header — Figma: 16px below the nav, 36px side margins */}
          <div className="m-pop relative z-10 mx-[12px] mt-[12px] shrink-0 sm:mx-[24px] sm:mt-[16px] xl:mx-[36px]" style={{ animationDelay: "40ms" }}>
            <RecordHeader
              patient={record.patient}
              patientId={record.patientId}
              conditions={record.conditions}
              lastVisit={record.lastVisit}
              doctor={doctor}
              isLoading={isLoading}
            />
          </div>

          {/* three columns — Figma: 424 / 440 / 472, 16px gaps, ends 26px above the bottom */}
          <div className="relative z-10 mx-[12px] mt-[12px] grid grid-cols-1 gap-[12px] sm:mx-[24px] sm:mt-[16px] sm:gap-[16px] md:grid-cols-2 xl:mx-[36px] xl:mb-[26px] xl:min-h-0 xl:flex-1 xl:grid-cols-[424fr_440fr_472fr]">
            <PersonalInfoPanel
              patient={record.patient}
              isLoading={isLoading}
              onSave={record.saveFields}
              focusRef={firstFieldRef}
              delay={60}
            />
            <VitalsPanel vitals={vitals} anyLive={anyLive} isLoading={isLoading} delay={120} />
            <HistoryPanel
              medications={record.medications}
              visits={record.previousVisits}
              isLoading={isLoading}
              delay={180}
              className="md:col-span-2 xl:col-span-1"
            />
          </div>

          {/* action bar — in the page flow on small screens; pinned like Figma on desktop */}
          <div
            className="m-rise relative z-20 mx-[12px] my-[12px] sm:mx-[24px] sm:my-[16px] xl:absolute xl:bottom-[4px] xl:left-[36px] xl:right-[36px] xl:m-0 xl:h-[38px]"
            style={{ animationDelay: "300ms" }}
          >
            <RecordActionBar onAction={handleAction} />
          </div>
        </>
      )}

      {toast && (
        <div
          role="status"
          className="rec-toast fixed bottom-[56px] left-1/2 z-50 max-w-[90vw] rounded-[10px] border border-[#2E3852] bg-[#1A1F2E] px-[16px] py-[10px] text-[12px] font-medium text-[#EDF2FC] shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
        >
          {toast}
        </div>
      )}
    </main>
  );
}

export default PatientRecordScreen;
