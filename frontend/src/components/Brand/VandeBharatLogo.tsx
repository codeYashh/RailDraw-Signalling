import React, { useId } from 'react';

interface VandeBharatLogoProps {
  size?: number;
  className?: string;
  showFrame?: boolean;
  isAnimated?: boolean;
}

export const VandeBharatLogo: React.FC<VandeBharatLogoProps> = ({
  size = 40,
  className = '',
  showFrame = true,
  isAnimated = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const clipId = `vbFrameClip_${uid}`;
  const bgGradId = `vbBgGrad_${uid}`;
  const noseGradId = `vbNoseGrad_${uid}`;
  const glowGradId = `vbGlowGrad_${uid}`;

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
        <clipPath id={clipId}>
          <rect x="0" y="0" width="108" height="108" rx="24" />
        </clipPath>
        <radialGradient id={bgGradId} cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#163D66" />
          <stop offset="60%" stopColor="#0D2540" />
          <stop offset="100%" stopColor="#071324" />
        </radialGradient>
        <linearGradient id={noseGradId} x1="54" y1="18" x2="54" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <radialGradient id={glowGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath={showFrame ? `url(#${clipId})` : undefined}>
        {showFrame && (
          <>
            <rect width="108" height="108" rx="24" fill={`url(#${bgGradId})`} />
            {/* Subtle S&T signal-arc aura behind train nose */}
            <circle cx="54" cy="48" r="36" fill={`url(#${glowGradId})`} />
            <path
              d="M22,38 A34,34 0 0,1 86,38"
              stroke="#38BDF8"
              strokeOpacity="0.28"
              strokeWidth="1.2"
              strokeDasharray="3 4"
              strokeLinecap="round"
            />
            <rect
              x="1"
              y="1"
              width="106"
              height="106"
              rx="23"
              stroke="#FFFFFF"
              strokeOpacity="0.14"
              strokeWidth="1.5"
            />
          </>
        )}

        {/* Perspective Rails */}
        <path
          d="M32,94 L43,72 M76,94 L65,72"
          stroke="#94A3B8"
          strokeOpacity="0.85"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M34.5,87 L73.5,87 M38.5,80.5 L69.5,80.5"
          stroke="#64748B"
          strokeOpacity="0.7"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Sleek Aerodynamic Vande Bharat Nose */}
        <path
          d="M54,17.5 C66.5,17.5 74.5,25.5 77,40 L79,59.5 C79,67.5 72.8,73.5 64.2,75 L43.8,75 C35.2,73.5 29,67.5 29,59.5 L31,40 C33.5,25.5 41.5,17.5 54,17.5 Z"
          fill={`url(#${noseGradId})`}
        />

        {/* Lower Aerodynamic Skirt */}
        <path
          d="M29.5,55 C37.5,60.2 45.8,62.5 54,62.5 C62.2,62.5 70.5,60.2 78.5,55 L78.8,61 C78,68 72.2,73.5 64.2,75 L43.8,75 C35.8,73.5 30,68 29.2,61 Z"
          fill="#1D4ED8"
        />

        {/* Coupler & Cowcatcher */}
        <path d="M38.5,69.5 L69.5,69.5 L65,75 L43,75 Z" fill="#0B1F3A" />

        {/* Panoramic Cockpit Windshield */}
        <path
          d="M54,25.5 C63.8,25.5 70,31.8 72.4,42 C66.4,45.5 60.2,47.2 54,47.2 C47.8,47.2 41.6,45.5 35.6,42 C38,31.8 44.2,25.5 54,25.5 Z"
          fill="#0F172A"
        />
        {/* Windshield Glass Reflection */}
        <path
          d="M42,30.5 C46,28.2 50,27.5 54,27.5 C57.5,27.5 61,28.1 64.2,29.5 L57,43.5 L48.5,43.5 Z"
          fill="#38BDF8"
          fillOpacity="0.16"
        />

        {/* Top Signal Destination Beacon */}
        <rect x="49" y="20.8" width="10" height="2.8" rx="1.4" fill="#F59E0B" />

        {/* Smooth Curved Tricolour Fairing Ribbon */}
        <path d="M32.6,49.4 Q54,54.2 75.4,49.4 L75.9,51.6 Q54,56.4 32.1,51.6 Z" fill="#F97316" />
        <path d="M32.1,51.6 Q54,56.4 75.9,51.6 L76.3,53.8 Q54,58.6 31.7,53.8 Z" fill="#FFFFFF" />
        <path d="M31.7,53.8 Q54,58.6 76.3,53.8 L76.7,56.0 Q54,60.8 31.3,56.0 Z" fill="#16A34A" />

        {/* Modern LED Headlamps */}
        <path d="M34.5,59.2 L44.5,62.2 L43,65.2 L33.8,62.2 Z" fill="#E0F2FE" />
        <path d="M73.5,59.2 L63.5,62.2 L65,65.2 L74.2,62.2 Z" fill="#E0F2FE" />
        <circle
          cx="39.2"
          cy="62.2"
          r="1.3"
          fill="#38BDF8"
          className={isAnimated ? 'animate-pulse' : undefined}
        />
        <circle
          cx="68.8"
          cy="62.2"
          r="1.3"
          fill="#38BDF8"
          className={isAnimated ? 'animate-pulse' : undefined}
        />

        {/* Center Aerodynamic Seam */}
        <path d="M54,47.2 L54,69" stroke="#94A3B8" strokeOpacity="0.7" strokeWidth="1" />
      </g>
    </svg>
  );
};
