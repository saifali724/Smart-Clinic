// src/features/idScanner/components/ScannerPanel.jsx

import { useRef } from "react";
import { createPortal } from "react-dom";
import SensorStatusList from "./SensorStatusList";

// The scan box is drawn on a 400×270 canvas (Figma). Everything inside is sized in
// "cqw" (1cqw = 1% of the box width), so at 400px wide it is pixel-exact and on a
// phone it shrinks proportionally instead of overflowing.
const cq = (px) => `${px / 4}cqw`;

// Corner bracket bars (Figma: 30x3 and 3x30, radius 2) — kept in px so they stay crisp.
// The box has a 2px border, so -2px puts them exactly on the outer edge.
// anim: which way each bar "draws" when the screen opens
const corners = [
  { pos: "left-[-2px] top-[-2px] h-[3px] w-[30px]", anim: "s-corner-x", origin: "left" },
  { pos: "left-[-2px] top-[-2px] h-[30px] w-[3px]", anim: "s-corner-y", origin: "top" },
  { pos: "right-[-2px] top-[-2px] h-[3px] w-[30px]", anim: "s-corner-x", origin: "right" },
  { pos: "right-[-2px] top-[-2px] h-[30px] w-[3px]", anim: "s-corner-y", origin: "top" },
  { pos: "bottom-[-2px] left-[-2px] h-[3px] w-[30px]", anim: "s-corner-x", origin: "left" },
  { pos: "bottom-[-2px] left-[-2px] h-[30px] w-[3px]", anim: "s-corner-y", origin: "bottom" },
  { pos: "bottom-[-2px] right-[-2px] h-[3px] w-[30px]", anim: "s-corner-x", origin: "right" },
  { pos: "bottom-[-2px] right-[-2px] h-[30px] w-[3px]", anim: "s-corner-y", origin: "bottom" },
];

function CardText({ x, y, size, weight = 400, color, children, pre = false }) {
  return (
    <p
      className={`absolute leading-[1.2] ${pre ? "whitespace-pre" : "whitespace-nowrap"}`}
      style={{ left: cq(x), top: cq(y), fontSize: cq(size), fontWeight: weight, color }}
    >
      {children}
    </p>
  );
}

function ScanBox() {
  return (
    <div
      className="s-box relative mx-auto mt-[18px] aspect-[400/270] w-full max-w-[400px] shrink-0 rounded-[16px] border-2 border-[#00BFD8] bg-[#1A1F2E]"
      style={{ containerType: "inline-size" }}
    >
      {corners.map((c) => (
        <span
          key={c.pos}
          className={`${c.anim} absolute z-20 rounded-[2px] bg-[#00BFD8] ${c.pos}`}
          style={{ "--o": c.origin, animationDelay: "520ms" }}
        />
      ))}

      {/* Sample national ID card (300×190 at 48,34) */}
      <div
        className="s-pop absolute overflow-hidden rounded-[12px] border border-[#2E3852] bg-[#0C0F18]"
        style={{ left: cq(48), top: cq(34), width: cq(300), height: cq(190), animationDelay: "380ms" }}
      >
        <span
          className="absolute inset-x-0 bg-[#00BFD8]/50"
          style={{ top: cq(39), height: cq(5) }}
        />
        <CardText x={15} y={9} size={9} weight={700} color="#596685">NATIONAL ID CARD</CardText>
        <CardText x={15} y={55} size={13} weight={700} color="#EDF2FC">████ ████ ████ ████</CardText>
        <CardText x={15} y={83} size={8} color="#596685">PATIENT NAME</CardText>
        <CardText x={15} y={97} size={14} weight={600} color="#EDF2FC">Ahmed Hassan</CardText>
        <CardText x={15} y={119} size={10} color="#8C99B8" pre>{"DOB: 15-03-1985   Blood: B+"}</CardText>
        <CardText x={15} y={139} size={10} color="#8C99B8">CNIC: 35202-1234567-9</CardText>
        <CardText x={253} y={95} size={20} weight={700} color="#FF6060">B+</CardText>
      </div>

      {/* Scan line + glow — rests where Figma puts it, then sweeps over the card */}
      <span className="s-sweep absolute z-10" style={{ left: cq(18), top: cq(126), width: cq(360), height: cq(14) }}>
        <span className="absolute inset-0 rounded-[2px] bg-[#00BFD8]/[0.08]" />
        <span
          className="absolute inset-x-0 h-[2px] rounded-[1px] bg-[#00BFD8]/90 shadow-[0_0_10px_rgba(0,191,216,0.7)]"
          style={{ top: cq(6) }}
        />
      </span>
    </div>
  );
}

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
  const actionsDisabled = !selectedPatient || isScanning || cameraOpen;

  // Full-screen camera view (unchanged behaviour, colours matched to the design)
  const cameraModal = cameraOpen
    ? createPortal(
        <div className="fixed inset-0 z-[99999] bg-black font-sans text-white">
          <div className="fixed left-0 right-0 top-0 z-[100002] flex h-[64px] items-center justify-between gap-[12px] bg-[#141824] px-[16px] sm:px-[36px]">
            <div>
              <p className="text-[11px] font-bold uppercase leading-none text-[#00BFD8]">
                CNIC Camera Scanner
              </p>
              <p className="mt-[8px] hidden text-[13px] font-normal leading-none text-[#8C99B8] sm:block">
                Place the CNIC inside the frame, then tap Capture
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseCamera}
              disabled={isScanning}
              className="rounded-[10px] border border-[#2E3852] bg-[#0C0F18] px-[14px] py-[9px] text-[11px] font-bold uppercase text-[#8C99B8] transition hover:border-[#FF6060] hover:text-[#FF6060] disabled:opacity-40"
            >
              ✕ Close
            </button>
          </div>

          <div className="fixed inset-0 bg-black pb-[120px] pt-[64px]">
            <video
              ref={videoRef}
              className="h-full w-full bg-black object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 pb-[120px] pt-[64px]">
              <div className="relative aspect-[1.58/1] w-[90vw] max-w-[900px] rounded-[16px] border-2 border-[#00BFD8]">
                {isScanning ? (
                  <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#00BFD8]/90" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="rounded-full bg-black/50 px-4 py-2 text-[12px] font-semibold text-[#00BFD8]">
                      Align CNIC here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(ocrStatus || isScanning) && (
              <div className="fixed bottom-[134px] left-1/2 z-[100003] w-[90vw] max-w-[680px] -translate-x-1/2 rounded-[14px] border border-[#2E3852] bg-[#141824]/95 px-4 py-3 text-center">
                <p className="text-[12px] font-medium text-[#EDF2FC]">
                  {ocrStatus || "Hold CNIC steady inside the frame"}
                </p>
                <div className="relative mt-[8px] h-[10px] rounded-[5px] bg-[#1A1F2E] shadow-[inset_0_0_0_1px_#2E3852]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-[5px] bg-[#00BFD8] transition-all duration-150"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-[100004] flex h-[120px] items-center justify-center bg-[#141824] px-4">
            <button
              type="button"
              onClick={onCaptureCnic}
              disabled={isScanning}
              className="h-[52px] w-full max-w-[400px] rounded-[14px] bg-[#00BFD8] text-[14px] font-bold uppercase text-[#0C0F18] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isScanning ? "Reading CNIC..." : "Capture CNIC Photo"}
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  // One status line shown above the progress bar
  let statusText = "Select a patient from the queue to start.";
  let statusColor = "text-[#596685]";
  if (cameraError) {
    statusText = cameraError;
    statusColor = "text-[#FF6060]";
  } else if (ocrStatus) {
    statusText = ocrStatus;
    statusColor = "text-[#00BFD8]";
  } else if (selectedPatient) {
    statusText = `Selected: ${selectedPatient.token}  ·  ${selectedPatient.id}`;
    statusColor = "text-[#8C99B8]";
  }

  return (
    <>
      <div className="flex h-full flex-col" id="scanner-panel">
        <p className="s-up text-center text-[11px] font-bold uppercase leading-[13px] text-[#00BFD8]" style={{ animationDelay: "150ms" }}>
          Patient ID Scanner
        </p>
        <p className="s-up mt-[9px] text-center text-[13px] font-normal leading-[16px] text-[#8C99B8]" style={{ animationDelay: "190ms" }}>
          Position card within the scan frame below
        </p>

        <ScanBox />

        <SensorStatusList />

        <div className="s-up mt-auto pt-[24px]" style={{ animationDelay: "520ms" }}>
          <p key={statusText} className={`s-up mb-[12px] whitespace-pre-wrap text-[12px] font-medium leading-[15px] ${statusColor}`}>
            {statusText}
          </p>

          <p className="whitespace-pre text-[12px] font-normal leading-[15px] text-[#8C99B8]">
            {`Scan Progress  —  ${scanProgress}% Complete`}
          </p>
          <div className="relative mt-[3px] h-[10px] rounded-[5px] bg-[#1A1F2E] shadow-[inset_0_0_0_1px_#2E3852]">
            <div
              className="absolute inset-y-0 left-0 rounded-[5px] bg-[#00BFD8] transition-all duration-150 ease-linear"
              style={{ width: `${scanProgress}%` }}
            />
          </div>

          <button
            type="button"
            onClick={onBeginScan}
            disabled={actionsDisabled}
            className={`${actionsDisabled ? "" : "s-ready "}mt-[20px] flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#00BFD8] text-[14px] font-bold leading-none text-[#0C0F18] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span className="whitespace-pre">
              {cameraOpen
                ? "CAMERA ACTIVE..."
                : isScanning
                ? "PROCESSING CNIC..."
                : "▶   BEGIN SCAN SESSION"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={actionsDisabled}
            className="mx-auto mt-[14px] block text-[12px] font-medium leading-[15px] text-[#00BFD8] underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            or upload a CNIC photo instead
          </button>

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
        </div>
      </div>

      {cameraModal}
    </>
  );
}

export default ScannerPanel;