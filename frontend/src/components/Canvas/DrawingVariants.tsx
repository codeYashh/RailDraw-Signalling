import React from 'react';
import { DrawingProject, DrawingVariant, LayingMethod } from '../../types/drawing';

interface LowerPanelsProps {
  project: DrawingProject;
  variant: DrawingVariant;
  vbWidth: number;
  vbHeight: number;
  totalLength: number;
  cableCount: number;
  cableCore: number;
  cableTypeLabel: string;
  cableConductor: string;
  primaryDepth: number;
  primaryCover: string;
  uniqueMethods: LayingMethod[];
  onOpenEditInfo?: (tab?: 'route' | 'segments' | 'cable' | 'titleBlock') => void;
  isEditMode?: boolean;
}

function getMethodSwatchStyle(method: LayingMethod, isMono: boolean) {
  if (isMono) {
    return { fill: '#F3F4F6', stroke: '#111827', desc: getMethodDescription(method) };
  }
  switch (method) {
    case 'Along Bridge':
      return { fill: '#CCFBF1', stroke: '#0F766E', desc: 'Along Bridge in galvanized cable tray' };
    case 'Culvert crossing':
      return { fill: '#E0F2FE', stroke: '#0284C7', desc: 'Culvert Crossing on GI pipe brackets' };
    case 'Cable Trough':
      return { fill: '#EDE9FE', stroke: '#6D28D9', desc: 'Precast RCC Cable Trough along formation' };
    case 'Cable Tray':
      return { fill: '#CCFBF1', stroke: '#0F766E', desc: 'Hot-Dip Galvanized Cable Tray' };
    case 'Trenchless-HDD':
      return { fill: '#FEE2E2', stroke: '#B91C1C', desc: 'Trenchless / HDD Bore (HDPE Casing)' };
    case 'GI Pipe':
      return { fill: '#DBEAFE', stroke: '#1D4ED8', desc: '100mm GI Pipe Encasement' };
    case 'RCC Pipe':
      return { fill: '#E2E8F0', stroke: '#475569', desc: '150mm RCC Pipe NP-2 Encasement' };
    case 'HDPE Pipe':
      return { fill: '#DBEAFE', stroke: '#0284C7', desc: '110mm DWC HDPE Duct' };
    case 'Track crossing':
    case 'Rail crossing':
      return { fill: '#FEF3C7', stroke: '#B45309', desc: 'Track Crossing under rails & sleepers' };
    case 'Road crossing':
      return { fill: '#E2E8F0', stroke: '#334155', desc: 'Road Crossing via GI/HDD casing' };
    default:
      return { fill: '#F1F5F9', stroke: '#0C2340', desc: 'Normal Trenching (1.0 m depth, Class-II Brick)' };
  }
}

function getMethodDescription(method: LayingMethod): string {
  switch (method) {
    case 'Along Bridge':
      return 'Along Bridge in galvanized cable tray';
    case 'Culvert crossing':
      return 'Culvert Crossing on GI pipe brackets';
    case 'Cable Trough':
      return 'Precast RCC Cable Trough along formation';
    case 'Cable Tray':
      return 'Hot-Dip Galvanized Cable Tray';
    case 'Trenchless-HDD':
      return 'Trenchless / HDD Bore (HDPE Casing)';
    case 'GI Pipe':
      return '100mm GI Pipe Encasement';
    case 'RCC Pipe':
      return '150mm RCC Pipe NP-2 Encasement';
    case 'HDPE Pipe':
      return '110mm DWC HDPE Duct';
    case 'Track crossing':
    case 'Rail crossing':
      return 'Track Crossing under rails & sleepers';
    case 'Road crossing':
      return 'Road Crossing via GI/HDD casing';
    default:
      return 'Normal Trenching (1.0 m depth, Class-II Brick)';
  }
}

const LegendAndNotesCard: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  project: DrawingProject;
  uniqueMethods: LayingMethod[];
  isMono: boolean;
}> = ({ x, y, width, height, project, uniqueMethods, isMono }) => {
  const headerBg = isMono ? '#111827' : '#0C2340';
  const borderCol = isMono ? '#111827' : '#0C2340';
  const placedCount = (project.placedSymbols || []).length;

  const customNotes = (project.settings?.customNotes || []).filter((n) => n.trim().length > 0);
  const notes =
    customNotes.length > 0
      ? customNotes.slice(0, 3)
      : [
          '1. Cable Route Markers (C.M.) installed every 50 m & track bends.',
          '2. Minimum bending radius of cable shall not be less than 15D.',
          `3. Route: ${project.segments.length} segment(s) · ${placedCount} S&T symbol(s) · IRSEM Part-II.`,
        ];

  return (
    <g transform={`translate(${x}, ${y})`} id="panel-legend-notes">
      <rect x="0" y="0" width={width} height={height} fill="#FFFFFF" stroke={borderCol} strokeWidth="1.5" rx="6" />
      <path d={`M 0 6 Q 0 0 6 0 L ${width - 6} 0 Q ${width} 0 ${width} 6 L ${width} 30 L 0 30 Z`} fill={headerBg} />
      <text x="16" y="19.5" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.4px">
        GENERAL NOTES &amp; DRAWING LEGEND
      </text>

      {/* Dynamic Legend Rows */}
      <g transform="translate(18, 44)">
        {uniqueMethods.slice(0, 4).map((m, idx) => {
          const sw = getMethodSwatchStyle(m, isMono);
          const rowY = idx * 24;
          return (
            <g key={m} transform={`translate(0, ${rowY})`}>
              <rect x="0" y="0" width="38" height="14" fill={sw.fill} stroke={sw.stroke} strokeWidth="1.6" rx="2" />
              {m === 'Trenchless-HDD' && (
                <line x1="6" y1="13" x2="18" y2="1" stroke={sw.stroke} strokeWidth="1.4" />
              )}
              {(m === 'GI Pipe' || m === 'RCC Pipe' || m === 'HDPE Pipe') && (
                <line x1="2" y1="7" x2="36" y2="7" stroke={sw.stroke} strokeWidth="1.2" strokeDasharray="4,2" />
              )}
              <text x="48" y="11" fontSize="10.5" fontWeight="600" fontFamily="sans-serif" fill="#1E293B">
                {sw.desc.slice(0, width < 380 ? 34 : 52)}
              </text>
            </g>
          );
        })}
      </g>

      <line x1="16" y1={height - 102} x2={width - 16} y2={height - 102} stroke="#CBD5E1" strokeWidth="1" />

      {/* General Notes */}
      <g transform={`translate(18, ${height - 84})`}>
        {notes.map((note, idx) => (
          <text
            key={idx}
            x="0"
            y={idx * 24}
            fontSize="10.2"
            fontWeight="500"
            fontFamily="sans-serif"
            fill="#1E293B"
          >
            {note.length > (width < 380 ? 48 : 66)
              ? `${note.slice(0, width < 380 ? 45 : 63)}...`
              : note}
          </text>
        ))}
      </g>
    </g>
  );
};

export const DiagramLowerPanels: React.FC<LowerPanelsProps> = ({
  project,
  variant,
  vbWidth,
  totalLength,
  cableCount,
  cableCore,
  cableTypeLabel,
  cableConductor,
  primaryDepth,
  primaryCover,
  uniqueMethods,
  onOpenEditInfo,
  isEditMode = false,
}) => {
  const isMono = variant === 'blueprint';
  const headerBg = isMono ? '#111827' : '#0C2340';
  const borderCol = isMono ? '#111827' : '#0C2340';
  const topY = 294;
  const panelH = 280;

  // Option 2: Route Segment & Chainage Table + Legend
  if (variant === 'schematic') {
    const leftW = 532;
    const rightX = 28 + leftW + 16;
    const rightW = vbWidth - 28 - rightX;

    let runningCh = 0;
    const rows = project.segments.slice(0, 6).map((seg, idx) => {
      const len = Number(seg.length) || 0;
      const startCh = runningCh;
      runningCh = Math.round((runningCh + len) * 10) / 10;
      return { seg, idx, len, startCh, endCh: runningCh };
    });

    return (
      <g id="lower-panels-table">
        {/* Left: Segment Schedule Table */}
        <g
          transform={`translate(28, ${topY})`}
          style={{ cursor: isEditMode ? 'pointer' : 'default' }}
          onClick={(e) => {
            if (isEditMode && onOpenEditInfo) {
              e.stopPropagation();
              onOpenEditInfo('segments');
            }
          }}
        >
          <rect x="0" y="0" width={leftW} height={panelH} fill="#FFFFFF" stroke={borderCol} strokeWidth="1.5" rx="6" />
          <path d={`M 0 6 Q 0 0 6 0 L ${leftW - 6} 0 Q ${leftW} 0 ${leftW} 6 L ${leftW} 30 L 0 30 Z`} fill={headerBg} />
          <text x="16" y="19.5" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.4px">
            ROUTE SEGMENT &amp; CHAINAGE SCHEDULE — {cableCount} × {cableCore}C {cableTypeLabel.toUpperCase()}
          </text>

          {/* Table Header */}
          <rect x="1" y="31" width={leftW - 2} height="26" fill="#F1F5F9" />
          <line x1="0" y1="57" x2={leftW} y2="57" stroke="#CBD5E1" strokeWidth="1" />
          <text x="14" y="48" fontSize="9.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">SEG</text>
          <text x="56" y="48" fontSize="9.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">CHAINAGE</text>
          <text x="170" y="48" fontSize="9.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">LENGTH</text>
          <text x="242" y="48" fontSize="9.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">LAYING METHOD</text>
          <text x="392" y="48" fontSize="9.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">DEPTH</text>
          <text x="448" y="48" fontSize="9.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">COVER</text>

          {rows.map(({ seg, idx, len, startCh, endCh }, rIdx) => {
            const ry = 57 + rIdx * 32;
            return (
              <g key={seg.id || idx} transform={`translate(0, ${ry})`}>
                {rIdx % 2 === 1 && <rect x="1" y="0" width={leftW - 2} height="32" fill="#F8FAFC" />}
                <line x1="0" y1="32" x2={leftW} y2="32" stroke="#E2E8F0" strokeWidth="1" />
                <text x="18" y="20" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#0C2340">
                  {idx + 1}
                </text>
                <text x="56" y="20" fontSize="10" fontWeight="600" fontFamily="monospace" fill="#334155">
                  {startCh}–{endCh} m
                </text>
                <text x="170" y="20" fontSize="10.5" fontWeight="800" fontFamily="monospace" fill="#0C2340">
                  {len} m
                </text>
                <text x="242" y="20" fontSize="10" fontWeight="700" fontFamily="sans-serif" fill="#0F172A">
                  {seg.layingMethod}
                </text>
                <text x="392" y="20" fontSize="10" fontWeight="600" fontFamily="monospace" fill="#334155">
                  {(Number(seg.depth) || 0).toFixed(1)} m
                </text>
                <text x="448" y="20" fontSize="9" fontWeight="500" fontFamily="sans-serif" fill="#475569">
                  {(seg.coverType || 'Brick').slice(0, 14)}
                </text>
              </g>
            );
          })}

          <text x="16" y={panelH - 12} fontSize="9.5" fontWeight="700" fontFamily="sans-serif" fill="#475569">
            TOTAL ROUTE LENGTH: {totalLength} m  ·  CABLE: {cableConductor} Armoured (IRSEM Part-II)
          </text>
        </g>

        <LegendAndNotesCard
          x={rightX}
          y={topY}
          width={rightW}
          height={panelH}
          project={project}
          uniqueMethods={uniqueMethods}
          isMono={false}
        />
      </g>
    );
  }

  // Option 3: Expanded Track-to-Trench Cross-Section (3.5 m Offset) + Legend & Notes
  if (variant === 'detailed') {
    const leftW = 486;
    const rightX = 28 + leftW + 16;
    const rightW = vbWidth - 28 - rightX;

    return (
      <g id="lower-panels-track-trench">
        <g
          transform={`translate(28, ${topY})`}
          style={{ cursor: isEditMode ? 'pointer' : 'default' }}
          onClick={(e) => {
            if (isEditMode && onOpenEditInfo) {
              e.stopPropagation();
              onOpenEditInfo('cable');
            }
          }}
        >
          <rect x="0" y="0" width={leftW} height={panelH} fill="#FFFFFF" stroke={borderCol} strokeWidth="1.5" rx="6" />
          <path d={`M 0 6 Q 0 0 6 0 L ${leftW - 6} 0 Q ${leftW} 0 ${leftW} 6 L ${leftW} 30 L 0 30 Z`} fill={headerBg} />
          <text x="16" y="19.5" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.4px">
            DETAIL &apos;A&apos; — TRACK TO TRENCH SECTION (3.5 m MIN OFFSET)
          </text>

          {/* Ground Level */}
          <line x1="20" y1="112" x2="310" y2="112" stroke="#334155" strokeWidth="1.8" />
          <rect x="20" y="112" width="290" height="8" fill="url(#earthHatch)" />
          <text x="20" y="105" fontSize="9" fontWeight="700" fontFamily="sans-serif" fill="#475569">G.L.</text>

          {/* Left: BG Track Formation */}
          <polygon points="40,112 146,112 132,90 54,90" fill="url(#ballastPattern)" stroke="#64748B" strokeWidth="1" />
          <rect x="58" y="84" width="70" height="6" fill="#475569" rx="1" />
          <rect x="72" y="75" width="7" height="9" fill="#0F172A" />
          <rect x="107" y="75" width="7" height="9" fill="#0F172A" />
          <text x="93" y="64" fontSize="8.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340" textAnchor="middle">
            BG TRACK (1676 mm)
          </text>

          {/* 3.5 m Min Offset Arrow */}
          <line x1="93" y1="128" x2="245" y2="128" stroke="#0284C7" strokeWidth="1.3" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
          <rect x="136" y="120" width="66" height="14" fill="#FFFFFF" />
          <text x="169" y="130" fontSize="9" fontWeight="800" fontFamily="sans-serif" fill="#0284C7" textAnchor="middle">
            3.5 m MIN
          </text>

          {/* Right: Trench Cut */}
          <g transform="translate(245, 112)">
            <polyline points="-34,0 -30,118 30,118 34,0" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1.8" />
            <rect x="-29" y="82" width="58" height="35" fill="#FEF3C7" />
            <rect x="-29" y="82" width="58" height="35" fill="url(#sandPattern)" />
            <rect x="-28" y="60" width="56" height="16" fill="#C2410C" stroke="#7C2D12" strokeWidth="1" rx="1" />
            <text x="0" y="71" fontSize="7" fontWeight="800" fill="#FFFFFF" textAnchor="middle">CLASS-II BRICK</text>
            {Array.from({ length: Math.min(Math.max(cableCount, 1), 6) }).map((_, i) => (
              <circle key={i} cx={-16 + (i % 3) * 16} cy={95 + Math.floor(i / 3) * 13} r="4.5" fill="#0C2340" stroke="#38BDF8" strokeWidth="1" />
            ))}
            <line x1="46" y1="0" x2="46" y2="118" stroke="#0C2340" strokeWidth="1.2" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
            <text x="52" y="64" fontSize="9.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">
              {primaryDepth.toFixed(1)} m
            </text>
          </g>

          {/* Cable Details Column on Right */}
          <g transform="translate(330, 56)">
            <text x="0" y="14" fontSize="11.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">
              {cableCount} Nos. × {cableCore} Core
            </text>
            <text x="0" y="32" fontSize="10.5" fontWeight="700" fontFamily="sans-serif" fill="#1D4ED8">
              {cableTypeLabel} Cable
            </text>
            <text x="0" y="50" fontSize="9.5" fontWeight="600" fontFamily="sans-serif" fill="#475569">
              {cableConductor} Armoured
            </text>
            <line x1="0" y1="62" x2="140" y2="62" stroke="#CBD5E1" strokeWidth="1" />
            <text x="0" y="82" fontSize="9.5" fontWeight="500" fontFamily="sans-serif" fill="#334155">
              • Depth: {primaryDepth.toFixed(1)} m below G.L.
            </text>
            <text x="0" y="102" fontSize="9.5" fontWeight="500" fontFamily="sans-serif" fill="#334155">
              • Sand Bedding: 50 mm
            </text>
            <text x="0" y="122" fontSize="9.5" fontWeight="500" fontFamily="sans-serif" fill="#334155">
              • Cover: {primaryCover.slice(0, 18)}
            </text>
            <text x="0" y="142" fontSize="9.5" fontWeight="500" fontFamily="sans-serif" fill="#334155">
              • Ref: IRSEM Part-II
            </text>
          </g>
        </g>

        <LegendAndNotesCard
          x={rightX}
          y={topY}
          width={rightW}
          height={panelH}
          project={project}
          uniqueMethods={uniqueMethods}
          isMono={false}
        />
      </g>
    );
  }

  // Option 1 ('standard') & Option 4 ('blueprint'): Classic Detail 'A' + General Notes & Legend
  const cardW = 444;
  const rightX = 28 + cardW + 16;

  return (
    <g id={isMono ? 'lower-panels-blueprint' : 'lower-panels-standard'}>
      {/* Left Card: DETAIL 'A' — CABLE TRENCH CROSS-SECTION */}
      <g
        transform={`translate(28, ${topY})`}
        style={{ cursor: isEditMode ? 'pointer' : 'default' }}
        onClick={(e) => {
          if (isEditMode && onOpenEditInfo) {
            e.stopPropagation();
            onOpenEditInfo('cable');
          }
        }}
      >
        <rect x="0" y="0" width={cardW} height={panelH} fill="#FFFFFF" stroke={borderCol} strokeWidth="1.5" rx="6" />
        <path d={`M 0 6 Q 0 0 6 0 L ${cardW - 6} 0 Q ${cardW} 0 ${cardW} 6 L ${cardW} 30 L 0 30 Z`} fill={headerBg} />
        <text x="16" y="19.5" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.4px">
          DETAIL &apos;A&apos; — CABLE TRENCH CROSS-SECTION
        </text>

        {/* Cross-section drawing on left half of card */}
        <g transform="translate(86, 80)">
          <line x1="-58" y1="0" x2="58" y2="0" stroke={isMono ? '#111827' : '#334155'} strokeWidth="1.8" />
          <rect x="-58" y="-8" width="116" height="8" fill="url(#earthHatch)" />
          <text x="-62" y="-2" fontSize="9.5" fontWeight="700" fontFamily="sans-serif" fill={isMono ? '#111827' : '#334155'} textAnchor="end">
            G.L.
          </text>

          <polyline
            points="-36,0 -32,126 32,126 36,0"
            fill="#FFFFFF"
            stroke={isMono ? '#111827' : '#0C2340'}
            strokeWidth="1.8"
          />

          {/* Sand bedding */}
          <rect x="-31" y="88" width="62" height="37" fill={isMono ? '#F8FAFC' : '#FEF3C7'} />
          <rect x="-31" y="88" width="62" height="37" fill="url(#sandPattern)" />

          {/* Class-II Protective Brick */}
          <rect
            x="-30"
            y="66"
            width="60"
            height="17"
            fill={isMono ? '#FFFFFF' : '#C2410C'}
            stroke={isMono ? '#111827' : '#7C2D12'}
            strokeWidth="1.2"
            rx="1"
          />
          <text
            x="0"
            y="77.5"
            fontSize="7.2"
            fontWeight="800"
            fontFamily="sans-serif"
            fill={isMono ? '#111827' : '#FFFFFF'}
            textAnchor="middle"
          >
            CLASS-II BRICK
          </text>

          {/* Cable circles */}
          {Array.from({ length: Math.min(Math.max(cableCount, 1), 6) }).map((_, i) => (
            <circle
              key={i}
              cx={-17 + (i % 3) * 17}
              cy={101 + Math.floor(i / 3) * 14}
              r="4.5"
              fill={isMono ? '#111827' : '#7C2D12'}
              stroke={isMono ? '#111827' : '#0C2340'}
              strokeWidth="1.2"
            />
          ))}

          {/* Depth dimension */}
          <line
            x1="48"
            y1="0"
            x2="48"
            y2="126"
            stroke={isMono ? '#111827' : '#0C2340'}
            strokeWidth="1.2"
            markerStart="url(#dimArrowStart)"
            markerEnd="url(#dimArrowEnd)"
          />
          <text x="55" y="67" fontSize="10.5" fontWeight="800" fontFamily="sans-serif" fill={isMono ? '#111827' : '#0C2340'}>
            {primaryDepth.toFixed(1)} m
          </text>
        </g>

        {/* Cable Spec Details on right half of card */}
        <g transform="translate(198, 66)">
          <text x="0" y="14" fontSize="12.5" fontWeight="800" fontFamily="sans-serif" fill={isMono ? '#111827' : '#0C2340'}>
            {cableCount} Nos. x {cableCore} Core {cableTypeLabel}
          </text>
          <text x="0" y="34" fontSize="11" fontWeight="700" fontFamily="sans-serif" fill={isMono ? '#374151' : '#1D4ED8'}>
            {cableConductor} Armoured Railway Cable
          </text>

          <line x1="0" y1="48" x2="225" y2="48" stroke="#E2E8F0" strokeWidth="1" />

          <text x="0" y="70" fontSize="10" fontWeight="500" fontFamily="sans-serif" fill="#334155">
            • Trench Depth: {primaryDepth.toFixed(1)} m below G.L. (Min)
          </text>
          <text x="0" y="92" fontSize="10" fontWeight="500" fontFamily="sans-serif" fill="#334155">
            • Sand Bedding: 50 mm clean river sand layer
          </text>
          <text x="0" y="114" fontSize="10" fontWeight="500" fontFamily="sans-serif" fill="#334155">
            • Protection: {primaryCover.slice(0, 30)}
          </text>
          <text x="0" y="136" fontSize="10" fontWeight="500" fontFamily="sans-serif" fill="#334155">
            • Ref Standard: IRSEM Part-II / RDSO
          </text>
        </g>
      </g>

      <LegendAndNotesCard
        x={rightX}
        y={topY}
        width={cardW}
        height={panelH}
        project={project}
        uniqueMethods={uniqueMethods}
        isMono={isMono}
      />
    </g>
  );
};
