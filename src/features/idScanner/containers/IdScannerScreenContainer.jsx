// src/features/idScanner/containers/IdScannerScreenContainer.jsx

import IdScannerTopBar from "../components/IdScannerTopBar";
import PatientQueue from "../components/PatientQueue";
import ScannerPanel from "../components/ScannerPanel";
import ScannerStats from "../components/ScannerStats";
import SystemLog from "../components/SystemLog";
import { formFields } from "../data/idScannerContent";
import { useIdScanner } from "../hooks/useIdScanner";

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

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0B0E14] font-sans text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(35,48,76,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(35,48,76,0.22)_1px,transparent_1px)] bg-[size:65px_65px]" />

      <div className="relative z-10">
        <IdScannerTopBar />

        <section className="grid min-h-[calc(100vh-54px)] grid-cols-1 gap-[18px] px-[18px] py-[14px] lg:grid-cols-[405px_1fr]">
          <aside className="h-full rounded-[14px] border border-[#24324D] bg-[#131926]/95 px-[37px] py-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
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
              <div className="flex h-full flex-col">
                <div className="mb-[18px] flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#00C2E0]">
                    Personal Information
                  </p>
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="rounded-[6px] border border-[#26344F] px-[10px] py-[6px] text-[9px] font-black uppercase text-[#8B96AA] transition hover:border-[#00C2E0] hover:text-[#00C2E0]"
                  >
                    ✕ Reset
                  </button>
                </div>

                <div className="grid gap-[9px]">
                  {formFields.map((field) => (
                    <label
                      key={field.name}
                      className="block rounded-[9px] border border-[#26344F] bg-[#0B0E14] px-[12px] py-[9px]"
                    >
                      <span className="mb-[6px] block text-[9px] font-black uppercase tracking-[0.1em] text-[#59657B]">
                        {field.label}
                      </span>
                      <input
                        name={field.name}
                        value={formData[field.name] ?? ""}
                        onChange={updateFormField}
                        className="h-[33px] w-full rounded-[7px] border border-[#1E2D42] bg-[#131926] px-[10px] text-[12px] font-semibold text-[#DCE6F3] outline-none transition focus:border-[#00C2E0]"
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={confirmAndSavePatient}
                  disabled={isSaving}
                  className="mt-[16px] flex h-[45px] w-full items-center justify-center rounded-[8px] bg-[#00C2E0] text-[10px] font-black uppercase tracking-[0.04em] text-[#071018] transition hover:bg-[#1EE7FF] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Confirm & Save Patient Record"}
                </button>
              </div>
            )}
          </aside>

          <section className="flex min-h-[620px] flex-col rounded-[14px] border border-[#24324D] bg-[#131926]/95 px-[16px] py-[18px] shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
            <PatientQueue
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={selectPatient}
            />
            <ScannerStats />
            <SystemLog />
          </section>
        </section>
      </div>
    </main>
  );
}

export default IdScannerScreenContainer;