import { assetPaths } from "../../constants/assetPaths";

export function DecorativeLayer() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <img
        src={assetPaths.designLines.loginBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />

      <img
        src={assetPaths.designLines.loginOrbit}
        alt=""
        className="absolute right-[-120px] top-[-120px] h-[560px] w-[560px] opacity-30"
      />

      <div className="absolute left-[-150px] top-[120px] h-[420px] w-[420px] rounded-full bg-clinic-primary/20 blur-[130px]" />
      <div className="absolute bottom-[-160px] right-[80px] h-[460px] w-[460px] rounded-full bg-clinic-blue/20 blur-[140px]" />
      <div className="absolute left-[42%] top-[20%] h-[240px] w-[240px] rounded-full bg-clinic-cyan/10 blur-[110px]" />
    </div>
  );
}