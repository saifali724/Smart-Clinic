// src/features/consultation/utils/dualMic.js
//
// 2-MICROPHONE MODE — one mic for the doctor, one for the patient (collar / lapel mics work best).
//
// Both mics are recorded together, sample by sample, in ONE audio graph (channel 0 = doctor,
// channel 1 = patient), so they are perfectly in sync. Every few seconds the clip is split into
// "turns": at each moment, whoever's mic is louder is the one speaking. The speaker label therefore
// comes from the hardware, not from the AI guessing.

export const SAMPLE_RATE = 16000;

const FRAME = 480; // 30 ms frames at 16 kHz
const ACTIVE_RMS = 0.012; // quieter than this = nobody speaking
const SMOOTH = 5; // ± frames for majority smoothing (~150 ms)
const MIN_TURN_FRAMES = 10; // a turn needs ≥ 300 ms of speech
const MAX_GAP_FRAMES = 27; // pauses up to ~800 ms stay in the same turn
const PAD_BEFORE = Math.round(0.15 * SAMPLE_RATE);
const PAD_AFTER = Math.round(0.25 * SAMPLE_RATE);
const MAX_TURNS = 8;

function rms(data, from, to) {
  let sum = 0;
  for (let i = from; i < to; i += 1) sum += data[i] * data[i];
  return Math.sqrt(sum / Math.max(1, to - from));
}

/**
 * Split one clip into speaker turns.
 * @param doctor  Float32Array — doctor's mic
 * @param patient Float32Array — patient's mic (same length, same time)
 * @returns [{ speaker: "doctor"|"patient", startSec, endSec, samples: Float32Array, rms }]
 */
export function segmentTurns(doctor, patient, rate = SAMPLE_RATE) {
  const n = Math.min(doctor.length, patient.length);
  const frames = Math.floor(n / FRAME);
  if (!frames) return [];

  // 1. loudest mic per frame
  const raw = new Array(frames);
  for (let f = 0; f < frames; f += 1) {
    const d = rms(doctor, f * FRAME, (f + 1) * FRAME);
    const p = rms(patient, f * FRAME, (f + 1) * FRAME);
    raw[f] = Math.max(d, p) < ACTIVE_RMS ? null : d >= p ? "doctor" : "patient";
  }

  // 2. smooth out single-frame flips
  const label = raw.map((l, f) => {
    if (!l) return null;
    let doc = 0;
    let pat = 0;
    for (let k = Math.max(0, f - SMOOTH); k <= Math.min(frames - 1, f + SMOOTH); k += 1) {
      if (raw[k] === "doctor") doc += 1;
      else if (raw[k] === "patient") pat += 1;
    }
    return doc >= pat ? "doctor" : "patient";
  });

  // 3. runs of the same speaker
  const runs = [];
  let cur = null;
  for (let f = 0; f < frames; f += 1) {
    const l = label[f];
    if (l) {
      if (cur && cur.speaker === l && f - cur.last <= MAX_GAP_FRAMES) {
        cur.last = f;
        cur.active += 1;
      } else {
        if (cur) runs.push(cur);
        cur = { speaker: l, first: f, last: f, active: 1 };
      }
    } else if (cur && f - cur.last > MAX_GAP_FRAMES) {
      runs.push(cur);
      cur = null;
    }
  }
  if (cur) runs.push(cur);

  // 4. drop blips, merge neighbours of the same speaker
  const merged = [];
  for (const r of runs.filter((x) => x.active >= MIN_TURN_FRAMES)) {
    const prev = merged[merged.length - 1];
    if (prev && prev.speaker === r.speaker) {
      prev.last = r.last;
      prev.active += r.active;
    } else merged.push({ ...r });
  }
  while (merged.length > MAX_TURNS) {
    // too many tiny turns — fold the shortest into its neighbour
    let shortest = 1;
    for (let i = 1; i < merged.length; i += 1) if (merged[i].active < merged[shortest].active) shortest = i;
    merged[shortest - 1].last = merged[shortest].last;
    merged.splice(shortest, 1);
  }

  // 5. cut each turn from the SPEAKER'S OWN mic (cleanest audio)
  return merged.map((r) => {
    const from = Math.max(0, r.first * FRAME - PAD_BEFORE);
    const to = Math.min(n, (r.last + 1) * FRAME + PAD_AFTER);
    const source = r.speaker === "doctor" ? doctor : patient;
    const samples = source.slice(from, to);
    return { speaker: r.speaker, startSec: from / rate, endSec: to / rate, samples, rms: rms(samples, 0, samples.length) };
  });
}

/** Records two microphones in sync and hands over a clip every `clipMs`. */
export class DualMicRecorder {
  constructor(doctorStream, patientStream) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx({ sampleRate: SAMPLE_RATE });
    this.rate = this.ctx.sampleRate;
    this.doctorChunks = [];
    this.patientChunks = [];
    this.startedAt = Date.now();
    this.levels = { doctor: 0, patient: 0 };

    const merger = this.ctx.createChannelMerger(2);
    this.ctx.createMediaStreamSource(doctorStream).connect(merger, 0, 0);
    this.ctx.createMediaStreamSource(patientStream).connect(merger, 0, 1);

    // ScriptProcessor keeps the code simple and runs in every browser
    this.node = this.ctx.createScriptProcessor(2048, 2, 2);
    this.node.onaudioprocess = (e) => {
      if (!this.recording) return;
      const d = e.inputBuffer.getChannelData(0);
      const p = e.inputBuffer.getChannelData(1);
      this.doctorChunks.push(new Float32Array(d));
      this.patientChunks.push(new Float32Array(p));
      this.levels = { doctor: rms(d, 0, d.length), patient: rms(p, 0, p.length) };
    };
    const mute = this.ctx.createGain();
    mute.gain.value = 0; // nothing is played back
    merger.connect(this.node);
    this.node.connect(mute);
    mute.connect(this.ctx.destination);
  }

  start({ clipMs, onClip }) {
    this.onClip = onClip;
    this.recording = true;
    this.startedAt = Date.now();
    this.ctx.resume?.();
    this.timer = setInterval(() => this.flush(), clipMs);
  }

  flush() {
    const join = (chunks) => {
      const total = chunks.reduce((s, c) => s + c.length, 0);
      const out = new Float32Array(total);
      let o = 0;
      for (const c of chunks) {
        out.set(c, o);
        o += c.length;
      }
      return out;
    };
    const doctor = join(this.doctorChunks);
    const patient = join(this.patientChunks);
    this.doctorChunks = [];
    this.patientChunks = [];
    const startedAt = this.startedAt;
    const endedAt = Date.now();
    this.startedAt = endedAt;
    if (doctor.length && this.onClip) this.onClip({ doctor, patient, rate: this.rate, startedAt, endedAt });
  }

  /** stop recording; the last part is handed over too */
  pause() {
    clearInterval(this.timer);
    if (this.recording) this.flush();
    this.recording = false;
  }

  close() {
    this.pause();
    try {
      this.node.disconnect();
    } catch {
      /* ignore */
    }
    this.ctx.close().catch(() => {});
  }
}

/** linear resample (only used if the browser refused a 16 kHz audio context) */
export function resampleTo16k(samples, rate) {
  if (rate === SAMPLE_RATE) return samples;
  const ratio = rate / SAMPLE_RATE;
  const out = new Float32Array(Math.floor(samples.length / ratio));
  for (let i = 0; i < out.length; i += 1) {
    const x = i * ratio;
    const i0 = Math.floor(x);
    const i1 = Math.min(samples.length - 1, i0 + 1);
    out[i] = samples[i0] + (samples[i1] - samples[i0]) * (x - i0);
  }
  return out;
}
