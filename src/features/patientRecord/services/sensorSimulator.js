// src/features/patientRecord/services/sensorSimulator.js
//
// FOR TESTING ONLY — until the real sensors are connected.
// Works only while running `npm run dev`, and only when you open the page with
// ?simulate=1 in the address bar, e.g.  http://localhost:5173/patientrecord?simulate=1
//
// It writes readings into the SAME Firestore document the real sensors will use,
// so you can see the whole live pipeline working. It never runs in a real build.

import { writeVitalReading } from "./vitalsService";

const round = (n, d = 0) => Number(n.toFixed(d));
const drift = (base, spread) => base + (Math.random() - 0.5) * 2 * spread;

export function startSensorSimulation(patientId) {
  const steps = [
    () => writeVitalReading(patientId, "bloodPressure", {
      systolic: round(drift(138, 6)),
      diastolic: round(drift(86, 4)),
    }),
    () => writeVitalReading(patientId, "heartRate", { value: round(drift(78, 5)) }),
    () => writeVitalReading(patientId, "glucose", { value: round(drift(124, 6)) }),
    () => writeVitalReading(patientId, "spo2", { value: round(drift(97, 1.5)) }),
    () => writeVitalReading(patientId, "temperature", { value: round(drift(98.6, 0.4), 1) }),
    () => writeVitalReading(patientId, "weight", { value: round(drift(82, 0.3), 1) }),
    () => writeVitalReading(patientId, "height", { value: 176 }),
  ];

  let i = 0;
  const timer = setInterval(() => {
    steps[i % steps.length]().catch((err) => console.warn("Simulator write failed:", err));
    i += 1;
  }, 700);

  return () => clearInterval(timer);
}
