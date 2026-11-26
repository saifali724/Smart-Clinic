// src/features/patientRecord/components/RecordStyles.jsx
// Animations used on the Patient Record screen (kept in one place).

export function RecordStyles() {
  return (
    <style>{`
      @keyframes recFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes recFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes recBadgeIn {
        from { opacity: 0; transform: scale(0.85); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes recPulse {
        0%   { box-shadow: 0 0 0 0 rgba(50, 226, 147, 0.55); }
        70%  { box-shadow: 0 0 0 7px rgba(50, 226, 147, 0); }
        100% { box-shadow: 0 0 0 0 rgba(50, 226, 147, 0); }
      }
      @keyframes recValueFlash {
        0%   { opacity: 0.35; transform: translateY(3px); }
        100% { opacity: 1;    transform: translateY(0); }
      }
      @keyframes recShimmer {
        from { background-position: -200% 0; }
        to   { background-position: 200% 0; }
      }
      @keyframes recToast {
        from { opacity: 0; transform: translate(-50%, 10px); }
        to   { opacity: 1; transform: translate(-50%, 0); }
      }
      .rec-fade-up  { animation: recFadeUp 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
      .rec-fade-in  { animation: recFadeIn 0.4s ease both; }
      .rec-badge-in { animation: recBadgeIn 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
      .rec-pulse    { animation: recPulse 1.8s ease-out infinite; }
      .rec-flash    { animation: recValueFlash 0.45s ease-out both; }
      .rec-skeleton {
        background: linear-gradient(90deg, #141824 0%, #1F2638 50%, #141824 100%);
        background-size: 200% 100%;
        animation: recShimmer 1.4s linear infinite;
      }
      .rec-toast    { animation: recToast 0.25s ease-out both; }
      @media print {
        .rec-no-print { display: none !important; }
      }
    `}</style>
  );
}

export default RecordStyles;
