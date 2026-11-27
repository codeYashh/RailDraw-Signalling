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
  const noseGradId = `vbNoseGrad_${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 108 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RailDraw Vande Bharat insignia"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="108" height="108" rx="24" />
        </clipPath>
        <linearGradient id={noseGradId} x1="32" y1="18" x2="76" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>

      <g clipPath={showFrame ? `url(#${clipId})` : undefined}>
        {showFrame && (
          <>
            {/* Identical Deep Railway Night Navy Background + Sweeping Tricolour Ribbons */}
            <rect width="108" height="108" rx="24" fill="#071426" />
            <path d="M0,0 L108,0 L108,56 Q54,74 0,56 Z" fill="#0E294B" />
            <path d="M0,73 Q54,61 108,73 L108,78 Q54,66 0,78 Z" fill="#FF9933" />
            <path d="M0,78.5 Q54,66.5 108,78.5 L108,83.5 Q54,71.5 0,83.5 Z" fill="#FFFFFF" />
            <path d="M0,84 Q54,72 108,84 L108,89 Q54,77 0,89 Z" fill="#138808" />
          </>
        )}

        {/* Converging Perspective Steel Rails */}
        <path
          d="M31,89 L45,73 M77,89 L63,73"
          stroke="#CBD5E1"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M34,84.5 L74,84.5 M38.5,79.5 L69.5,79.5"
          stroke="#64748B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Vande Bharat Sleek Tapered Aerodynamic Bullet Nose Shell */}
        <path
          d="M54,18 C61,18 66,21 69,28 L76,48 C78.5,56 76.5,64 70.5,69.5 L59,75.5 C55.8,77 52.2,77 49,75.5 L37.5,69.5 C31.5,64 29.5,56 32,48 L39,28 C42,21 47,18 54,18 Z"
          fill={`url(#${noseGradId})`}
        />
        <path
          d="M54,18 C61,18 66,21 69,28 L76,48 C78.5,56 76.5,64 70.5,69.5 L59,75.5 C56.5,76.6 55,76.8 54,76.8 L54,18 Z"
          fill="#E2E8F0"
          fillOpacity="0.65"
        />

        {/* Signature Vande Bharat Electric Blue Lower Nose Fairing & Wedge Skirt */}
        <path
          d="M31.6,51.5 Q54,60.5 76.4,51.5 L76.8,57.5 C76.4,63.5 73.2,67.8 68.5,70.8 L58.5,75.6 C55.6,77 52.4,77 49.5,75.6 L39.5,70.8 C34.8,67.8 31.6,63.5 31.2,57.5 Z"
          fill="#0284C7"
        />

        {/* Lower Aerodynamic Splitter / Cowcatcher */}
        <path
          d="M39.5,69.5 L54,73.5 L68.5,69.5 L63.5,74.8 C57.5,77.2 50.5,77.2 44.5,74.8 Z"
          fill="#0B1F3A"
        />

        {/* Swept-Back Wrap-Around Panoramic Black Cockpit Windshield */}
        <path
          d="M54,24.5 C61.5,24.5 66.5,28 69.5,35.5 L72.5,44.5 C66.2,48 60,49.5 54,49.5 C48,49.5 41.8,48 35.5,44.5 L38.5,35.5 C41.5,28 46.5,24.5 54,24.5 Z"
          fill="#091324"
        />

        {/* Windshield Glass Diagonal Sky Glint */}
        <path
          d="M41.5,31.5 C45,27.8 49.2,26.8 53.2,26.8 L49.2,40.5 C44.5,40 40.5,38.8 37.8,37.2 Z"
          fill="#38BDF8"
          fillOpacity="0.85"
        />

        {/* Top Destination LED Beacon */}
        <path d="M50,20.6 L58,20.6 L57,23.2 L51,23.2 Z" fill="#FACC15" />

        {/* Sleek V-Curved Tricolour Nose Chevron (Saffron, White, Green) */}
        <path d="M32.4,48.2 Q54,57.5 75.6,48.2 L76.0,50.5 Q54,59.8 32.0,50.5 Z" fill="#FF9933" />
        <path d="M32.0,50.5 Q54,59.8 76.0,50.5 L76.3,52.8 Q54,62.1 31.7,52.8 Z" fill="#FFFFFF" />
        <path d="M31.7,52.8 Q54,62.1 76.3,52.8 L76.6,55.1 Q54,64.4 31.4,55.1 Z" fill="#138808" />

        {/* Sharp Angled Vande Bharat Twin LED Headlamps */}
        <path d="M34.2,57.5 L46.0,62.4 L44.4,65.8 L33.5,61.0 Z" fill="#E0F2FE" />
        <path d="M73.8,57.5 L62.0,62.4 L63.6,65.8 L74.5,61.0 Z" fill="#E0F2FE" />
        <path
          d="M36.5,59.6 L43.5,62.6 L42.8,64.1 L35.8,61.1 Z"
          fill="#38BDF8"
          className={isAnimated ? 'animate-pulse' : undefined}
        />
        <path
          d="M71.5,59.6 L64.5,62.6 L65.2,64.1 L72.2,61.1 Z"
          fill="#38BDF8"
          className={isAnimated ? 'animate-pulse' : undefined}
        />

        {/* Aerodynamic Center Nose Ridge */}
        <path d="M54,49.5 L54,73.5" stroke="#CBD5E1" strokeWidth="1.1" />
      </g>
    </svg>
  );
};
