// src/features/consultation/components/MicSetup.jsx
// Start screen: 1 microphone (AI decides who spoke) or 2 microphones (doctor mic + patient mic).
// In 2-mic mode each mic shows a live level bar, so you can check the right person is on the right mic.

import { useEffect, useRef, useState } from "react";

function MicLevel({ deviceId, color }) {
  const barRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!deviceId) return undefined;
    let stream;
    let ctx;
    let raf;
    let stopped = false;
    navigator.mediaDevices
      .getUserMedia({ audio: { deviceId: { exact: deviceId }, autoGainControl: false, echoCancellation: false } })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(s).connect(analyser);
        const data = new Uint8Array(512);
        const tick = () => {
          raf = requestAnimationFrame(tick);
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i += 1) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const level = Math.min(1, Math.sqrt(sum / data.length) * 8);
          if (barRef.current) barRef.current.style.width = `${Math.max(3, level * 100)}%`;
        };
        tick();
      })
      .catch(() => setFailed(true));
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close().catch(() => {});
    };
  }, [deviceId]);

  if (failed) return <p className="mt-[4px] text-[10px] text-[#FF8A8A]">This microphone can't be opened</p>;
  return (
    <div className="mt-[6px] h-[6px] w-full overflow-hidden rounded-full bg-[#2E3852]">
      <div ref={barRef} className="h-full rounded-full transition-[width] duration-75" style={{ width: "3%", backgroundColor: color }} />
    </div>
  );
}

function MicSelect({ label, color, value, onChange, devices }) {
  return (
    <label className="block text-left">
      <span className="text-[10px] font-bold uppercase tracking-[0.04em]" style={{ color }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-[4px] h-[34px] w-full truncate rounded-[8px] border border-[#2E3852] bg-[#0C0F18] px-[8px] text-[12px] text-[#EDF2FC] outline-none focus:border-[#00BFD8]"
      >
        <option value="">Choose microphone…</option>
        {devices.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
      {value && <MicLevel deviceId={value} color={color} />}
    </label>
  );
}

export function MicSetup({ mic }) {
  const dual = mic.mode === "dual";
  const needsPermission = mic.devices.length === 0 || mic.devices.every((d) => /^Microphone \d+$/.test(d.label));
  const same = dual && mic.doctorId && mic.doctorId === mic.patientId;

  return (
    <div className="mt-[14px] text-left">
      <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-[#2E3852] text-[11px] font-semibold">
        {[
          { id: "single", label: "1 microphone" },
          { id: "dual", label: "2 microphones" },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => mic.setMode(m.id)}
            className={`h-[32px] transition ${mic.mode === m.id ? "bg-[#00BFD8] text-[#0C0F18]" : "text-[#8C99B8] hover:text-[#EDF2FC]"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-[6px] text-[10px] leading-[14px] text-[#596685]">
        {dual
          ? "Doctor and patient each wear their own mic — the speaker label comes from the mic, not from AI."
          : "One mic for both — AI decides who is speaking (tap a name in the transcript to correct it)."}
      </p>

      {dual && (
        <div className="mt-[10px] space-y-[10px] rounded-[10px] border border-[#2E3852] bg-[#0C0F18] p-[10px]">
          {needsPermission ? (
            <button
              type="button"
              onClick={() => mic.loadDevices(true)}
              className="h-[34px] w-full rounded-[8px] border border-[#00BFD8] text-[12px] font-semibold text-[#00BFD8] hover:bg-[#00BFD8]/10"
            >
              Allow microphones to list them
            </button>
          ) : (
            <>
              <MicSelect label="Doctor mic" color="#936AFF" value={mic.doctorId} onChange={mic.setDoctorId} devices={mic.devices} />
              <MicSelect label="Patient mic" color="#00BFD8" value={mic.patientId} onChange={mic.setPatientId} devices={mic.devices} />
              {same ? (
                <p className="text-[10px] text-[#FF8A8A]">Choose two different microphones.</p>
              ) : (
                <p className="text-[10px] leading-[14px] text-[#596685]">
                  Test: ask the doctor to speak — the purple bar should move most. Then the patient — the cyan bar.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MicSetup;
