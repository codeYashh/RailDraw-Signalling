import React from 'react';

export interface InteractiveSymbolDef {
  type: string;
  name: string;
  shortName: string;
  defaultPrefix: string;
  category: 'Signals' | 'Track & Points' | 'Housing' | 'Markers' | 'Boards & Signs' | 'Power & Telecom';
}

export const INTERACTIVE_SYMBOLS: InteractiveSymbolDef[] = [
  // --- SIGNALS ---
  { type: 'cls_4aspect', name: '4-Aspect Signal (CLS)', shortName: '4-Aspect', defaultPrefix: 'S', category: 'Signals' },
  { type: 'cls_3aspect', name: '3-Aspect Signal (CLS)', shortName: '3-Aspect', defaultPrefix: 'S', category: 'Signals' },
  { type: 'cls_2aspect', name: '2-Aspect Signal (CLS)', shortName: '2-Aspect', defaultPrefix: 'S', category: 'Signals' },
  { type: 'signal_route_indicator', name: 'Route Indicator (Feather)', shortName: 'Route Ind.', defaultPrefix: 'RI', category: 'Signals' },
  { type: 'signal_automatic', name: 'Automatic Signal (A Marker)', shortName: 'Auto Sig', defaultPrefix: 'AS', category: 'Signals' },
  { type: 'signal_semi_automatic', name: 'Semi-Auto Signal (Illum A)', shortName: 'Semi-Auto', defaultPrefix: 'SAS', category: 'Signals' },
  { type: 'signal_inner_distant', name: 'Inner Distant (ID Marker)', shortName: 'Inner Dist', defaultPrefix: 'ID', category: 'Signals' },
  { type: 'signal_intermediate_starter', name: 'Intermediate Starter', shortName: 'Inter Start', defaultPrefix: 'IS', category: 'Signals' },
  { type: 'signal_coacting', name: 'Co-acting (Duplicate) Signal', shortName: 'Co-acting', defaultPrefix: 'CS', category: 'Signals' },
  { type: 'signal_banner_repeater', name: 'Banner Repeater Signal', shortName: 'Banner Rep', defaultPrefix: 'BR', category: 'Signals' },
  { type: 'signal_calling_on_cls', name: 'Calling-On Signal (C Marker)', shortName: 'Calling-On', defaultPrefix: 'CO', category: 'Signals' },
  { type: 'signal_shunt_position', name: 'Position Light Shunt Signal', shortName: 'Pos Shunt', defaultPrefix: 'SH', category: 'Signals' },
  { type: 'signal_gate_cls', name: 'Gate Signal (G Marker)', shortName: 'Gate Sig', defaultPrefix: 'GS', category: 'Signals' },
  { type: 'signal_warner', name: 'Semaphore Warner / Distant', shortName: 'Warner', defaultPrefix: 'W', category: 'Signals' },
  { type: 'shunt_signal', name: 'Shunt Disc Signal', shortName: 'Shunt Disc', defaultPrefix: 'SH', category: 'Signals' },

  // --- TRACK & POINTS ---
  { type: 'point_machine', name: 'Electric Point Machine', shortName: 'Point M/C', defaultPrefix: 'PM', category: 'Track & Points' },
  { type: 'point_machine_clamp', name: 'Point M/C with Clamp Lock', shortName: 'PM Clamp', defaultPrefix: 'PM', category: 'Track & Points' },
  { type: 'axle_counter', name: 'Axle Counter (SSDAC/MSDAC)', shortName: 'Axle Ctr', defaultPrefix: 'AC', category: 'Track & Points' },
  { type: 'axle_counter_wheel_sensor', name: 'MSDAC Wheel Sensor (Rail)', shortName: 'Wheel Sensor', defaultPrefix: 'WS', category: 'Track & Points' },
  { type: 'glued_joint', name: 'Glued Insulated Joint (GJ)', shortName: 'Glued Jt', defaultPrefix: 'GJ', category: 'Track & Points' },
  { type: 'track_lead_junction_box', name: 'Track Lead Junction Box', shortName: 'TLJB', defaultPrefix: 'TLJB', category: 'Track & Points' },
  { type: 'fouling_mark', name: 'Fouling Mark (FM Post)', shortName: 'Fouling Mk', defaultPrefix: 'FM', category: 'Track & Points' },
  { type: 'lc_gate', name: 'Level Crossing Gate', shortName: 'LC Gate', defaultPrefix: 'LC', category: 'Track & Points' },

  // --- HOUSING & CABINS ---
  { type: 'location_box', name: 'Single Location Box', shortName: 'Loc Box', defaultPrefix: 'L', category: 'Housing' },
  { type: 'location_box_double', name: 'Double Location Box', shortName: 'Dbl Box', defaultPrefix: 'DL', category: 'Housing' },
  { type: 'signal_cabin', name: 'Signal Cabin / Relay Hut', shortName: 'Relay Hut', defaultPrefix: 'RH', category: 'Housing' },
  { type: 'ips_room', name: 'Integrated Power Supply Room', shortName: 'IPS Room', defaultPrefix: 'IPS', category: 'Housing' },
  { type: 'emergency_socket_pillar', name: 'Emergency Telephone Socket', shortName: 'EC Socket', defaultPrefix: 'EC', category: 'Housing' },

  // --- MARKERS & JOINTS ---
  { type: 'crm', name: 'Cable Route Marker (CRM)', shortName: 'CRM', defaultPrefix: 'CRM', category: 'Markers' },
  { type: 'cjm', name: 'Cable Joint Marker (CJM)', shortName: 'CJM', defaultPrefix: 'CJM', category: 'Markers' },
  { type: 'tcm', name: 'Track Crossing Marker (TCM)', shortName: 'TCM', defaultPrefix: 'TCM', category: 'Markers' },
  { type: 'ofc_cable_marker', name: 'OFC Telecom Route Marker', shortName: 'OFC Marker', defaultPrefix: 'OFC', category: 'Markers' },

  // --- BOARDS & SIGNS ---
  { type: 'board_shunting_limit', name: 'Shunting Limit Board (SLB)', shortName: 'SLB Board', defaultPrefix: 'SLB', category: 'Boards & Signs' },
  { type: 'board_block_section_limit', name: 'Block Section Limit (BSLB)', shortName: 'BSLB Board', defaultPrefix: 'BSLB', category: 'Boards & Signs' },
  { type: 'board_whistle', name: 'Whistle Board (W / W/L)', shortName: 'Whistle W/L', defaultPrefix: 'WB', category: 'Boards & Signs' },
  { type: 'board_warning', name: 'Warning Board (Striped)', shortName: 'Warn Board', defaultPrefix: 'WRN', category: 'Boards & Signs' },
  { type: 'board_speed_indicator', name: 'Speed / Termination Board', shortName: 'Speed Ind', defaultPrefix: 'SR', category: 'Boards & Signs' },

  // --- POWER & TELECOM ---
  { type: 'earth_pit', name: 'Maintenance-Free Earth Pit', shortName: 'Earth Pit', defaultPrefix: 'EP', category: 'Power & Telecom' },
  { type: 'solar_panel_array', name: 'Solar PV Array (Signalling)', shortName: 'Solar PV', defaultPrefix: 'SP', category: 'Power & Telecom' },
  { type: 'spd_cabinet', name: 'Surge Protection Device (SPD)', shortName: 'SPD Panel', defaultPrefix: 'SPD', category: 'Power & Telecom' },
];

/**
 * Pure inline SVG vector symbol renderer centered at (0, 0) within roughly [-24..24, -28..28].
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

    case 'signal_route_indicator':
      return (
        <g>
          <line x1="0" y1="7" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-7" y="-17" width="14" height="25" rx="5" fill="#0F172A" stroke="#0C2340" strokeWidth="1.5" />
          <circle cx="0" cy="-11" r="2.7" fill="#22C55E" />
          <circle cx="0" cy="-4" r="2.7" fill="#FACC15" />
          <circle cx="0" cy="3" r="2.7" fill="#EF4444" />
          {/* Feather arm angled at 45 deg with lunar white LED row */}
          <line x1="0" y1="-17" x2="16" y2="-27" stroke="#0C2340" strokeWidth="3" strokeLinecap="round" />
          <circle cx="4" cy="-19.5" r="1.3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.5" />
          <circle cx="8" cy="-22" r="1.3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.5" />
          <circle cx="12" cy="-24.5" r="1.3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.5" />
          <circle cx="16" cy="-27" r="1.3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.5" />
        </g>
      );

    case 'signal_automatic':
      return (
        <g>
          <line x1="0" y1="7" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-7" y="-17" width="14" height="25" rx="5" fill="#0F172A" stroke="#0C2340" strokeWidth="1.5" />
          <circle cx="0" cy="-11" r="2.7" fill="#22C55E" />
          <circle cx="0" cy="-4" r="2.7" fill="#FACC15" />
          <circle cx="0" cy="3" r="2.7" fill="#EF4444" />
          {/* Circular 'A' marker disc */}
          <circle cx="12" cy="-4" r="5.5" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1.3" />
          <text x="12" y="-1.5" fontSize="7" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            A
          </text>
        </g>
      );

    case 'signal_semi_automatic':
      return (
        <g>
          <line x1="0" y1="7" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-7" y="-17" width="14" height="25" rx="5" fill="#0F172A" stroke="#0C2340" strokeWidth="1.5" />
          <circle cx="0" cy="-11" r="2.7" fill="#22C55E" />
          <circle cx="0" cy="-4" r="2.7" fill="#FACC15" />
          <circle cx="0" cy="3" r="2.7" fill="#EF4444" />
          {/* Illuminated 'A' marker rectangular indicator */}
          <rect x="8" y="-9" width="11" height="11" rx="2" fill="#0F172A" stroke="#FACC15" strokeWidth="1.2" />
          <text x="13.5" y="-1" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#FACC15">
            A
          </text>
        </g>
      );

    case 'signal_inner_distant':
      return (
        <g>
          <line x1="0" y1="7" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-7" y="-17" width="14" height="25" rx="5" fill="#0F172A" stroke="#0C2340" strokeWidth="1.5" />
          <circle cx="0" cy="-11" r="2.7" fill="#22C55E" />
          <circle cx="0" cy="-4" r="2.7" fill="#FACC15" />
          <circle cx="0" cy="3" r="2.7" fill="#FACC15" />
          {/* Circular 'ID' marker disc */}
          <circle cx="13" cy="-4" r="6" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1.3" />
          <text x="13" y="-1.8" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            ID
          </text>
        </g>
      );

    case 'signal_intermediate_starter':
      return (
        <g>
          <line x1="0" y1="7" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-7" y="-17" width="14" height="25" rx="5" fill="#0F172A" stroke="#0C2340" strokeWidth="1.5" />
          <circle cx="0" cy="-11" r="2.7" fill="#22C55E" />
          <circle cx="0" cy="-4" r="2.7" fill="#FACC15" />
          <circle cx="0" cy="3" r="2.7" fill="#EF4444" />
          {/* 'IS' indicator plate */}
          <rect x="8" y="-9" width="12" height="10" rx="2" fill="#0284C7" stroke="#FFFFFF" strokeWidth="0.8" />
          <text x="14" y="-2" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#FFFFFF">
            IS
          </text>
        </g>
      );

    case 'signal_coacting':
      return (
        <g>
          <line x1="0" y1="-24" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          {/* Upper duplicated head */}
          <rect x="-6" y="-24" width="12" height="18" rx="4" fill="#0F172A" stroke="#0C2340" strokeWidth="1.2" />
          <circle cx="0" cy="-19" r="2.4" fill="#22C55E" />
          <circle cx="0" cy="-11" r="2.4" fill="#EF4444" />
          {/* Lower duplicated head */}
          <rect x="-6" y="2" width="12" height="18" rx="4" fill="#0F172A" stroke="#0C2340" strokeWidth="1.2" />
          <circle cx="0" cy="7" r="2.4" fill="#22C55E" />
          <circle cx="0" cy="15" r="2.4" fill="#EF4444" />
        </g>
      );

    case 'signal_banner_repeater':
      return (
        <g>
          <line x1="0" y1="8" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          {/* Circular yellow banner face */}
          <circle cx="0" cy="-4" r="13" fill="#FACC15" stroke="#0C2340" strokeWidth="2" />
          {/* Black horizontal revolving bar */}
          <rect x="-10" y="-6.5" width="20" height="5" rx="1" fill="#0F172A" />
          <circle cx="0" cy="-4" r="2.2" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1" />
        </g>
      );

    case 'signal_calling_on_cls':
      return (
        <g>
          <line x1="0" y1="12" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          {/* Main 3-aspect head */}
          <rect x="-7" y="-24" width="14" height="23" rx="5" fill="#0F172A" stroke="#0C2340" strokeWidth="1.4" />
          <circle cx="0" cy="-19" r="2.5" fill="#22C55E" />
          <circle cx="0" cy="-13" r="2.5" fill="#FACC15" />
          <circle cx="0" cy="-7" r="2.5" fill="#EF4444" />
          {/* Subsidiary Calling-on head with yellow lamp and 'C' plate */}
          <rect x="-6" y="2" width="12" height="11" rx="2" fill="#0F172A" stroke="#0C2340" strokeWidth="1.2" />
          <circle cx="0" cy="7.5" r="2.4" fill="#FACC15" />
          <circle cx="11" cy="7.5" r="4.8" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1" />
          <text x="11" y="9.8" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            C
          </text>
        </g>
      );

    case 'signal_shunt_position':
      return (
        <g>
          <line x1="0" y1="10" x2="0" y2="20" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-6" y1="20" x2="6" y2="20" stroke="#0C2340" strokeWidth="2.6" />
          {/* White disc */}
          <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#0C2340" strokeWidth="2" />
          {/* Red horizontal stop bar */}
          <rect x="-8" y="-2" width="16" height="4" rx="1" fill="#DC2626" />
          {/* Two white position lights diagonally */}
          <circle cx="-4" cy="3.5" r="2" fill="#FFFFFF" stroke="#0C2340" strokeWidth="0.8" />
          <circle cx="4" cy="-3.5" r="2" fill="#FFFFFF" stroke="#0C2340" strokeWidth="0.8" />
        </g>
      );

    case 'signal_gate_cls':
      return (
        <g>
          <line x1="0" y1="7" x2="0" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-7" y="-17" width="14" height="25" rx="5" fill="#0F172A" stroke="#0C2340" strokeWidth="1.5" />
          <circle cx="0" cy="-11" r="2.7" fill="#22C55E" />
          <circle cx="0" cy="-4" r="2.7" fill="#FACC15" />
          <circle cx="0" cy="3" r="2.7" fill="#EF4444" />
          {/* Circular yellow 'G' marker disc */}
          <circle cx="12" cy="-4" r="5.5" fill="#FACC15" stroke="#0C2340" strokeWidth="1.3" />
          <text x="12" y="-1.5" fontSize="7" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            G
          </text>
        </g>
      );

    case 'signal_warner':
      return (
        <g>
          <line x1="4" y1="-14" x2="4" y2="24" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-4" y1="24" x2="12" y2="24" stroke="#0C2340" strokeWidth="2.6" />
          {/* Fishtail semaphore arm */}
          <polygon points="4,-14 -14,-14 -19,-9 -14,-4 4,-4" fill="#FACC15" stroke="#0C2340" strokeWidth="1.5" />
          {/* Black chevron stripe */}
          <polygon points="-8,-14 -12,-9 -8,-4 -5,-4 -9,-9 -5,-14" fill="#0F172A" />
          <circle cx="7" cy="-9" r="3" fill="#22C55E" stroke="#0C2340" strokeWidth="0.8" />
          <circle cx="13" cy="-9" r="3" fill="#F59E0B" stroke="#0C2340" strokeWidth="0.8" />
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

    case 'point_machine_clamp':
      return (
        <g>
          <rect x="-18" y="-10" width="30" height="20" rx="2" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="1.8" />
          <line x1="-24" y1="-3" x2="22" y2="-3" stroke="#0C2340" strokeWidth="2.2" />
          <line x1="-24" y1="3" x2="22" y2="3" stroke="#0C2340" strokeWidth="2.2" />
          {/* Clamp lock bracket */}
          <rect x="12" y="-7" width="8" height="14" rx="1" fill="#F59E0B" stroke="#0C2340" strokeWidth="1.2" />
          <text x="-3" y="3.5" fontSize="7" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#1E3A8A">
            PM/CL
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

    case 'axle_counter_wheel_sensor':
      return (
        <g>
          <line x1="-22" y1="-6" x2="22" y2="-6" stroke="#475569" strokeWidth="3.5" />
          <rect x="-11" y="-5" width="22" height="14" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.8" />
          <circle cx="-5" cy="2" r="2.4" fill="#D97706" />
          <circle cx="5" cy="2" r="2.4" fill="#D97706" />
          <polygon points="-17,-3 -11,0 -11,4 -17,2" fill="#64748B" />
          <polygon points="17,-3 11,0 11,4 17,2" fill="#64748B" />
          <text x="0" y="16" fontSize="6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#92400E">
            MSDAC
          </text>
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

    case 'track_lead_junction_box':
      return (
        <g>
          <line x1="-18" y1="-14" x2="18" y2="-14" stroke="#64748B" strokeWidth="3" />
          <path d="M -6,-4 L -6,-14 M 6,-4 L 6,-14" stroke="#DC2626" strokeWidth="1.6" />
          <rect x="-11" y="-4" width="22" height="18" rx="2" fill="#CBD5E1" stroke="#0C2340" strokeWidth="1.8" />
          <polygon points="-13,-4 0,-10 13,-4" fill="#0C2340" />
          <text x="0" y="8" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            TLJB
          </text>
          <line x1="-12" y1="16" x2="12" y2="16" stroke="#475569" strokeWidth="2.5" />
        </g>
      );

    case 'fouling_mark':
      return (
        <g>
          <line x1="-12" y1="16" x2="12" y2="16" stroke="#475569" strokeWidth="3" />
          <rect x="-7" y="-8" width="14" height="24" rx="1.5" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1.8" />
          <rect x="-7" y="-8" width="14" height="7" fill="#0C2340" />
          <text x="0" y="9" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            FM
          </text>
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

    case 'ofc_cable_marker':
      return (
        <g>
          <line x1="-10" y1="18" x2="10" y2="18" stroke="#475569" strokeWidth="2.8" />
          <rect x="-8" y="-8" width="16" height="26" rx="2" fill="#FB923C" stroke="#C2410C" strokeWidth="1.8" />
          <path d="M -8,-8 C -8,-14 8,-14 8,-8 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1.6" />
          <text x="0" y="9" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#FFFFFF">
            OFC
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

    case 'ips_room':
      return (
        <g>
          <line x1="-20" y1="16" x2="20" y2="16" stroke="#475569" strokeWidth="2.8" />
          <rect x="-17" y="-8" width="34" height="24" rx="2" fill="#FEF3C7" stroke="#0C2340" strokeWidth="1.8" />
          <polygon points="-20,-8 0,-18 20,-8" fill="#B45309" stroke="#0C2340" strokeWidth="1.5" />
          <path d="M 0,-4 L -4,3 L 1,3 L -1,9 L 5,2 L 0,2 Z" fill="#DC2626" />
          <text x="0" y="12" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#78350F">
            IPS
          </text>
        </g>
      );

    case 'emergency_socket_pillar':
      return (
        <g>
          <line x1="-9" y1="18" x2="9" y2="18" stroke="#475569" strokeWidth="2.8" />
          <rect x="-7" y="-4" width="14" height="22" rx="2" fill="#E2E8F0" stroke="#0C2340" strokeWidth="1.8" />
          <path d="M -7,-4 C -7,-12 7,-12 7,-4 Z" fill="#DC2626" stroke="#0C2340" strokeWidth="1.6" />
          <rect x="-4" y="2" width="8" height="7" rx="1" fill="#0284C7" />
          <text x="0" y="15" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            EC
          </text>
        </g>
      );

    case 'board_shunting_limit':
      return (
        <g>
          <line x1="0" y1="4" x2="0" y2="22" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-6" y1="22" x2="6" y2="22" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-18" y="-18" width="36" height="22" rx="2" fill="#FACC15" stroke="#0C2340" strokeWidth="1.8" />
          <line x1="-16" y1="-16" x2="16" y2="2" stroke="#0C2340" strokeWidth="1.4" />
          <line x1="-16" y1="2" x2="16" y2="-16" stroke="#0C2340" strokeWidth="1.4" />
          <rect x="-10" y="-12" width="20" height="10" rx="1" fill="#FACC15" />
          <text x="0" y="-5" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            SLB
          </text>
        </g>
      );

    case 'board_block_section_limit':
      return (
        <g>
          <line x1="0" y1="4" x2="0" y2="22" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-6" y1="22" x2="6" y2="22" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-18" y="-18" width="36" height="22" rx="2" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1.8" />
          <rect x="-15" y="-15" width="30" height="16" fill="#FEF08A" />
          <text x="0" y="-4.5" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            BSLB
          </text>
        </g>
      );

    case 'board_whistle':
      return (
        <g>
          <line x1="0" y1="4" x2="0" y2="22" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-6" y1="22" x2="6" y2="22" stroke="#0C2340" strokeWidth="2.6" />
          <circle cx="0" cy="-8" r="12" fill="#FACC15" stroke="#0C2340" strokeWidth="2" />
          <text x="0" y="-4.5" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            W/L
          </text>
        </g>
      );

    case 'board_warning':
      return (
        <g>
          <line x1="0" y1="4" x2="0" y2="22" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-6" y1="22" x2="6" y2="22" stroke="#0C2340" strokeWidth="2.6" />
          <rect x="-16" y="-18" width="32" height="22" rx="2" fill="#FACC15" stroke="#0C2340" strokeWidth="1.8" />
          <line x1="-14" y1="2" x2="-2" y2="-16" stroke="#0C2340" strokeWidth="2.2" />
          <line x1="-5" y1="2" x2="7" y2="-16" stroke="#0C2340" strokeWidth="2.2" />
          <line x1="4" y1="2" x2="16" y2="-14" stroke="#0C2340" strokeWidth="2.2" />
        </g>
      );

    case 'board_speed_indicator':
      return (
        <g>
          <line x1="0" y1="4" x2="0" y2="22" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-6" y1="22" x2="6" y2="22" stroke="#0C2340" strokeWidth="2.6" />
          <polygon points="0,-22 15,2 -15,2" fill="#FACC15" stroke="#0C2340" strokeWidth="1.8" />
          <text x="0" y="-3" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            30
          </text>
          <circle cx="14" cy="-11" r="5" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1" />
          <text x="14" y="-9.2" fontSize="4.2" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            T/P
          </text>
        </g>
      );

    case 'solar_panel_array':
      return (
        <g>
          <line x1="0" y1="6" x2="0" y2="22" stroke="#0C2340" strokeWidth="2.4" />
          <line x1="-7" y1="22" x2="7" y2="22" stroke="#0C2340" strokeWidth="2.6" />
          <polygon points="-18,-14 16,-18 20,4 -14,8" fill="#1E3A8A" stroke="#0C2340" strokeWidth="1.8" />
          <line x1="-6" y1="-15.5" x2="-2" y2="6.5" stroke="#FACC15" strokeWidth="1" />
          <line x1="5" y1="-17" x2="9" y2="5" stroke="#FACC15" strokeWidth="1" />
          <line x1="-16" y1="-3" x2="18" y2="-7" stroke="#FACC15" strokeWidth="1" />
          <text x="1" y="17" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            SOLAR
          </text>
        </g>
      );

    case 'spd_cabinet':
      return (
        <g>
          <line x1="-10" y1="16" x2="10" y2="16" stroke="#475569" strokeWidth="2.6" />
          <rect x="-11" y="-12" width="22" height="28" rx="2" fill="#F1F5F9" stroke="#0C2340" strokeWidth="1.8" />
          <line x1="-7" y1="-7" x2="7" y2="-7" stroke="#64748B" strokeWidth="1.2" />
          <line x1="-7" y1="-3" x2="7" y2="-3" stroke="#64748B" strokeWidth="1.2" />
          <path d="M 0,0 L -3,6 L 1,6 L -1,11 L 4,4 L 0,4 Z" fill="#EAB308" stroke="#713F12" strokeWidth="0.6" />
          <text x="0" y="12" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
            SPD
          </text>
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
