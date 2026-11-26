// src/features/consultation/components/Icons.jsx
// Simple line icons (used instead of emojis).

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const Svg = ({ size = 16, children, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...base}>
    {children}
  </svg>
);

export const DoctorIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="7" r="3.5" />
    <path d="M5 21v-1.5A5.5 5.5 0 0 1 10.5 14h3a5.5 5.5 0 0 1 5.5 5.5V21" />
    <path d="M9 14.5v2.5a3 3 0 0 0 6 0v-2.5" />
  </Svg>
);
export const PatientIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
  </Svg>
);
export const MicIcon = ({ off, ...p }) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    {off && <path d="M4 4l16 16" />}
  </Svg>
);
export const CamIcon = ({ off, ...p }) => (
  <Svg {...p}>
    <rect x="3" y="6" width="13" height="12" rx="2.5" />
    <path d="M16 10.5l5-3v9l-5-3" />
    {off && <path d="M3 3l18 18" />}
  </Svg>
);
export const WarningIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l9.5 17h-19z" />
    <path d="M12 10v4M12 17.5v.01" />
  </Svg>
);
export const BulbIcon = (p) => (
  <Svg {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
  </Svg>
);
export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const ChartIcon = (p) => (
  <Svg {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Svg>
);
export const SparkleIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" />
  </Svg>
);
export const StopIcon = (p) => (
  <Svg {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </Svg>
);
export const AlertIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5v.01" />
  </Svg>
);
