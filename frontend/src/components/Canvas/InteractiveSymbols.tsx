import React from 'react';

export interface InteractiveSymbolDef {
  type: string;
  name: string;
  shortName: string;
  defaultPrefix: string;
  category: 'Signals' | 'Track & Points' | 'Housing' | 'Markers';
}

export const INTERACTIVE_SYMBOLS: InteractiveSymbolDef[] = [
  { type: 'cls_4aspect', name: '4-Aspect Signal (CLS)', shortName: '4-Aspect', defaultPrefix: 'S', category: 'Signals' },
  { type: 'cls_3aspect', name: '3-Aspect Signal (CLS)', shortName: '3-Aspect', defaultPrefix: 'S', category: 'Signals' },
  { type: 'cls_2aspect', name: '2-Aspect Signal (CLS)', shortName: '2-Aspect', defaultPrefix: 'S', category: 'Signals' },
  { type: 'shunt_signal', name: 'Shunt Signal', shortName: 'Shunt', defaultPrefix: 'SH', category: 'Signals' },
  { type: 'location_box', name: 'Location Box (App. Case)', shortName: 'Loc Box', defaultPrefix: 'L', category: 'Housing' },
  { type: 'location_box_double', name: 'Double Location Box', shortName: 'Dbl Box', defaultPrefix: 'DL', category: 'Housing' },
  { type: 'point_machine', name: 'Electric Point Machine', shortName: 'Point M/C', defaultPrefix: 'PM', category: 'Track & Points' },
  { type: 'axle_counter', name: 'Axle Counter (SSDAC)', shortName: 'Axle Ctr', defaultPrefix: 'AC', category: 'Track & Points' },
  { type: 'glued_joint', name: 'Glued Insulated Joint', shortName: 'Glued Jt', defaultPrefix: 'GJ', category: 'Track & Points' },
  { type: 'earth_pit', name: 'Maintenance-Free Earth Pit', shortName: 'Earth Pit', defaultPrefix: 'EP', category: 'Markers' },
  { type: 'crm', name: 'Cable Route Marker', shortName: 'CRM', defaultPrefix: 'CRM', category: 'Markers' },
  { type: 'cjm', name: 'Cable Joint Marker', shortName: 'CJM', defaultPrefix: 'CJM', category: 'Markers' },
  { type: 'tcm', name: 'Track Crossing Marker', shortName: 'TCM', defaultPrefix: 'TCM', category: 'Markers' },
  { type: 'lc_gate', name: 'Level Crossing Gate', shortName: 'LC Gate', defaultPrefix: 'LC', category: 'Track & Points' },
  { type: 'signal_cabin', name: 'Signal Cabin / Relay Hut', shortName: 'Relay Hut', defaultPrefix: 'RH', category: 'Housing' },
];

/**
 * Pure inline SVG vector symbol renderer centered at (0, 0) within roughly [-22..22, -26..26].
 * Because these are pure inline SVG elements (no external <image href>), they serialize 100%
 * cleanly into exported PNG images and A3 PDF documents!
 */
export const RenderInteractiveSymbol: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'cls_4aspect':
      return (
        <g>
          <line x1="0" y1="8" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-7" y="-22" width="14" height="31" rx="6" fill="#0F172A" stroke="#0C2340" strokeWidth="1.5" />
          <circle cx="0" cy="-16" r="2.7" fill="#FACC15" />
          <circle cx="0" cy="-9" r="2.7" fill="#22C55E" />
          <circle cx="0" cy="-2" r="2.7" fill="#FACC15" />
          <circle cx="0" cy="5" r="2.7" fill="#EF4444" />
        </g>
      );

    case 'cls_3aspect':
      return (
        <g>
          <line x1="0" y1="7" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-7" y="-17" width="14" height="25" rx="6" fill="#0F172A" stroke="#0C2340" strokeWidth="1.5" />
          <circle cx="0" cy="-11" r="2.9" fill="#22C55E" />
          <circle cx="0" cy="-4" r="2.9" fill="#FACC15" />
          <circle cx="0" cy="3" r="2.9" fill="#EF4444" />
        </g>
      );

    case 'cls_2aspect':
      return (
        <g>
          <line x1="0" y1="6" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-7" y="-12" width="14" height="19" rx="6" fill="#0F172A" stroke="#0C2340" strokeWidth="1.5" />
          <circle cx="0" cy="-6" r="3" fill="#22C55E" />
          <circle cx="0" cy="2" r="3" fill="#EF4444" />
        </g>
      );

    case 'shunt_signal':
      return (
        <g>
          <line x1="0" y1="8" x2="0" y2="22" stroke="#0C2340" strokeWidth="2.2" />
          <line x1="-7" y1="22" x2="7" y2="22" stroke="#0C2340" strokeWidth="2.4" />
          <circle cx="0" cy="-3" r="11" fill="#FFFFFF" stroke="#0C2340" strokeWidth="2" />
          <circle cx="-4" cy="0" r="2.2" fill="#0C2340" />
          <circle cx="4" cy="0" r="2.2" fill="#0C2340" />
          <circle cx="4" cy="-6" r="2.2" fill="#0C2340" />
          <line x1="-6" y1="0" x2="6" y2="0" stroke="#B91C1C" strokeWidth="1.4" />
        </g>
      );

    case 'location_box':
      return (
        <g>
          <rect x="-14" y="14" width="28" height="5" fill="#64748B" stroke="#0C2340" strokeWidth="1.5" />
          <rect x="-12" y="-14" width="24" height="28" fill="#E2E8F0" stroke="#0C2340" strokeWidth="1.8" rx="1.5" />
          <polygon points="-14,-14 0,-23 14,-14" fill="#0C2340" />
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#0C2340" strokeWidth="1.2" />
          <circle cx="-3" cy="0" r="1.2" fill="#0C2340" />
          <circle cx="3" cy="0" r="1.2" fill="#0C2340" />
        </g>
      );

    case 'location_box_double':
      return (
        <g>
          <rect x="-20" y="14" width="40" height="5" fill="#64748B" stroke="#0C2340" strokeWidth="1.5" />
          <rect x="-18" y="-13" width="36" height="27" fill="#E2E8F0" stroke="#0C2340" strokeWidth="1.8" rx="1.5" />
          <polygon points="-20,-13 0,-22 20,-13" fill="#0C2340" />
          <line x1="-6" y1="-13" x2="-6" y2="14" stroke="#0C2340" strokeWidth="1.2" />
          <line x1="6" y1="-13" x2="6" y2="14" stroke="#0C2340" strokeWidth="1.2" />
        </g>
      );

    case 'point_machine':
      return (
        <g>
          <rect x="-16" y="-10" width="32" height="20" rx="2" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2" />
          <line x1="-16" y1="0" x2="-24" y2="0" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="16" y1="0" x2="24" y2="0" stroke="#0C2340" strokeWidth="2.4" />
          <text x="0" y="4" fontSize="10" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" fill="#1E3A8A">
            PM
          </text>
        </g>
      );

    case 'axle_counter':
      return (
        <g>
          <line x1="-20" y1="0" x2="20" y2="0" stroke="#475569" strokeWidth="2.2" />
          <circle cx="0" cy="0" r="10" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
          <circle cx="-4" cy="0" r="2.2" fill="#B45309" />
          <circle cx="4" cy="0" r="2.2" fill="#B45309" />
          <path d="M-8,-12 L8,-12" stroke="#B45309" strokeWidth="1.8" />
        </g>
      );

    case 'glued_joint':
      return (
        <g>
          <line x1="-22" y1="0" x2="-4" y2="0" stroke="#0C2340" strokeWidth="3" />
          <line x1="4" y1="0" x2="22" y2="0" stroke="#0C2340" strokeWidth="3" />
          <line x1="-4" y1="-12" x2="-4" y2="12" stroke="#B91C1C" strokeWidth="2.4" />
          <line x1="4" y1="-12" x2="4" y2="12" stroke="#B91C1C" strokeWidth="2.4" />
          <rect x="-3" y="-7" width="6" height="14" fill="#FEE2E2" />
        </g>
      );

    case 'earth_pit':
      return (
        <g>
          <line x1="0" y1="-16" x2="0" y2="2" stroke="#15803D" strokeWidth="2.4" />
          <line x1="-14" y1="2" x2="14" y2="2" stroke="#15803D" strokeWidth="2.6" />
          <line x1="-9" y1="8" x2="9" y2="8" stroke="#15803D" strokeWidth="2.4" />
          <line x1="-4" y1="14" x2="4" y2="14" stroke="#15803D" strokeWidth="2.2" />
          <circle cx="0" cy="-16" r="3" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        </g>
      );

    case 'crm':
      return (
        <g>
          <circle cx="0" cy="12" r="4" fill="#FFFFFF" stroke="#0C2340" strokeWidth="2" />
          <line x1="0" y1="8" x2="0" y2="-4" stroke="#0C2340" strokeWidth="2" />
          <rect x="-15" y="-18" width="30" height="15" rx="2" fill="#F8FAFC" stroke="#0C2340" strokeWidth="1.8" />
          <text x="0" y="-7" fontSize="9" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            CRM
          </text>
        </g>
      );

    case 'cjm':
      return (
        <g>
          <polygon points="0,-16 15,0 0,16 -15,0" fill="#FEF2F2" stroke="#B91C1C" strokeWidth="2" />
          <text x="0" y="3.5" fontSize="8" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" fill="#B91C1C">
            CJM
          </text>
        </g>
      );

    case 'tcm':
      return (
        <g>
          <polygon points="0,-16 16,12 -16,12" fill="#FEF9C3" stroke="#A16207" strokeWidth="2" />
          <text x="0" y="8" fontSize="8" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" fill="#854D0E">
            TCM
          </text>
        </g>
      );

    case 'lc_gate':
      return (
        <g>
          <line x1="-18" y1="-10" x2="18" y2="10" stroke="#B91C1C" strokeWidth="3" />
          <line x1="-18" y1="10" x2="18" y2="-10" stroke="#B91C1C" strokeWidth="3" />
          <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1.8" />
          <text x="0" y="3.5" fontSize="8.5" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            LC
          </text>
        </g>
      );

    case 'signal_cabin':
      return (
        <g>
          <rect x="-18" y="-12" width="36" height="26" fill="#E0F2FE" stroke="#0C2340" strokeWidth="2" rx="2" />
          <polygon points="-22,-12 0,-23 22,-12" fill="#0C2340" />
          <rect x="-12" y="-6" width="9" height="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
          <rect x="3" y="-6" width="9" height="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
          <rect x="-4" y="6" width="8" height="8" fill="#0C2340" />
        </g>
      );

    default:
      return (
        <g>
          <circle cx="0" cy="0" r="12" fill="#E2E8F0" stroke="#0C2340" strokeWidth="2" />
          <text x="0" y="4" fontSize="9" fontWeight="800" textAnchor="middle" fill="#0C2340">
            S&amp;T
          </text>
        </g>
      );
  }
};
