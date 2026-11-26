// src/features/consultation/containers/ConsultationScreen.jsx
//
// 03 · Live Consultation (Figma)
//   Desktop ≥1280px: exactly like Figma at 1440×900 — three columns 380 / 580 / 376, 16px gaps,
//                    36px sides, everything on one screen.
//   Tablet 768–1279: Doctor Interface + Transcript side by side, AI Analysis full width below.
//   Phone <768:      Transcript first, then AI Analysis, then Doctor Interface.

import { useNavigate } from "react-router-dom";
import { useConsultation } from "../hooks/useConsultation";
import ConsultStyles from "../components/ConsultStyles";
import ConsultTopBar from "../components/ConsultTopBar";
import DoctorPanel from "../components/DoctorPanel";
import TranscriptPanel from "../components/TranscriptPanel";
import AnalysisPanel from "../components/AnalysisPanel";

const gridBackground = {
  backgroundImage:
    "linear-gradient(rgba(46,56,82,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(46,56,82,0.25) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
};

export function ConsultationScreen() {
  const navigate = useNavigate();
  // the camera <video> ref is passed on its own (refs must not be read during render)
  const { videoRef, ...c } = useConsultation();

  async function handleEnd() {
    const ok = await c.endSession();
    if (ok) navigate(`/patientrecord?id=${encodeURIComponent(c.patientId)}`);
  }

  return (
    <main
      className="relative flex min-h-screen w-full flex-col bg-[#0C0F18] font-sans text-[#EDF2FC] xl:h-screen xl:min-h-[760px] xl:overflow-hidden"
      style={gridBackground}
    >
      <ConsultStyles />
      <ConsultTopBar status={c.status} seconds={c.seconds} patientName={c.patientName} />

      {!c.patientId ? (
        <div className="c-fade-up mx-auto mt-[40px] w-[calc(100%-32px)] max-w-[460px] rounded-[16px] border border-[#2E3852] bg-[#141824] px-[24px] py-[28px] text-center">
          <p className="text-[16px] font-bold">No patient selected</p>
          <p className="mt-[8px] text-[13px] leading-[19px] text-[#8C99B8]">
            Open a patient's record and press "Start Consultation".
          </p>
          <button
            type="button"
            onClick={() => navigate("/idscanner")}
            className="mt-[18px] h-[40px] rounded-[10px] bg-[#00BFD8] px-[20px] text-[13px] font-bold text-[#0C0F18]"
          >
            Go to Scanner
          </button>
        </div>
      ) : (
        <div className="relative z-10 grid flex-1 grid-cols-1 gap-[12px] p-[12px] sm:gap-[16px] sm:p-[24px] md:grid-cols-2 xl:min-h-0 xl:grid-cols-[380fr_580fr_376fr] xl:px-[36px] xl:pb-[24px] xl:pt-[16px]">
          <div className="order-3 min-h-0 md:order-1">
            <DoctorPanel c={c} videoRef={videoRef} />
          </div>
          <div className="order-1 min-h-0 md:order-2">
            <TranscriptPanel c={c} />
          </div>
          <div className="order-2 min-h-0 md:order-3 md:col-span-2 xl:col-span-1">
            <AnalysisPanel c={c} onEnd={handleEnd} />
          </div>
        </div>
      )}

      {c.loadError && (
        <p className="fixed left-1/2 top-[72px] z-50 -translate-x-1/2 rounded-[10px] border border-[#FF6060]/40 bg-[#141824] px-[14px] py-[8px] text-[12px] text-[#FF8A8A]">
          {c.loadError}
        </p>
      )}

      {c.toast && (
        <div
          role="status"
          className="c-toast fixed bottom-[28px] left-1/2 z-50 max-w-[90vw] rounded-[10px] border border-[#2E3852] bg-[#1A1F2E] px-[16px] py-[10px] text-[12px] font-medium text-[#EDF2FC] shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
        >
          {c.toast}
        </div>
      )}
    </main>
  );
}

export default ConsultationScreen;
