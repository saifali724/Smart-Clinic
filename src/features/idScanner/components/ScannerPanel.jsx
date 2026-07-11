// src/features/idScanner/components/ScannerPanel.jsx

import { useRef } from "react";
import { createPortal } from "react-dom";
import SensorStatusList from "./SensorStatusList";

export function ScannerPanel({
  videoRef,
  canvasRef,
  cameraOpen,
  cameraError,
  isScanning,
  scanProgress,
  ocrStatus,
  selectedPatient,
  onBeginScan,
  onCaptureCnic,
  onCloseCamera,
  onUploadCnic,
}) {
  const fileInputRef = useRef(null);

  const cameraModal = cameraOpen
    ? createPortal(
        <div className="fixed inset-0 z-[99999] bg-black text-white">
          {/* Top Bar */}
          <div className="fixed left-0 right-0 top-0 z-[100002] flex h-[68px] items-center justify-between border-b border-[#1F2937] bg-[#0B0E14] px-6">
            <div>
              <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#00C2E0]">
                CNIC Camera Scanner
              </p>
              <p className="mt-[3px] text-[11px] font-medium text-[#9AA7BA]">
                Place CNIC card inside the cyan frame, then tap Capture
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseCamera}
              disabled={isScanning}
              className="rounded-[8px] border border-[#26344F] bg-[#111827] px-[14px] py-[9px] text-[10px] font-black uppercase text-[#9AA7BA] transition hover:border-[#FF5C7A] hover:text-[#FF5C7A] disabled:opacity-40"
            >
              ✕ Close
            </button>
          </div>

          {/* Video */}
          <div className="fixed inset-0 bg-black pt-[68px] pb-[120px]">
            <video
              ref={videoRef}
              className="h-full w-full bg-black object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* CNIC Overlay Frame */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 pt-[68px] pb-[120px]">
              <div className="relative aspect-[1.58/1] w-[90vw] max-w-[900px] rounded-[12px] border border-[#00C2E0]/60 shadow-[0_0_60px_rgba(0,194,224,0.25)]">
                <span className="absolute -left-[2px] -top-[2px] h-[48px] w-[48px] border-l-[4px] border-t-[4px] border-[#00C2E0]" />
                <span className="absolute -right-[2px] -top-[2px] h-[48px] w-[48px] border-r-[4px] border-t-[4px] border-[#00C2E0]" />
                <span className="absolute -bottom-[2px] -left-[2px] h-[48px] w-[48px] border-b-[4px] border-l-[4px] border-[#00C2E0]" />
                <span className="absolute -bottom-[2px] -right-[2px] h-[48px] w-[48px] border-b-[4px] border-r-[4px] border-[#00C2E0]" />

                {isScanning && (
                  <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#00C2E0]/60 shadow-[0_0_20px_rgba(0,194,224,0.8)]" />
                )}

                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="rounded-full bg-black/40 px-4 py-2 text-[12px] font-semibold text-[#00C2E0]/80 backdrop-blur-sm">
                      Align CNIC here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status bar */}
            {(ocrStatus || isScanning) && (
              <div className="fixed bottom-[134px] left-1/2 z-[100003] w-[90vw] max-w-[680px] -translate-x-1/2 rounded-[12px] border border-[#26344F] bg-[#0B0E14]/90 px-4 py-3 text-center backdrop-blur-md">
                <p className="text-[11px] font-semibold text-[#DCE6F3]">
                  {ocrStatus || "Hold CNIC steady inside the frame"}
                </p>
                <div className="mt-[8px] h-[6px] overflow-hidden rounded-full bg-[#1A2133]">
                  <div
                    className="h-full rounded-full bg-[#00C2E0] transition-all duration-150"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Capture Button */}
          <div className="fixed bottom-0 left-0 right-0 z-[100004] flex h-[120px] items-center justify-center border-t border-[#1F2937] bg-[#0B0E14] px-4">
            <button
              type="button"
              onClick={onCaptureCnic}
              disabled={isScanning}
              className="h-[56px] w-full max-w-[480px] rounded-[12px] bg-[#00C2E0] text-[14px] font-black uppercase tracking-[0.06em] text-[#071018] shadow-[0_0_30px_rgba(0,194,224,0.4)] transition hover:bg-[#1EE7FF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isScanning ? "⏳ Reading CNIC..." : "📸 Capture CNIC Photo"}
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#00C2E0]">
            Patient ID Scanner
          </p>
          <p className="mt-[10px] text-[12px] font-medium text-[#8B96AA]">
            Position card within the scan frame below
          </p>
        </div>

        {/* Preview box — mock National ID card */}
        <div className="relative mt-[18px] aspect-[1.58/1] w-full overflow-hidden rounded-[10px] border border-[#1A2740] bg-[#0B0E14]">
          <span className="absolute left-0 top-0 z-20 h-[28px] w-[28px] border-l-2 border-t-2 border-[#00C2E0]" />
          <span className="absolute right-0 top-0 z-20 h-[28px] w-[28px] border-r-2 border-t-2 border-[#00C2E0]" />
          <span className="absolute bottom-0 left-0 z-20 h-[28px] w-[28px] border-b-2 border-l-2 border-[#00C2E0]" />
          <span className="absolute bottom-0 right-0 z-20 h-[28px] w-[28px] border-b-2 border-r-2 border-[#00C2E0]" />

          {/* mock card */}
          <div
            className="absolute inset-[16%_10%] rounded-[8px] border"
            style={{ borderColor: "#243651", background: "#0E1526" }}
          >
            <div className="flex h-full flex-col px-[14px] py-[11px]">
              <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[#59657B]">
                National ID Card
              </p>

              {/* photo strip lines */}
              <div className="mt-[10px] flex gap-[6px]">
                {[0, 1, 2, 3].map((n) => (
                  <span key={n} className="h-[9px] flex-1 rounded-[2px] bg-[#243651]" />
                ))}
              </div>

              <p className="mt-[12px] text-[6px] font-black uppercase tracking-[0.12em] text-[#59657B]">
                Patient Name
              </p>

              <div className="mt-[3px] flex items-start justify-between">
                <p className="text-[12px] font-black leading-none text-[#EEF4FC]">
                  Ahmed Hassan
                </p>
                <p className="text-[13px] font-black leading-none text-[#FF5C7A]">
                  B+
                </p>
              </div>

              <p className="mt-[8px] text-[7px] font-medium text-[#8B96AA]">
                DOB: 15-03-1985&nbsp;&nbsp;&nbsp;Blood: B+
              </p>
              <p className="mt-[3px] text-[7px] font-medium text-[#8B96AA]">
                CNIC: 35202-1234567-9
              </p>
            </div>
          </div>
        </div>

        {/* Connected Sensors */}
        <SensorStatusList />

        {/* Status box */}
        <div className="mt-[16px] rounded-[9px] border border-[#252B36] bg-[#0B0E14] px-[14px] py-[12px]">
          <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#59657B]">
            Selected Token
          </p>
          <p className="mt-[7px] text-[13px] font-bold text-[#DCE6F3]">
            {selectedPatient
              ? `${selectedPatient.token} · ${selectedPatient.id}`
              : "Select token from queue first"}
          </p>
          {ocrStatus && (
            <p className="mt-[8px] text-[10px] font-semibold leading-[15px] text-[#00C2E0]">
              {ocrStatus}
            </p>
          )}
          {cameraError && (
            <p className="mt-[8px] text-[10px] font-semibold leading-[15px] text-[#FF5C7A]">
              {cameraError}
            </p>
          )}
        </div>

        {/* Scan Progress */}
        <div className="mt-[20px]">
          <div className="mb-[7px] flex items-center justify-between text-[10px] font-medium">
            <span className="text-[#8B96AA]">
              Scan Progress <span className="text-[#59657B]">—</span> {scanProgress}% Complete
            </span>
          </div>
          <div className="h-[8px] overflow-hidden rounded-full border border-[#26344F] bg-[#0B0E14]">
            <div
              className="h-full rounded-full bg-[#00C2E0] transition-all duration-150 ease-linear"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-auto pt-[20px] space-y-[10px]">
          {/* Camera button */}
          <button
            type="button"
            onClick={onBeginScan}
            disabled={!selectedPatient || isScanning || cameraOpen}
            className="flex h-[43px] w-full items-center justify-center gap-[8px] rounded-[8px] bg-[#00C2E0] text-[11px] font-black uppercase text-[#071018] transition hover:bg-[#1EE7FF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cameraOpen
              ? "📷 Camera Active..."
              : isScanning
              ? "⏳ Processing CNIC..."
              : "▶  Begin Scan Session"}
          </button>

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedPatient || isScanning || cameraOpen}
            className="flex h-[43px] w-full items-center justify-center gap-[8px] rounded-[8px] border border-[#00C2E0] bg-transparent text-[11px] font-black uppercase text-[#00C2E0] transition hover:bg-[#00C2E0]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            📁 Upload CNIC Photo from System
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUrl = ev.target?.result;
                if (dataUrl) onUploadCnic(dataUrl);
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />

          {!selectedPatient && (
            <p className="text-center text-[10px] font-medium text-[#64748B]">
              Select a patient token from the queue to start.
            </p>
          )}
        </div>
      </div>

      {cameraModal}
    </>
  );
}

export default ScannerPanel;