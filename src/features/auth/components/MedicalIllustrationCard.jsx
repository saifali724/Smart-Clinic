// src/features/auth/components/MedicalIllustrationCard.jsx

export function MedicalIllustrationCard() {
  return (
    <div className="relative h-[342px] w-[382px] overflow-hidden rounded-[16px] border border-[#24324D] bg-[#151B2B]">
      {/* Plus sign */}
      <div className="absolute left-1/2 top-[82px] z-10 h-[136px] w-[156px] -translate-x-1/2">
        <div className="absolute left-0 top-[47px] h-[46px] w-[156px] rounded-[9px] bg-[#0B5D75]/70" />
        <div className="absolute left-[55px] top-0 h-[136px] w-[46px] rounded-[9px] bg-[#0B5D75]/70" />
      </div>

      {/* Green diagnostic lines */}
      <span className="absolute left-[45px] top-[323px] h-[1.5px] w-[145px] rotate-[7deg] bg-[#1EF1A0]" />
      <span className="absolute left-[195px] top-[286px] h-[1.5px] w-[65px] -rotate-[49deg] bg-[#1EF1A0]" />
      <span className="absolute left-[282px] top-[276px] h-[1.5px] w-[72px] -rotate-[58deg] bg-[#1EF1A0]" />
      <span className="absolute left-[245px] top-[345px] h-[1.5px] w-[55px] rotate-[55deg] bg-[#1EF1A0]" />
      <span className="absolute left-[328px] top-[342px] h-[1.5px] w-[55px] rotate-[40deg] bg-[#1EF1A0]" />
      <span className="absolute left-[360px] top-[316px] h-[1.5px] w-[95px] bg-[#1EF1A0]" />
    </div>
  );
}