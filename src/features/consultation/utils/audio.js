// src/features/consultation/utils/audio.js
// Turns a recorded clip (webm/ogg from the browser) into a small 16 kHz mono WAV,
// which Gemini accepts, and measures how loud it was (to skip silent clips).

const TARGET_RATE = 16000;

export function pickRecorderMime() {
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return options.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || "";
}

export function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset, text) => [...text].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));

  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

/** recorded Blob → { wav: Blob, rms: number (0–1), seconds } */
export async function toWav16k(blob) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  let decoded;
  try {
    decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
  } finally {
    ctx.close();
  }

  const length = Math.max(1, Math.ceil(decoded.duration * TARGET_RATE));
  const offline = new OfflineAudioContext(1, length, TARGET_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  const samples = rendered.getChannelData(0);

  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
  const rms = Math.sqrt(sum / samples.length);

  return { wav: encodeWav(samples, TARGET_RATE), rms, seconds: decoded.duration };
}

/** "00:14:32" */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}
