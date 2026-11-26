// src/features/idScanner/containers/IdScannerScreenContainer.jsx

import IdScannerTopBar from "../components/IdScannerTopBar";
import PatientQueue from "../components/PatientQueue";
import ScannerPanel from "../components/ScannerPanel";
import ScannerStats from "../components/ScannerStats";
import ScannerStyles from "../components/ScannerStyles";
import SystemLog from "../components/SystemLog";
import { formFields } from "../data/idScannerContent";
import { useIdScanner } from "../hooks/useIdScanner";

// 80px background grid, lines #2E3852 at 25% (from Figma)
const gridBackground = {
  backgroundImage:
    "linear-gradient(rgba(46,56,82,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(46,56,82,0.25) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
};

export function IdScannerScreenContainer() {
  const {
    videoRef, canvasRef,
    activeView, cameraOpen, cameraError,
    isScanning, scanProgress, ocrStatus,
    patients, selectedPatientId, selectedPatient,
    formData, isSaving,
    beginScanSession,
    captureAndProcessCnic,
    uploadAndProcessCnic,
    closeCameraModal,
    resetScanner,
    selectPatient,
    updateFormField,
    confirmAndSavePatient,
  } = useIdScanner();

  // On phones/tablets the scanner sits above the queue — after picking a
  // patient, scroll back up so the "Begin Scan" button is in view.
  function handleSelectPatient(patient) {
    selectPatient(patient);
    if (window.innerWidth < 1024) {
      document.getElementById("scanner-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <main
      className="min-h-screen w-full bg-[#0C0F18] font-sans text-[#EDF2FC]"
      style={gridBackground}
    >
      <ScannerStyles />
      <IdScannerTopBar />

      {/* Phone/tablet: panels stacked. Laptop+ (≥1024px): side by side —
          Figma: 21px left, 35px gap, 36px right → 500px + 848px at 1440 wide */}
      <section className="flex flex-col gap-[16px] p-[12px] sm:gap-[24px] sm:p-[24px] lg:h-[calc(100vh-64px)] lg:min-h-[836px] lg:flex-row lg:gap-[35px] lg:pb-[24px] lg:pl-[21px] lg:pr-[36px] lg:pt-[16px]">
        {/* LEFT — scanner panel (500px) */}
        <aside
          style={{ animationDelay: "90ms" }}
          className="s-left flex w-full shrink-0 flex-col rounded-[20px] border border-[#2E3852] bg-[#141824] px-[16px] pb-[24px] pt-[24px] sm:px-[49px] sm:pb-[30px] sm:pt-[37px] lg:w-[500px]"
        >
          {activeView === "scanner" ? (
            <ScannerPanel
              videoRef={videoRef}
              canvasRef={canvasRef}
              cameraOpen={cameraOpen}
              cameraError={cameraError}
              isScanning={isScanning}
              scanProgress={scanProgress}
              ocrStatus={ocrStatus}
              selectedPatient={selectedPatient}
              onBeginScan={beginScanSession}
              onCaptureCnic={captureAndProcessCnic}
              onCloseCamera={closeCameraModal}
              onUploadCnic={uploadAndProcessCnic}
            />
          ) : (
            <div className="s-up flex h-full flex-col">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase leading-[13px] text-[#00BFD8]">
                  Personal Information
                </p>
                <button
                  type="button"
                  onClick={resetScanner}
                  className="rounded-[10px] border border-[#2E3852] px-[12px] py-[7px] text-[11px] font-bold uppercase leading-none text-[#8C99B8] transition hover:border-[#00BFD8] hover:text-[#00BFD8]"
                >
                  ✕ Reset
                </button>
              </div>
              <p className="mt-[9px] text-[13px] font-normal leading-[16px] text-[#8C99B8]">
                Check the details read from the CNIC, then save.
              </p>

              <div className="mt-[18px] space-y-[12px]">
                {formFields.map((field, i) => (
                  <label key={field.name} className="s-up block" style={{ animationDelay: `${80 + i * 45}ms` }}>
                    <span className="block text-[10px] font-bold uppercase leading-[12px] text-[#596685]">
                      {field.label}
                    </span>
                    <input
                      name={field.name}
                      value={formData[field.name] ?? ""}
                      onChange={updateFormField}
                      className="mt-[6px] h-[42px] w-full rounded-[10px] border border-[#2E3852] bg-[#0C0F18] px-[14px] text-[13px] font-medium text-[#EDF2FC] outline-none transition focus:border-[#00BFD8]"
                    />
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={confirmAndSavePatient}
                disabled={isSaving}
                className="mt-[24px] flex h-[52px] w-full shrink-0 items-center lg:mt-auto justify-center rounded-[14px] bg-[#00BFD8] text-[14px] font-bold uppercase leading-none text-[#0C0F18] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Confirm & Save Patient Record"}
              </button>
            </div>
          )}
        </aside>

        {/* RIGHT — queue panel (fills the rest, 848px at 1440 wide) */}
        <section
          style={{ animationDelay: "170ms" }}
          className="s-right flex min-w-0 flex-1 flex-col rounded-[20px] border border-[#2E3852] bg-[#141824] px-[12px] pb-[14px] pt-[20px] sm:px-[19px] sm:pb-[17px] sm:pt-[27px] lg:min-h-0"
        >
          <PatientQueue
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
          />
          <ScannerStats />
          <SystemLog />
        </section>
      </section>
    </main>
  );
}

export default IdScannerScreenContainer;