// src/features/consultation/components/DoctorPanel.jsx
// Left column (Figma 380×796): doctor video, patient tile, mic/cam, live audio bars,
// real-time AI insights, quick actions.

import { withDrPrefix } from "../../patientRecord/utils/format";
import { AlertIcon, BulbIcon, CamIcon, ChartIcon, CheckIcon, DoctorIcon, MicIcon, PatientIcon, WarningIcon } from "./Icons";

const INSIGHT_STYLE = {
  critical: { color: "#FF6060", Icon: AlertIcon },
  warning: { color: "#FF9E3D", Icon: WarningIcon },
  suggestion: { color: "#00BFD8", Icon: BulbIcon },
  ok: { color: "#32E293", Icon: CheckIcon },
  pattern: { color: "#936AFF", Icon: ChartIcon },
};

const Title = ({ children, color = "#00BFD8", className = "" }) => (
  <p className={`text-[10px] font-bold uppercase leading-[12px] ${className}`} style={{ color }}>
    {children}
  </p>
);

export function DoctorPanel({ c, videoRef }) {
  const live = c.status === "running";
  const dual = c.mic?.mode === "dual";
  // 2 mics: we know exactly who is talking; 1 mic: any voice lights the doctor tile (as before)
  const doctorTalking = live && (dual ? c.activeSpeaker === "doctor" : c.speaking);
  const patientTalking = live && dual && c.activeSpeaker === "patient";
  const insights = c.analysis?.insights || [];

  return (
    <section style={{ animationDelay: "60ms" }} className="m-left flex min-h-0 flex-col rounded-[20px] border border-[#2E3852] bg-[#141824] px-[16px] pb-[16px] pt-[22px] sm:px-[19px] xl:h-full xl:pb-[7px] xl:pt-[27px]">
      <Title>Doctor Interface</Title>

      {/* doctor tile 340×200 */}
      <div className="relative mt-[12px] aspect-[340/200] w-full overflow-hidden rounded-[16px] border-2 border-[#936AFF] bg-[#1A1F2E] xl:aspect-auto xl:h-[200px] xl:shrink-0">
        {c.camOn && <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full scale-x-[-1] object-cover" />}
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${c.camOn ? "bg-gradient-to-t from-black/70 via-transparent to-transparent justify-end pb-[14px]" : ""}`}>
          {!c.camOn && (
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#936AFF]/15 text-[#936AFF]">
              <DoctorIcon size={30} />
            </span>
          )}
          <p className="mt-[10px] text-[13px] font-semibold leading-[16px] text-[#EDF2FC]">
            {c.doctor?.fullName ? withDrPrefix(c.doctor.fullName) : "Doctor"}
          </p>
          <p
            className="mt-[4px] flex items-center gap-[5px] text-[11px] font-normal leading-[13px]"
            style={{ color: doctorTalking ? "#32E293" : "#596685" }}
          >
            <span className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: doctorTalking ? "#32E293" : "#596685" }} />
            {live ? (doctorTalking ? "Speaking" : "Listening") : c.status === "paused" ? "Mic paused" : "Not recording"}
          </p>
        </div>
      </div>

      {/* patient tile 160×110 + controls 168×110 */}
      <div className="mt-[16px] grid shrink-0 grid-cols-[160fr_168fr] gap-[12px]">
        <div
          className="flex h-[110px] flex-col items-center justify-center rounded-[12px] border border-[#00BFD8] bg-[#1A1F2E] px-[6px] transition-shadow"
          style={{ boxShadow: patientTalking ? "0 0 0 2px rgba(0,191,216,0.35)" : "none" }}
        >
          <span style={{ color: patientTalking ? "#00BFD8" : "#8C99B8" }}><PatientIcon size={30} /></span>
          <p className="mt-[8px] w-full truncate text-center text-[11px] font-normal leading-[13px] text-[#8C99B8]">{c.patientName}</p>
          {dual && live && (
            <p className="mt-[3px] flex items-center gap-[4px] text-[10px] leading-[12px]" style={{ color: patientTalking ? "#32E293" : "#596685" }}>
              <span className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: patientTalking ? "#32E293" : "#596685" }} />
              {patientTalking ? "Speaking" : "Listening"}
            </p>
          )}
        </div>
        <div className="flex h-[110px] items-center justify-around rounded-[12px] border border-[#2E3852] bg-[#1A1F2E] px-[10px]">
          <button
            type="button"
            onClick={c.toggleMic}
            disabled={c.status !== "running" && c.status !== "paused"}
            className="flex flex-col items-center gap-[7px] rounded-[10px] px-[8px] py-[6px] transition hover:bg-white/5 disabled:opacity-40"
            style={{ color: c.status === "paused" ? "#FF6060" : "#32E293" }}
          >
            <MicIcon size={20} off={c.status === "paused"} />
            <span className="text-[11px] leading-[13px]">{c.status === "paused" ? "Mic Off" : "Mic On"}</span>
          </button>
          <button
            type="button"
            onClick={c.toggleCam}
            className="flex flex-col items-center gap-[7px] rounded-[10px] px-[8px] py-[6px] transition hover:bg-white/5"
            style={{ color: c.camOn ? "#00BFD8" : "#596685" }}
          >
            <CamIcon size={20} off={!c.camOn} />
            <span className="text-[11px] leading-[13px]">{c.camOn ? "Cam On" : "Cam Off"}</span>
          </button>
        </div>
      </div>

      {/* live audio bars */}
      <Title className="mt-[22px]">AI Audio Capture</Title>
      <div className="mt-[8px] flex h-[56px] shrink-0 items-center justify-center gap-[4px] overflow-hidden rounded-[12px] border border-[#2E3852] bg-[#1A1F2E] px-[10px]">
        {c.levels.map((v, i) => (
          <span
            key={i}
            className="w-[6px] shrink-0 rounded-[2px] transition-[height] duration-75"
            style={{
              height: `${Math.max(4, Math.round(v * 52))}px`,
              backgroundColor: i < 23 ? "#32E293" : "#00BFD8",
              opacity: live ? 1 : 0.35,
            }}
          />
        ))}
      </div>

      {/* insights */}
      <Title color="#936AFF" className="mt-[22px]">Real-time AI Insights</Title>
      <div className="mt-[10px] min-h-0 space-y-[12px] xl:flex-1 xl:overflow-y-auto">
        {insights.length === 0 ? (
          <div className="flex min-h-[40px] items-center rounded-[10px] border border-[#2E3852] bg-[#1A1F2E] px-[16px] py-[8px] text-[11px] font-medium leading-[14px] text-[#596685]">
            {c.status === "idle" ? "Insights appear once the session starts" : c.isAnalyzing ? "Analysing…" : "No alerts yet"}
          </div>
        ) : (
          insights.map((ins, i) => {
            const { color, Icon } = INSIGHT_STYLE[ins.type] || INSIGHT_STYLE.suggestion;
            return (
              <div
                key={ins.text}
                className="c-bubble-in flex min-h-[40px] items-center gap-[8px] rounded-[10px] border bg-[#1A1F2E] px-[16px] py-[8px]"
                style={{ borderColor: color, color, animationDelay: `${i * 60}ms` }}
              >
                <Icon size={13} className="shrink-0" />
                <p className="text-[11px] font-medium leading-[14px]">{ins.text}</p>
              </div>
            );
          })
        )}
      </div>

      {/* quick actions */}
      <Title color="#596685" className="mt-[16px] shrink-0">Quick Actions</Title>
      <div className="m-stagger mt-[6px] grid shrink-0 grid-cols-3 gap-[10px]" style={{ "--m-base": "480ms", "--m-step": "60ms" }}>
        {[
          { id: "ecg", label: "Order ECG", color: "#00BFD8" },
          { id: "labs", label: "Request Labs", color: "#936AFF" },
          { id: "rx", label: "Generate Rx", color: "#32E293" },
        ].map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => c.quickAction(a.id)}
            disabled={c.status === "idle" || c.status === "ending" || c.status === "ended"}
            className="h-[34px] whitespace-nowrap rounded-[10px] border px-[4px] text-[10px] font-semibold leading-none transition hover:brightness-125 disabled:opacity-40 min-[380px]:text-[11px] xl:px-[12px] xl:text-left"
            style={{ borderColor: a.color, color: a.color, backgroundColor: `${a.color}26` }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default DoctorPanel;
