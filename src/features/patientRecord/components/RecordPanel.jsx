// src/features/patientRecord/components/RecordPanel.jsx
// The card used for the 3 columns (Figma: #141824, 1px #2E3852 border, radius 16,
// title 10px bold cyan at 24px from the left / 22px from the top).

export function RecordPanel({ title, right, delay = 0, className = "", children }) {
  return (
    <section
      className={`rec-fade-up flex min-h-0 flex-col rounded-[16px] border border-[#2E3852] bg-[#141824] pb-[20px] pt-[21px] xl:h-full ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex min-h-[12px] items-center justify-between gap-[12px] pl-[23px] pr-[19px]">
        <h2 className="text-[10px] font-bold uppercase leading-[12px] text-[#00BFD8]">{title}</h2>
        {right}
      </div>
      {/* on desktop each card scrolls inside itself; on phones the page scrolls */}
      <div className="min-h-0 flex-1 xl:overflow-y-auto">{children}</div>
    </section>
  );
}

export default RecordPanel;
