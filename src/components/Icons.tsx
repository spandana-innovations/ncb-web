import React from "react";

type P = { size?: number; className?: string };
// Apple-style: strokeWidth 1.5, round caps/joins, slightly softer geometry
const base = (size: number): React.SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

// Navigation & UI
export const IconMenu = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 7h16M4 12h10M4 17h16"/></svg>
);
export const IconClose = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M18 6 6 18M6 6l12 12"/></svg>
);
export const IconBack = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M15 18l-6-6 6-6"/></svg>
);
export const IconSearch = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
);
export const IconSettings = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M10.3 3.8a1.9 1.9 0 0 1 3.4 0l.5.9a1.9 1.9 0 0 0 2.1.9l1-.3a1.9 1.9 0 0 1 2.4 2.4l-.3 1a1.9 1.9 0 0 0 .9 2.1l.9.5a1.9 1.9 0 0 1 0 3.4l-.9.5a1.9 1.9 0 0 0-.9 2.1l.3 1a1.9 1.9 0 0 1-2.4 2.4l-1-.3a1.9 1.9 0 0 0-2.1.9l-.5.9a1.9 1.9 0 0 1-3.4 0l-.5-.9a1.9 1.9 0 0 0-2.1-.9l-1 .3a1.9 1.9 0 0 1-2.4-2.4l.3-1a1.9 1.9 0 0 0-.9-2.1l-.9-.5a1.9 1.9 0 0 1 0-3.4l.9-.5a1.9 1.9 0 0 0 .9-2.1l-.3-1a1.9 1.9 0 0 1 2.4-2.4l1 .3a1.9 1.9 0 0 0 2.1-.9z"/><circle cx="12" cy="12" r="2.5"/></svg>
);
export const IconPlus = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 5v14M5 12h14"/></svg>
);

// Content
export const IconBook = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13"/><path d="M9 7h6M9 11h4"/></svg>
);
export const IconBookmark = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z"/></svg>
);
export const IconCrossRef = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
export const IconShare = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);
export const IconImage = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);
export const IconComment = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
export const IconSort = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 6h18M6 12h12M10 18h4"/></svg>
);
export const IconEdit = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
export const IconTrash = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
);

// Media
export const IconPlay = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
);
export const IconPause = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="9"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="14" y1="9" x2="14" y2="15"/></svg>
);
export const IconVolume = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
);
export const IconVolumeMute = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
);
export const IconHeadphones = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="14" width="4" height="6" rx="2"/><rect x="17" y="14" width="4" height="6" rx="2"/></svg>
);
export const IconMic = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6"/></svg>
);

// Indicators
export const IconSun = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
);
export const IconMoon = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M20.4 13.7A8.5 8.5 0 1 1 10.3 3.6a7 7 0 0 0 10.1 10.1z" fill="currentColor" stroke="none" opacity=".15"/><path d="M20.4 13.7A8.5 8.5 0 1 1 10.3 3.6a7 7 0 0 0 10.1 10.1z"/></svg>
);
export const IconStar = ({ size = 24, className, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}><path d="M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 6.9L12 17.5 5.8 21l1.2-6.8L2 9.3l6.9-.7L12 2z"/></svg>
);
export const IconCheckCircle = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
export const IconCalendar = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><rect x="3" y="4" width="18" height="18" rx="2.5"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
);
export const IconLineage = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="4" r="2"/><path d="M12 6v3"/><path d="M7 9h10"/><path d="M7 9v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9"/><path d="M17 9v2a2 2 0 0 0 2 2h0"/><circle cx="5" cy="17" r="2"/><circle cx="12" cy="17" r="2"/><circle cx="19" cy="17" r="2"/><path d="M5 15v-2M12 15v-2M19 15v-2"/></svg>
);

// Lexicon categories
export const IconPerson = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
);
export const IconPlace = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
export const IconTerm = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 6h16M4 12h8M4 18h10"/></svg>
);
export const IconGrid = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
);
export const IconAZ = ({ size = 24, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 17l3-9 3 9M4.5 14h4M14 10h5l-5 8h5"/></svg>
);
