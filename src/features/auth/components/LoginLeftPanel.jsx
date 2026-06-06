import { LoginBrand } from "./LoginBrand";
import { MedicalIllustrationCard } from "./MedicalIllustrationCard";
import { LoginFeatureList } from "./LoginFeatureList";

export function LoginLeftPanel({ brand, content }) {
  return (
    <aside className="relative hidden min-h-screen w-[426px] shrink-0 overflow-hidden border-r border-[#1A2740] bg-[#070B15] lg:block">
      {/* subtle grid only inside this left section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(35,48,76,0.23)_1px,transparent_1px),linear-gradient(90deg,rgba(35,48,76,0.23)_1px,transparent_1px)] bg-[size:70px_70px]"
      />

      {/* one teal circle behind logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-118px] top-[-105px] h-[350px] w-[350px] rounded-full bg-[#0D3748]/45"
      />

      {/* one purple circle behind feature cards */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[74px] top-[423px] h-[265px] w-[265px] rounded-full bg-[#252849]/70"
      />

      <div className="relative z-10">
        {/* logo */}
        <div className="absolute left-[44px] top-[39px]">
          <LoginBrand brand={brand} />
        </div>

        {/* medical card - existing component scaled to target size */}
        <div className="absolute left-[47px] top-[115px] origin-top-left scale-[0.785]">
          <MedicalIllustrationCard />
        </div>

        {/* feature cards - existing component scaled/aligned to target size */}
        <div className="absolute left-[47px] top-[435px] origin-top-left scale-[0.785]">
          <LoginFeatureList features={content.features} />
        </div>
      </div>
    </aside>
  );
}