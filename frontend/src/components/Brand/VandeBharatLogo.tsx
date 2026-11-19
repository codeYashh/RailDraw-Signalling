import React from 'react';

interface VandeBharatLogoProps {
  size?: number;
  className?: string;
  showFrame?: boolean;
}

export const VandeBharatLogo: React.FC<VandeBharatLogoProps> = ({
  size = 40,
  className = '',
  showFrame = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 108 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RailDraw insignia"
    >
      <defs>
        <clipPath id="vbFrameClip">
          <rect x="0" y="0" width="108" height="108" rx="18" />
        </clipPath>
      </defs>

      <g clipPath={showFrame ? 'url(#vbFrameClip)' : undefined}>
        {showFrame && (
          <>
            <rect width="108" height="108" rx="18" fill="#0F2942" />
            <rect x="0" y="76" width="108" height="4" fill="#D97706" />
            <rect x="0" y="80" width="108" height="4" fill="#F8FAFC" />
            <rect x="0" y="84" width="108" height="4" fill="#15803D" />
          </>
        )}

        <path
          d="M34,90 L44,72 M74,90 L64,72"
          stroke="#94A3B8"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M36,84 L72,84 M40,78 L68,78"
          stroke="#64748B"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <path
          d="M54,19 C66,19 74,27 76.5,41 L78.5,60 C78.5,67.5 72.5,73 64,74.5 L44,74.5 C35.5,73 29.5,67.5 29.5,60 L31.5,41 C34,27 42,19 54,19 Z"
          fill="#F8FAFC"
        />

        <path
          d="M30,55.5 C38,60.5 46,62.5 54,62.5 C62,62.5 70,60.5 78,55.5 L78.3,61.5 C77.6,68.2 71.8,73.2 64,74.5 L44,74.5 C36.2,73.2 30.4,68.2 29.7,61.5 Z"
          fill="#2563A6"
        />

        <path d="M38,69 L70,69 L65.5,74.5 L42.5,74.5 Z" fill="#0F2942" />

        <path
          d="M54,26.5 C63.5,26.5 69.5,32.5 72,42.5 C66.2,45.8 60,47.5 54,47.5 C48,47.5 41.8,45.8 36,42.5 C38.5,32.5 44.5,26.5 54,26.5 Z"
          fill="#1E293B"
        />

        <path d="M49.5,22 L58.5,22 L57.4,24.6 L50.6,24.6 Z" fill="#F59E0B" />

        <path d="M33.2,49.8 Q54,54.4 74.8,49.8 L75.3,52.1 Q54,56.7 32.7,52.1 Z" fill="#D97706" />
        <path d="M32.7,52.1 Q54,56.7 75.3,52.1 L75.7,54.4 Q54,59.0 32.3,54.4 Z" fill="#FFFFFF" />
        <path d="M32.3,54.4 Q54,59.0 75.7,54.4 L76.1,56.7 Q54,61.3 31.9,56.7 Z" fill="#15803D" />

        <path d="M35,59.5 L44.5,62.2 L43,65.5 L34.4,62.6 Z" fill="#E2E8F0" />
        <path d="M73,59.5 L63.5,62.2 L65,65.5 L73.6,62.6 Z" fill="#E2E8F0" />
        <path d="M54,47.5 L54,68.5" stroke="#94A3B8" strokeWidth="1" />
      </g>
    </svg>
  );
};
