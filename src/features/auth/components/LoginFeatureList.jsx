// src/features/auth/components/LoginFeatureList.jsx

export function LoginFeatureList({ features }) {
  return (
    <div style={{ width: "464px" }} className="flex flex-col gap-[12px]">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="relative overflow-hidden rounded-[10px] border border-[#1A2540] bg-[#0A0F1E]"
          style={{
            height: "80px",
            paddingLeft: "26px",
            paddingRight: "20px",
            paddingTop: "18px",
            paddingBottom: "18px",
          }}
        >
          {/* Cyan left accent bar */}
          <div
            className="absolute left-0 top-0 h-full"
            style={{ width: "4px", background: "#08C8DC", borderRadius: "10px 0 0 10px" }}
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