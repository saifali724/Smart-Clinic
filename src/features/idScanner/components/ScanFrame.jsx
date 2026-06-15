// src/features/idScanner/components/ScanFrame.jsx

export function ScanFrame({
  videoRef,
  canvasRef,
  cameraOpen,
  cameraError,
  isScanning,
  selectedPatient,
}) {
  return (
    <div className="relative mt-[18px] aspect-[1.58/1] w-full overflow-hidden rounded-[10px] bg-[#0B0E14]">
      <span className="absolute left-0 top-0 z-20 h-[28px] w-[28px] border-l-2 border-t-2 border-[#00C2E0]" />
      <span className="absolute right-0 top-0 z-20 h-[28px] w-[28px] border-r-2 border-t-2 border-[#00C2E0]" />
      <span className="absolute bottom-0 left-0 z-20 h-[28px] w-[28px] border-b-2 border-l-2 border-[#00C2E0]" />
      <span className="absolute bottom-0 right-0 z-20 h-[28px] w-[28px] border-b-2 border-r-2 border-[#00C2E0]" />

      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover ${
          cameraOpen ? "block" : "hidden"
        }`}
        autoPlay
        playsInline
        muted
      />

      <canvas ref={canvasRef} className="hidden" />

      {!cameraOpen && (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <div className="mb-4 flex h-[54px] w-[54px] items-center justify-center rounded-full border border-[#00C2E0]/45 bg-[#00C2E0]/10 text-[25px] text-[#00C2E0]">
            ▣
          </div>

          <p className="text-[14px] font-black text-[#DCE6F3]">
            Camera ready for CNIC scan
          </p>

          <p className="mt-2 text-[12px] font-medium text-[#64748B]">
            {selectedPatient
              ? "Click BEGIN SCAN SESSION to open camera"
              : "Select a patient token first"}
          </p>

          {cameraError && (
            <p className="mt-3 max-w-[260px] text-[11px] font-semibold text-[#FF5C7A]">
              {cameraError}
            </p>
          )}
        </div>
      )}

      {cameraOpen && (
        <>
          <div className="absolute inset-x-[12%] top-[24%] z-10 h-[52%] rounded-[10px] border border-[#00C2E0]/55 shadow-[0_0_24px_rgba(0,194,224,0.24)]" />

          <div className="absolute bottom-[14px] left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#00C2E0]/40 bg-[#0B0E14]/80 px-[14px] py-[6px] text-[10px] font-black uppercase tracking-[0.08em] text-[#00C2E0]">
            Align CNIC inside frame
          </div>
        </>
      )}

      {isScanning && (
        <div className="absolute left-0 right-0 top-1/2 z-30 h-[8px] bg-[#00C2E0]/25 shadow-[0_0_24px_rgba(0,194,224,1)]" />
      )}
    </div>
  );
}

export default ScanFrame;