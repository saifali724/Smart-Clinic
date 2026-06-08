// src/features/auth/components/MedicalIllustrationCard.jsx

export function MedicalIllustrationCard() {
  return (
    <div className="relative h-[342px] w-[382px] overflow-hidden rounded-[16px] border border-[#24324D] bg-[#151B2B] transition-all duration-500 hover:border-[#08CFE8]/30 hover:shadow-[0_0_32px_rgba(8,207,232,0.08)]">
      <style>{`
        @keyframes plusPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; filter: drop-shadow(0 0 12px rgba(11,93,117,0.8)); }
        }
        @keyframes ecgDraw {
          0%   { opacity: 0.5; }
          50%  { opacity: 1; filter: drop-shadow(0 0 5px #1EF1A0); }
          100% { opacity: 0.5; }
        }
        .plus-pulse { animation: plusPulse 3s ease-in-out infinite; }
        .ecg-glow   { animation: ecgDraw 2s ease-in-out infinite; }
      `}</style>

      {/* Plus sign */}
      <div className="plus-pulse absolute left-1/2 top-[82px] z-10 h-[136px] w-[156px] -translate-x-1/2">
        <div className="absolute left-0 top-[47px] h-[46px] w-[156px] rounded-[9px] bg-[#0B5D75]/70" />
        <div className="absolute left-[55px] top-0 h-[136px] w-[46px] rounded-[9px] bg-[#0B5D75]/70" />
      </div>

      {/* Green diagnostic lines */}
      <span className="ecg-glow absolute left-[45px] top-[323px] h-[1.5px] w-[145px] rotate-[7deg] bg-[#1EF1A0]" style={{ animationDelay: "0ms" }} />
      <span className="ecg-glow absolute left-[195px] top-[286px] h-[1.5px] w-[65px] -rotate-[49deg] bg-[#1EF1A0]" style={{ animationDelay: "100ms" }} />
      <span className="ecg-glow absolute left-[282px] top-[276px] h-[1.5px] w-[72px] -rotate-[58deg] bg-[#1EF1A0]" style={{ animationDelay: "200ms" }} />
      <span className="ecg-glow absolute left-[245px] top-[345px] h-[1.5px] w-[55px] rotate-[55deg] bg-[#1EF1A0]" style={{ animationDelay: "300ms" }} />
      <span className="ecg-glow absolute left-[328px] top-[342px] h-[1.5px] w-[55px] rotate-[40deg] bg-[#1EF1A0]" style={{ animationDelay: "400ms" }} />
      <span className="ecg-glow absolute left-[360px] top-[316px] h-[1.5px] w-[95px] bg-[#1EF1A0]" style={{ animationDelay: "500ms" }} />
    </div>
  );
}