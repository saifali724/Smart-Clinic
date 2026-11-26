// src/features/auth/components/LoginFeatureList.jsx

export function LoginFeatureList({ features }) {
  return (
    <div className="flex w-full flex-col gap-[12px]">
      {features.map((feature, index) => (
        <article
          key={feature.title}
          className="relative min-h-[72px] overflow-hidden rounded-[10px] border border-[#1A2540] bg-[#0A0F1E] py-[14px] pl-[24px] pr-[18px] transition-all duration-300 hover:border-[#08C8DC]/40 hover:bg-[#0D1526] hover:shadow-[0_0_20px_rgba(8,200,220,0.08)] xl:min-h-[80px] xl:py-[18px] xl:pl-[26px]"
          style={{
            animation: "fadeSlideUp 0.5s ease both",
            animationDelay: `${400 + index * 80}ms`,
          }}
        >
          {/* Cyan left accent bar with shimmer */}
          <div
            className="absolute left-0 top-0 h-full w-[4px]"
            style={{
              background: "linear-gradient(180deg, #08C8DC, #3DF5A0, #08C8DC)",
              backgroundSize: "100% 200%",
              borderRadius: "10px 0 0 10px",
              animation: "shimmerBar 2.5s linear infinite",
              animationDelay: `${index * 200}ms`,
            }}
          />
          <h3 className="text-[15px] font-extrabold leading-[21px] text-white xl:text-[16px] xl:leading-[22px]">
            {feature.title}
          </h3>
          <p className="mt-[3px] text-[12px] font-normal leading-[17px] text-[#6B7A95] xl:text-[13px] xl:leading-[18px]">
            {feature.description}
          </p>
        </article>
      ))}
    </div>
  );
}
