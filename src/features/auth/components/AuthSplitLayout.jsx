// src/features/auth/components/AuthSplitLayout.jsx
//
// The shared Login-style page: brand panel on the left (laptop and up),
// grid background + top bar + centred card + footer on the right.
// Used by Login and Forgot Password so both look exactly the same.
//
// Responsive:
//   • Phone / tablet (< 1024px): one column — brand + top-bar button, card, footer.
//   • Laptop / desktop (≥ 1024px): left panel (40%, max 580px like Figma) + card on the right.

import { loginContent } from "../data/loginContent";
import { LoginBrand } from "./LoginBrand";
import { MedicalIllustrationCard } from "./MedicalIllustrationCard";
import { LoginFeatureList } from "./LoginFeatureList";
import { AuthFooterLinks } from "./AuthFooterLinks";

export function AuthSplitLayout({ welcomeText, topBarText, topBarButton, onTopBarButton, children }) {
  return (
    <main className="relative flex min-h-screen w-full bg-[#070B15] font-sans text-white">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes shimmerBar {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .anim-fade-up    { animation: fadeSlideUp 0.6s ease both; }
        .anim-fade-left  { animation: fadeSlideLeft 0.6s ease both; }
        .anim-fade-in    { animation: fadeIn 0.6s ease both; }
        .anim-float      { animation: floatCard 4s ease-in-out infinite; }
      `}</style>

      {/* ───────────── LEFT PANEL (laptop and up) ───────────── */}
      <aside className="anim-fade-in relative hidden w-[40%] max-w-[580px] shrink-0 overflow-hidden border-r border-[#1A2740] bg-[#0B1322] lg:block">
        {/* Teal + purple circles */}
        <div className="pointer-events-none absolute left-[-110px] top-[-92px] h-[375px] w-[375px] rounded-full bg-[rgba(13,55,72,0.45)]" />
        <div className="pointer-events-none absolute bottom-[-160px] left-[30px] h-[380px] w-[380px] rounded-full bg-[rgba(22,20,55,0.88)]" />

        {/* sticky so the panel stays in view while a tall form scrolls */}
        <div className="relative z-10 flex min-h-screen flex-col px-[clamp(32px,3.5vw,56px)] py-[clamp(32px,5vh,52px)] lg:sticky lg:top-0 lg:h-screen">
          <div className="anim-fade-up" style={{ animationDelay: "100ms" }}>
            <LoginBrand brand={loginContent.brand} />
          </div>

          {/* Illustration shrinks with the panel height so everything fits without scrolling */}
          <div
            className="anim-fade-up mx-auto mt-[clamp(24px,5vh,64px)] w-full max-w-[min(468px,calc((100vh_-_460px)*1.117))]"
            style={{ animationDelay: "200ms" }}
          >
            <div className="anim-float">
              <MedicalIllustrationCard />
            </div>
          </div>

          <div className="anim-fade-up mt-auto pt-[24px]" style={{ animationDelay: "350ms" }}>
            <LoginFeatureList features={loginContent.leftPanel.features} />
          </div>
        </div>
      </aside>

      {/* ───────────── RIGHT SIDE (always visible) ───────────── */}
      <section className="relative flex min-w-0 flex-1 flex-col">
        {/* grid background */}
        <div className="anim-fade-in pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(35,48,76,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(35,48,76,0.34)_1px,transparent_1px)] bg-[size:70px_70px]" />

        {/* Top bar */}
        <header
          className="anim-fade-in relative z-10 flex items-center justify-between gap-[12px] px-[16px] pt-[20px] sm:px-[32px] sm:pt-[32px] xl:px-[60px] xl:pt-[44px]"
          style={{ animationDelay: "300ms" }}
        >
          {/* brand only on small screens (the left panel shows it on desktop) */}
          <div className="lg:hidden">
            <LoginBrand brand={loginContent.brand} />
          </div>

          <p className="hidden text-[13px] font-medium leading-none text-[#8794A9] lg:block">
            {welcomeText}
          </p>

          <div className="flex items-center gap-[10px] sm:gap-[12px]">
            <span className="hidden text-[12px] font-medium leading-none text-[#9AA5B7] sm:inline">
              {topBarText}
            </span>
            <button
              type="button"
              onClick={onTopBarButton}
              className="h-[32px] rounded-[8px] border border-[#08CFE8] bg-transparent px-[16px] text-[12px] font-bold leading-none text-[#08D4E9] transition-all duration-300 hover:bg-[#08CFE8]/10 hover:shadow-[0_0_12px_rgba(8,207,232,0.3)]"
            >
              {topBarButton}
            </button>
          </div>
        </header>

        {/* Card — centred, max 660px wide like Figma */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-[16px] py-[24px] sm:px-[32px] sm:py-[32px] xl:px-[60px]">
          <div className="anim-fade-left w-full max-w-[660px]" style={{ animationDelay: "250ms" }}>
            <p className="mb-[14px] text-[13px] font-medium text-[#8794A9] lg:hidden">{welcomeText}</p>
            {children}
          </div>
        </div>

        {/* Footer */}
        <div
          className="anim-fade-in relative z-10 px-[16px] pb-[20px] sm:pb-[28px]"
          style={{ animationDelay: "500ms" }}
        >
          <AuthFooterLinks footer={loginContent.footer} />
        </div>
      </section>
    </main>
  );
}

export default AuthSplitLayout;
