// src/features/consultation/components/ConsultStyles.jsx

export function ConsultStyles() {
  return (
    <style>{`
      @keyframes cFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      @keyframes cBubbleIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }
      @keyframes cRecPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
      @keyframes cDot { 0%, 80%, 100% { transform: translateY(0); opacity: 0.5; } 40% { transform: translateY(-4px); opacity: 1; } }
      @keyframes cShimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
      @keyframes cToast { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
      @keyframes cGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(50,226,147,0); } 50% { box-shadow: 0 0 0 4px rgba(50,226,147,0.18); } }
      .c-fade-up   { animation: cFadeUp 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
      .c-bubble-in { animation: cBubbleIn 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
      .c-rec-pulse { animation: cRecPulse 1.2s ease-in-out infinite; }
      .c-dot       { animation: cDot 1.1s ease-in-out infinite; }
      .c-toast     { animation: cToast 0.25s ease-out both; }
      .c-speaking  { animation: cGlow 1.4s ease-in-out infinite; }
      .c-skeleton  {
        background: linear-gradient(90deg, #1A1F2E 0%, #232A3D 50%, #1A1F2E 100%);
        background-size: 200% 100%;
        animation: cShimmer 1.4s linear infinite;
      }
    `}</style>
  );
}

export default ConsultStyles;
