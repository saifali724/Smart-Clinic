// src/features/idScanner/components/ScannerStyles.jsx
// Entrance + idle animations for the ID Scanner screen (every time you arrive on it).
// Order: top bar → scanner panel → queue panel → rows / stats / log one by one,
// the sample card pops in, its corners draw, and the scan line keeps sweeping.
// People who switched off animations in their OS get a still screen.

export function ScannerStyles() {
  return (
    <style>{`
      @keyframes sDown   { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: none; } }
      @keyframes sLeft   { from { opacity: 0; transform: translateX(-28px) scale(0.985); } to { opacity: 1; transform: none; } }
      @keyframes sRight  { from { opacity: 0; transform: translateX(28px) scale(0.985); } to { opacity: 1; transform: none; } }
      @keyframes sUp     { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      @keyframes sPop    { 0% { opacity: 0; transform: scale(0.92); } 70% { opacity: 1; transform: scale(1.015); } 100% { opacity: 1; transform: none; } }
      @keyframes sCornerX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      @keyframes sCornerY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      @keyframes sSweep  { 0% { top: 13%; } 50% { top: 80%; } 100% { top: 13%; } }
      @keyframes sFrame  { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,191,216,0); } 50% { box-shadow: 0 0 22px 0 rgba(0,191,216,0.16); } }
      @keyframes sReady  { 0% { box-shadow: 0 0 0 0 rgba(0,191,216,0.45); } 70% { box-shadow: 0 0 0 10px rgba(0,191,216,0); } 100% { box-shadow: 0 0 0 0 rgba(0,191,216,0); } }
      @keyframes sBlink  { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      @keyframes sType   { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }

      .s-down  { animation: sDown 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
      .s-left  { animation: sLeft 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
      .s-right { animation: sRight 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
      .s-up    { animation: sUp 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
      .s-pop   { animation: sPop 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
      .s-corner-x { transform-origin: var(--o, left); animation: sCornerX 0.45s ease-out both; }
      .s-corner-y { transform-origin: var(--o, top);  animation: sCornerY 0.45s ease-out both; }
      .s-sweep { animation: sSweep 3.6s ease-in-out 1.1s infinite; }
      .s-box   { animation: sPop 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.22s both, sFrame 3.6s ease-in-out 1.1s infinite; }
      .s-ready { animation: sReady 1.8s ease-out infinite; }
      .s-blink { animation: sBlink 1.6s ease-in-out infinite; }
      .s-type  { animation: sType 0.7s steps(28, end) both; }

      @media (prefers-reduced-motion: reduce) {
        .s-down, .s-left, .s-right, .s-up, .s-pop, .s-corner-x, .s-corner-y,
        .s-sweep, .s-box, .s-ready, .s-blink, .s-type { animation: none !important; }
      }
    `}</style>
  );
}

export default ScannerStyles;
