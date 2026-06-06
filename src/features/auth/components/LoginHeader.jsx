import { assetPaths } from "../../../shared/constants/assetPaths";

export function LoginHeader({ brand, visual }) {
  return (
    <div className="relative z-10 max-w-[560px]">
      <div className="mb-16">
        <div className="flex items-end gap-2">
          <img
            src={assetPaths.brand.logo}
            alt={brand.name}
            className="block h-[34px] w-auto max-w-[210px] object-contain"
          />

          <img
            src={assetPaths.brand.aiMark}
            alt="AI"
            className="block h-[34px] w-auto max-w-[72px] object-contain"
          />
        </div>

        <p className="mt-3 text-[13px] font-extrabold uppercase tracking-[0.18em] text-clinic-heading">
          {brand.subtitle}
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-full border border-clinic-primary/20 bg-clinic-primary/10 px-4 py-2">
        <span className="text-[13px] font-extrabold text-clinic-primary">
          {visual.badge}
        </span>
      </div>

      <h1 className="max-w-[560px] text-[54px] font-black leading-[0.98] tracking-[-0.07em] text-clinic-heading xl:text-[68px]">
        {visual.title}
      </h1>

      <p className="mt-7 max-w-[500px] text-[16px] font-medium leading-[1.85] tracking-[-0.02em] text-clinic-muted xl:text-[17px]">
        {visual.description}
      </p>
    </div>
  );
}