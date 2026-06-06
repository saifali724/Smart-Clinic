import { assetPaths } from "../../../shared/constants/assetPaths";

export function LoginVisualPanel({ stats }) {
  return (
    <div className="pointer-events-none absolute bottom-8 left-0 z-10 hidden w-full max-w-[560px] xl:block">
      <div className="relative overflow-hidden rounded-[34px] border border-clinic-border/80 bg-clinic-panel/70 p-5 shadow-loginCard backdrop-blur-2xl">
        <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-clinic-primary/20 blur-3xl" />

        <div className="relative overflow-hidden rounded-[28px] border border-clinic-border bg-clinic-card/80 p-6">
          <img
            src={assetPaths.illustrations.loginMedicalVisual}
            alt=""
            className="mx-auto h-[230px] w-full object-contain"
          />

          <div className="mt-6 grid grid-cols-3 gap-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] border border-clinic-border bg-clinic-panel/80 p-4"
              >
                <p className="text-[24px] font-black tracking-[-0.04em] text-clinic-primary">
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] font-bold text-clinic-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}