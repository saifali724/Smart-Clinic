// src/features/auth/components/LoginFeatureList.jsx

export function LoginFeatureList({ features }) {
  return (
    <div className="flex w-[382px] flex-col gap-[10px]">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="h-[59px] rounded-[8px] border border-[#141D2E] bg-[#060A13] px-[43px] py-[10px]"
        >
          <h3 className="text-[12px] font-extrabold leading-[16px] text-[#EDF3FA]">
            {feature.title}
          </h3>

          <p className="mt-[1px] text-[10px] font-medium leading-[14px] text-[#78889C]">
            {feature.description}
          </p>
        </article>
      ))}
    </div>
  );
}