// src/features/auth/components/MedicalIllustrationCard.jsx
// Scales to any width: the plus sign and ECG line are one SVG drawn on a 382×342 canvas.

export function MedicalIllustrationCard() {
  return (
    <div className="relative aspect-[382/342] w-full overflow-hidden rounded-[16px] border border-[#24324D] bg-[#151B2B] transition-all duration-500 hover:border-[#08CFE8]/30 hover:shadow-[0_0_32px_rgba(8,207,232,0.08)]">
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

      <svg
        viewBox="0 0 382 342"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Plus sign */}
        <g className="plus-pulse" fill="rgba(11,93,117,0.7)">
          <rect x="113" y="129" width="156" height="46" rx="9" />
          <rect x="168" y="82" width="46" height="136" rx="9" />
        </g>

        {/* ECG line */}
        <polyline
          className="ecg-glow"
          points="30,300 150,300 175,300 200,262 222,322 248,250 275,318 300,288 330,300 382,300"
          fill="none"
          stroke="#1EF1A0"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default MedicalIllustrationCard;
