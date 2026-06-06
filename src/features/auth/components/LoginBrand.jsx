// src/features/auth/components/LoginBrand.jsx

export function LoginBrand({ brand }) {
  return (
    <div className="flex items-baseline gap-[0px]">
      <span className="text-[22px] font-black leading-none tracking-[0.02em] text-[#15D5E8]">
        {brand.main}
      </span>
      <span className="text-[22px] font-black leading-none tracking-[0.02em] text-[#3DF5A0]">
        {brand.accent}
      </span>
    </div>
  );
}