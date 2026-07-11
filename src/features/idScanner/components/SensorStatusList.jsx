// src/features/idScanner/components/SensorStatusList.jsx

import { connectedSensors } from "../data/idScannerContent";

export function SensorStatusList() {
  return (
    <div className="mt-[26px]">
      <p className="mb-[12px] text-[9px] font-black uppercase tracking-[0.1em] text-[#59657B]">
        Connected Sensors
      </p>

      <div className="space-y-[9px]">
        {connectedSensors.map((sensor) => (
          <div
            key={sensor.name}
            className="flex h-[44px] items-center justify-between rounded-[9px] border border-[#1E2A3E] bg-[#0B0E14] px-[14px]"
          >
            <div className="flex items-center gap-[10px]">
              <span
                className={`h-[7px] w-[7px] rounded-full ${
                  sensor.online
                    ? "bg-[#3CF3A7] shadow-[0_0_10px_rgba(60,243,167,0.8)]"
                    : "bg-[#FF5C7A] shadow-[0_0_10px_rgba(255,92,122,0.8)]"
                }`}
              />
              <span className="text-[12px] font-semibold text-[#DCE6F3]">
                {sensor.name}
              </span>
            </div>

            <span
              className={`text-[11px] font-bold ${
                sensor.online ? "text-[#3CF3A7]" : "text-[#FF5C7A]"
              }`}
            >
              {sensor.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SensorStatusList;