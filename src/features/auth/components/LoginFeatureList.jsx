// src/features/auth/components/LoginFeatureList.jsx

export function LoginFeatureList({ features }) {
  return (
    <div style={{ width: "464px" }} className="flex flex-col gap-[12px]">
      {features.map((feature, index) => (
        <article
          key={feature.title}
          className="relative overflow-hidden rounded-[10px] border border-[#1A2540] bg-[#0A0F1E] transition-all duration-300 hover:border-[#08C8DC]/40 hover:bg-[#0D1526] hover:shadow-[0_0_20px_rgba(8,200,220,0.08)]"
          style={{
            height: "80px",
            paddingLeft: "26px",
            paddingRight: "20px",
            paddingTop: "18px",
            paddingBottom: "18px",
            animation: "fadeSlideUp 0.5s ease both",
            animationDelay: `${400 + index * 80}ms`,
          }}
        >
          {/* Cyan left accent bar with shimmer */}
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: "4px",
              background: "linear-gradient(180deg, #08C8DC, #3DF5A0, #08C8DC)",
              backgroundSize: "100% 200%",
              borderRadius: "10px 0 0 10px",
              animation: "shimmerBar 2.5s linear infinite",
              animationDelay: `${index * 200}ms`,
            }}
          />
          <h3
            className="font-extrabold text-white"
            style={{ fontSize: "16px", lineHeight: "22px" }}
          >
            {feature.title}
          </h3>
          <p
            className="font-normal text-[#6B7A95]"
            style={{ fontSize: "13px", lineHeight: "18px", marginTop: "3px" }}
          >
            {feature.description}
          </p>
        </article>
      ))}
    </div>
  );
}