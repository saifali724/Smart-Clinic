// src/features/idScanner/components/SensorStatusList.jsx

import { connectedSensors } from "../data/idScannerContent";

export function SensorStatusList() {
  return (
    <div className="mt-[26px]">
      <p className="text-[10px] font-bold uppercase leading-[12px] text-[#596685]">
        Connected Sensors
      </p>

      <div className="mt-[10px] space-y-[12px]">
        {connectedSensors.map((sensor, i) => (
          <div
            key={sensor.name}
            style={{ animationDelay: `${380 + i * 70}ms` }}
            className="s-up flex h-[42px] items-center justify-between rounded-[10px] border border-[#2E3852] bg-[#0C0F18] pl-[13px] pr-[39px]"
          >
            <div className="flex items-center gap-[10px]">
              <span
                className={`h-[8px] w-[8px] rounded-full ${sensor.online ? "s-blink " : ""}${
                  sensor.online ? "bg-[#32E293]" : "bg-[#FF6060]"
                }`}
              />
              <span className="text-[13px] font-medium leading-none text-[#EDF2FC]">
                {sensor.name}
              </span>
            </div>

            <span
              className={`text-[12px] font-normal leading-none ${
                sensor.online ? "text-[#32E293]" : "text-[#FF6060]"
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