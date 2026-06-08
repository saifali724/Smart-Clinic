// src/features/auth/components/LoginBrand.jsx

export function LoginBrand({ brand }) {
  return (
    <div className="flex items-baseline gap-[0px]">
      <span
        className="text-[22px] font-black leading-none tracking-[0.02em] text-[#15D5E8] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(21,213,232,0.6)]"
        style={{ animation: "fadeSlideUp 0.5s ease both" }}
      >
        {brand.main}
      </span>
      <span
        className="text-[22px] font-black leading-none tracking-[0.02em] text-[#3DF5A0] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(61,245,160,0.6)]"
        style={{ animation: "fadeSlideUp 0.5s ease 0.08s both" }}
      >
        {brand.accent}
      </span>
    </div>
  );
}