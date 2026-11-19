import React from 'react';
import { DrawingProject } from '../../types/drawing';

interface VariantSheetProps {
  project: DrawingProject;
  vbWidth: number;
  vbHeight: number;
  totalLength: number;
  cableCount: number;
  cableCore: number;
  cableTypeLabel: string;
  cableConductor: string;
  primaryDepth: number;
  primaryCover: string;
}

function computeSegmentWidths(
  project: DrawingProject,
  availableWidth: number,
  totalLength: number,
  minSegPx: number
): number[] {
  const totalSegments = project.segments.length || 1;
  const totalMinRequired = totalSegments * minSegPx;
  const widths: number[] = [];

  if (totalMinRequired <= availableWidth) {
    const remaining = availableWidth - totalMinRequired;
    project.segments.forEach((seg) => {
      const segLen = Number(seg.length) || 10;
      widths.push(Math.round(minSegPx + (segLen / totalLength) * remaining));
    });
  } else {
    project.segments.forEach((seg) => {
      const segLen = Number(seg.length) || 10;
      widths.push(Math.round((segLen / totalLength) * availableWidth));
    });
  }

  const sum = widths.reduce((a, b) => a + b, 0);
  if (widths.length > 0 && sum !== availableWidth) {
    widths[widths.length - 1] += availableWidth - sum;
  }
  return widths;
}

export const FieldSchematicSheet: React.FC<VariantSheetProps> = ({
  project,
  vbWidth,
  vbHeight,
  totalLength,
  cableCount,
  cableCore,
  cableTypeLabel,
  cableConductor,
  primaryDepth,
}) => {
  const startX = 92;
  const endX = vbWidth - 92;
  const availW = endX - startX;
  const routeY = 172;
  const widths = computeSegmentWidths(project, availW, totalLength, 110);

  let cumulativeLen = 0;
  let cursorX = startX;
  const segmentGeoms = project.segments.map((seg, idx) => {
    const len = Number(seg.length) || 0;
    const w = widths[idx] || 100;
    const x0 = cursorX;
    const x1 = cursorX + w;
    const chStart = cumulativeLen;
    cumulativeLen = Math.round((cumulativeLen + len) * 10) / 10;
    cursorX = x1;
    return { seg, idx, x0, x1, midX: (x0 + x1) / 2, w, len, chStart, chEnd: cumulativeLen };
  });

  const visibleRows = segmentGeoms.slice(0, 6);

  return (
    <g id="variant-field-schematic">
      {/* Outer Frame */}
      <rect x="14" y="14" width={vbWidth - 28} height={vbHeight - 28} fill="#FFFFFF" stroke="#0F2942" strokeWidth="2" rx="3" />

      {/* Top Specification Header Band */}
      <rect x="14" y="14" width={vbWidth - 28} height="62" fill="#0F2942" />
      <text x="34" y="38" fill="#CBD5E1" fontSize="11" fontWeight="600" fontFamily="sans-serif" letterSpacing="0.6px">
        {(project.metadata.railwayZone || 'INDIAN RAILWAYS').toUpperCase()} · FIELD SCHEMATIC ROUTE SHEET
      </text>
      <text x="34" y="61" fill="#FFFFFF" fontSize="17" fontWeight="700" fontFamily="sans-serif">
        {project.startNode.id} TO {project.endNode.id} — {totalLength} m ({cableCount} × {cableCore}C {cableTypeLabel})
      </text>
      <text x={vbWidth - 34} y="40" fill="#F8FAFC" fontSize="11" fontWeight="600" fontFamily="monospace" textAnchor="end">
        DRG: {project.metadata.drawingNumber || 'IR/S&T/CAD'} ({project.metadata.revision || 'R0'})
      </text>
      <text x={vbWidth - 34} y="59" fill="#CBD5E1" fontSize="10.5" fontWeight="600" fontFamily="sans-serif" textAnchor="end">
        {cableConductor} Armoured · Min Depth {primaryDepth.toFixed(1)} m
      </text>

      {/* Schematic Linear Route Strip with Cumulative Chainages */}
      <g id="schematic-strip">
        {/* Background band */}
        <rect x="34" y="96" width={vbWidth - 68} height="162" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" rx="4" />
        <text x="48" y="116" fill="#475569" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5px">
          CUMULATIVE CHAINAGE ALIGNMENT (METRES FROM {project.startNode.id})
        </text>

        {/* Endpoint Terminals */}
        <g transform={`translate(${startX}, ${routeY})`}>
          <circle cx="0" cy="0" r="9" fill="#0F2942" />
          <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
          <text x="0" y="-20" fontSize="11.5" fontWeight="800" fontFamily="sans-serif" fill="#0F2942" textAnchor="middle">
            {project.startNode.id.slice(0, 14)}
          </text>
          <text x="0" y="34" fontSize="10" fontWeight="700" fontFamily="monospace" fill="#475569" textAnchor="middle">
            Ch. 0 m
          </text>
        </g>

        <g transform={`translate(${endX}, ${routeY})`}>
          <circle cx="0" cy="0" r="9" fill="#0F2942" />
          <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
          <text x="0" y="-20" fontSize="11.5" fontWeight="800" fontFamily="sans-serif" fill="#0F2942" textAnchor="middle">
            {project.endNode.id.slice(0, 14)}
          </text>
          <text x="0" y="34" fontSize="10" fontWeight="700" fontFamily="monospace" fill="#0F2942" textAnchor="middle">
            Ch. {totalLength} m
          </text>
        </g>

        {/* Segments */}
        {segmentGeoms.map(({ seg, idx, x0, x1, midX, w, len, chEnd }) => {
          const m = seg.layingMethod;
          const isHdd = m === 'Trenchless-HDD' || m.includes('HDD');
          const isPipe = m.includes('Pipe');
          const isCross = m.includes('crossing');
          const stroke = isHdd ? '#B91C1C' : isPipe ? '#1D4ED8' : isCross ? '#B45309' : '#0F2942';
          const fill = isHdd ? '#FEE2E2' : isPipe ? '#DBEAFE' : isCross ? '#FEF3C7' : '#E2E8F0';
          const staggerY = idx % 2 === 1 ? routeY - 36 : routeY - 22;

          return (
            <g key={seg.id || idx}>
              <rect
                x={x0 + 2}
                y={routeY - 10}
                width={Math.max(w - 4, 8)}
                height="20"
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
                rx="2"
              />
              {isHdd && (
                <rect
                  x={x0 + 2}
                  y={routeY - 10}
                  width={Math.max(w - 4, 8)}
                  height="20"
                  fill="url(#hddHatch)"
                />
              )}
              <text
                x={midX}
                y={routeY + 4}
                fontSize="10.5"
                fontWeight="800"
                fontFamily="monospace"
                fill="#0F172A"
                textAnchor="middle"
              >
                {len} m
              </text>
              <text
                x={midX}
                y={staggerY}
                fontSize="10"
                fontWeight="700"
                fontFamily="sans-serif"
                fill={stroke}
                textAnchor="middle"
              >
                {m.toUpperCase()}
              </text>

              {idx < segmentGeoms.length - 1 && (
                <g transform={`translate(${x1}, ${routeY})`}>
                  <line x1="0" y1="-16" x2="0" y2="20" stroke="#64748B" strokeWidth="1.2" strokeDasharray="3,2" />
                  <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" stroke="#0F2942" strokeWidth="1.8" />
                  <text x="0" y="34" fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#475569" textAnchor="middle">
                    {chEnd} m
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Overall Dimension Bar */}
        <g transform={`translate(0, ${routeY + 62})`}>
          <line x1={startX} y1="-7" x2={startX} y2="7" stroke="#0F2942" strokeWidth="1.5" />
          <line x1={endX} y1="-7" x2={endX} y2="7" stroke="#0F2942" strokeWidth="1.5" />
          <line
            x1={startX}
            y1="0"
            x2={endX}
            y2="0"
            stroke="#0F2942"
            strokeWidth="1.5"
            markerStart="url(#dimArrowStart)"
            markerEnd="url(#dimArrowEnd)"
          />
          <rect x={vbWidth / 2 - 110} y="-10" width="220" height="20" fill="#F8FAFC" />
          <text x={vbWidth / 2} y="4" fontSize="12" fontWeight="800" fontFamily="sans-serif" fill="#0F2942" textAnchor="middle">
            TOTAL ROUTE LENGTH : {totalLength} m
          </text>
        </g>
      </g>

      {/* Structured Route Segment & Cable Schedule Table */}
      <g transform="translate(34, 276)">
        <rect x="0" y="0" width={vbWidth - 68} height="228" fill="#FFFFFF" stroke="#0F2942" strokeWidth="1.5" rx="3" />
        <rect x="0" y="0" width={vbWidth - 68} height="28" fill="#EEF1F5" />
        <line x1="0" y1="28" x2={vbWidth - 68} y2="28" stroke="#0F2942" strokeWidth="1.2" />

        <text x="14" y="18" fontSize="10" fontWeight="800" fontFamily="sans-serif" fill="#0F2942">SEG</text>
        <text x="68" y="18" fontSize="10" fontWeight="800" fontFamily="sans-serif" fill="#0F2942">CHAINAGE</text>
        <text x="196" y="18" fontSize="10" fontWeight="800" fontFamily="sans-serif" fill="#0F2942">LENGTH</text>
        <text x="288" y="18" fontSize="10" fontWeight="800" fontFamily="sans-serif" fill="#0F2942">LAYING METHOD</text>
        <text x="488" y="18" fontSize="10" fontWeight="800" fontFamily="sans-serif" fill="#0F2942">DEPTH</text>
        <text x="572" y="18" fontSize="10" fontWeight="800" fontFamily="sans-serif" fill="#0F2942">PROTECTIVE COVER / CASING</text>

        {visibleRows.map(({ seg, idx, len, chStart, chEnd }, rIdx) => {
          const y = 28 + rIdx * 32;
          return (
            <g key={seg.id || idx} transform={`translate(0, ${y})`}>
              {rIdx % 2 === 1 && <rect x="1" y="0" width={vbWidth - 70} height="32" fill="#F8FAFC" />}
              <line x1="0" y1="32" x2={vbWidth - 68} y2="32" stroke="#E2E8F0" strokeWidth="1" />
              <text x="18" y="20" fontSize="11" fontWeight="700" fontFamily="monospace" fill="#0F2942">
                {idx + 1}
              </text>
              <text x="68" y="20" fontSize="11" fontWeight="600" fontFamily="monospace" fill="#334155">
                {chStart} m – {chEnd} m
              </text>
              <text x="196" y="20" fontSize="11" fontWeight="800" fontFamily="monospace" fill="#0F2942">
                {len} m
              </text>
              <text x="288" y="20" fontSize="11" fontWeight="700" fontFamily="sans-serif" fill="#0F172A">
                {seg.layingMethod}
              </text>
              <text x="488" y="20" fontSize="11" fontWeight="600" fontFamily="monospace" fill="#334155">
                {(Number(seg.depth) || 1.0).toFixed(1)} m
              </text>
              <text x="572" y="20" fontSize="10.5" fontWeight="500" fontFamily="sans-serif" fill="#334155">
                {(seg.coverType || 'Class II Bricks laid flat').slice(0, 42)}
              </text>
            </g>
          );
        })}
      </g>

      {/* Compact Footer Stamp */}
      <g transform={`translate(34, ${vbHeight - 74})`}>
        <rect x="0" y="0" width={vbWidth - 68} height="44" fill="#F8FAFC" stroke="#0F2942" strokeWidth="1.2" />
        <line x1="230" y1="0" x2="230" y2="44" stroke="#0F2942" strokeWidth="1" />
        <line x1="460" y1="0" x2="460" y2="44" stroke="#0F2942" strokeWidth="1" />
        <line x1="690" y1="0" x2="690" y2="44" stroke="#0F2942" strokeWidth="1" />

        <text x="12" y="16" fontSize="8.5" fontWeight="700" fill="#64748B" fontFamily="sans-serif">CABLE BUNDLE</text>
        <text x="12" y="33" fontSize="11" fontWeight="800" fill="#0F2942" fontFamily="sans-serif">
          {cableCount} Nos. × {cableCore}C {cableTypeLabel}
        </text>

        <text x="242" y="16" fontSize="8.5" fontWeight="700" fill="#64748B" fontFamily="sans-serif">PREPARED / CHECKED</text>
        <text x="242" y="33" fontSize="10.5" fontWeight="700" fill="#0F2942" fontFamily="sans-serif">
          {project.metadata.preparedBy || 'JE/Sig'} · {project.metadata.checkedBy || 'SSE/Sig'}
        </text>

        <text x="472" y="16" fontSize="8.5" fontWeight="700" fill="#64748B" fontFamily="sans-serif">APPROVED BY</text>
        <text x="472" y="33" fontSize="10.5" fontWeight="700" fill="#0F2942" fontFamily="sans-serif">
          {project.metadata.approvedByDesig || 'Sr. DSTE / Dy. CSTE'}
        </text>

        <text x="702" y="16" fontSize="8.5" fontWeight="700" fill="#64748B" fontFamily="sans-serif">STANDARD / DATE</text>
        <text x="702" y="33" fontSize="10.5" fontWeight="700" fill="#0F2942" fontFamily="sans-serif">
          IRSEM Part-II · {project.metadata.date || '2026'}
        </text>
      </g>
    </g>
  );
};

export const MonochromeBlueprintSheet: React.FC<VariantSheetProps> = ({
  project,
  vbWidth,
  vbHeight,
  totalLength,
  cableCount,
  cableCore,
  cableTypeLabel,
  cableConductor,
  primaryDepth,
  primaryCover,
}) => {
  // 20mm equivalent left filing margin (38px), right vertical official title block (230px)
  const frameLeft = 38;
  const frameTop = 16;
  const frameW = vbWidth - frameLeft - 16;
  const frameH = vbHeight - 32;

  const titleBlockW = 228;
  const drawRight = frameLeft + frameW - titleBlockW;
  const routeStartX = frameLeft + 62;
  const routeEndX = drawRight - 62;
  const availW = routeEndX - routeStartX;
  const routeY = 178;

  const widths = computeSegmentWidths(project, availW, totalLength, 88);
  let curX = routeStartX + 18;
  const netTotalW = availW - 36;
  const netWidths = widths.map((w) => Math.round((w / availW) * netTotalW));

  return (
    <g id="variant-print-blueprint">
      <defs>
        <pattern id="monoHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#111827" strokeWidth="1.6" />
        </pattern>
        <pattern id="monoCrossHatch" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 0 0 L 8 8 M 8 0 L 0 8" stroke="#111827" strokeWidth="0.9" />
        </pattern>
      </defs>

      {/* Left Filing Margin + Punch Marks */}
      <rect x="0" y="0" width={vbWidth} height={vbHeight} fill="#FFFFFF" />
      <line x1="20" y1="24" x2="20" y2={vbHeight - 24} stroke="#94A3B8" strokeWidth="1" strokeDasharray="4,4" />
      <circle cx="20" cy={vbHeight * 0.34} r="5" fill="none" stroke="#64748B" strokeWidth="1" />
      <circle cx="20" cy={vbHeight * 0.66} r="5" fill="none" stroke="#64748B" strokeWidth="1" />
      <text
        x="14"
        y={vbHeight / 2}
        fontSize="8"
        fontWeight="600"
        fill="#64748B"
        fontFamily="monospace"
        textAnchor="middle"
        transform={`rotate(-90, 14, ${vbHeight / 2})`}
      >
        20 mm FILING MARGIN
      </text>

      {/* Official Double Neat-Line Border */}
      <rect x={frameLeft} y={frameTop} width={frameW} height={frameH} fill="none" stroke="#111827" strokeWidth="2.2" />
      <rect x={frameLeft + 4} y={frameTop + 4} width={frameW - 8} height={frameH - 8} fill="none" stroke="#111827" strokeWidth="0.9" />

      {/* Drawing Header inside main drafting zone */}
      <text x={frameLeft + 18} y={frameTop + 26} fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="#111827">
        SIGNALLING CABLE ROUTE PLAN (MONOCHROME PLOT EDITION)
      </text>
      <text x={frameLeft + 18} y={frameTop + 44} fontSize="14.5" fontWeight="800" fontFamily="sans-serif" fill="#111827">
        {project.startNode.id} TO {project.endNode.id} — {totalLength} METRES
      </text>
      <line x1={frameLeft + 4} y1={frameTop + 54} x2={drawRight} y2={frameTop + 54} stroke="#111827" strokeWidth="1" />

      {/* Parallel Track Centerline */}
      <line
        x1={routeStartX - 24}
        y1="108"
        x2={routeEndX + 24}
        y2="108"
        stroke="#111827"
        strokeWidth="1.2"
        strokeDasharray="14,4,2,4"
      />
      <text x={(routeStartX + routeEndX) / 2} y="100" fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#111827" textAnchor="middle">
        C/L OF NEAREST TRACK (MIN 3.5 m OFFSET)
      </text>

      {/* Monochrome Endpoint Location Boxes */}
      {[
        { x: routeStartX, node: project.startNode, tag: 'START' },
        { x: routeEndX, node: project.endNode, tag: 'END' },
      ].map(({ x, node, tag }) => (
        <g key={tag} transform={`translate(${x}, ${routeY})`}>
          <rect x="-15" y="-22" width="30" height="44" fill="#FFFFFF" stroke="#111827" strokeWidth="2" />
          <polygon points="-18,-22 0,-34 18,-22" fill="#111827" />
          <line x1="0" y1="-22" x2="0" y2="22" stroke="#111827" strokeWidth="1" />
          <text x="0" y="-42" fontSize="11" fontWeight="800" fontFamily="monospace" fill="#111827" textAnchor="middle">
            {node.id.slice(0, 12)}
          </text>
          <text x="0" y="36" fontSize="9" fontWeight="700" fontFamily="monospace" fill="#111827" textAnchor="middle">
            {tag}
          </text>
        </g>
      ))}

      {/* Monochrome Route Segments */}
      {project.segments.map((seg, idx) => {
        const len = Number(seg.length) || 10;
        const w = netWidths[idx] || 88;
        const x0 = curX;
        const x1 = curX + w;
        const midX = x0 + w / 2;
        curX = x1;

        const m = seg.layingMethod;
        const isHdd = m === 'Trenchless-HDD' || m.includes('HDD');
        const isPipe = m.includes('Pipe');
        const isCross = m.includes('crossing');
        const labelY = idx % 2 === 1 ? routeY - 34 : routeY - 20;

        return (
          <g key={seg.id || idx}>
            {isHdd ? (
              <rect x={x0} y={routeY - 9} width={w} height="18" fill="url(#monoHatch)" stroke="#111827" strokeWidth="1.8" />
            ) : isPipe ? (
              <g>
                <rect x={x0} y={routeY - 8} width={w} height="16" fill="#FFFFFF" stroke="#111827" strokeWidth="1.8" />
                <line x1={x0} y1={routeY} x2={x1} y2={routeY} stroke="#111827" strokeWidth="1.2" strokeDasharray="6,3" />
              </g>
            ) : isCross ? (
              <g>
                <rect x={x0} y={routeY - 8} width={w} height="16" fill="url(#monoCrossHatch)" stroke="#111827" strokeWidth="1.8" />
              </g>
            ) : (
              <line x1={x0} y1={routeY} x2={x1} y2={routeY} stroke="#111827" strokeWidth="3.5" />
            )}

            <line x1={x1} y1={routeY - 14} x2={x1} y2={routeY + 14} stroke="#111827" strokeWidth="1.2" />

            <text x={midX} y={labelY} fontSize="9.5" fontWeight="700" fontFamily="monospace" fill="#111827" textAnchor="middle">
              {m.toUpperCase()}
            </text>

            {/* Dimension */}
            <g transform={`translate(0, ${routeY + 34})`}>
              <line x1={x0} y1="-6" x2={x0} y2="6" stroke="#111827" strokeWidth="0.9" />
              <line x1={x1} y1="-6" x2={x1} y2="6" stroke="#111827" strokeWidth="0.9" />
              <line x1={x0} y1="0" x2={x1} y2="0" stroke="#111827" strokeWidth="1.1" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
              <text x={midX} y="-4" fontSize="10.5" fontWeight="800" fontFamily="monospace" fill="#111827" textAnchor="middle">
                {len} m
              </text>
            </g>
          </g>
        );
      })}

      {/* Overall Dimension */}
      <g transform={`translate(0, ${routeY + 68})`}>
        <line x1={routeStartX} y1="-8" x2={routeStartX} y2="8" stroke="#111827" strokeWidth="1.2" />
        <line x1={routeEndX} y1="-8" x2={routeEndX} y2="8" stroke="#111827" strokeWidth="1.2" />
        <line x1={routeStartX} y1="0" x2={routeEndX} y2="0" stroke="#111827" strokeWidth="1.4" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
        <rect x={(routeStartX + routeEndX) / 2 - 90} y="-9" width="180" height="18" fill="#FFFFFF" />
        <text x={(routeStartX + routeEndX) / 2} y="4" fontSize="11.5" fontWeight="800" fontFamily="monospace" fill="#111827" textAnchor="middle">
          TOTAL: {totalLength} METRES
        </text>
      </g>

      {/* Monochrome Trench Section + Notes Panel */}
      <g transform={`translate(${frameLeft + 16}, 288)`}>
        <rect x="0" y="0" width={drawRight - frameLeft - 32} height="276" fill="#FFFFFF" stroke="#111827" strokeWidth="1.4" />
        <line x1="0" y1="26" x2={drawRight - frameLeft - 32} y2="26" stroke="#111827" strokeWidth="1.1" />
        <text x="12" y="17" fontSize="10.5" fontWeight="800" fontFamily="monospace" fill="#111827">
          DETAIL &apos;A&apos; — TRENCH CROSS-SECTION &amp; GENERAL SPECIFICATIONS (IRSEM PART-II)
        </text>

        {/* Monochrome Trench Cut */}
        <g transform="translate(105, 68)">
          <line x1="-64" y1="0" x2="64" y2="0" stroke="#111827" strokeWidth="1.8" />
          <rect x="-64" y="-8" width="128" height="8" fill="url(#monoHatch)" />
          <text x="-68" y="-2" fontSize="9" fontWeight="700" fontFamily="monospace" fill="#111827" textAnchor="end">G.L.</text>
          <polyline points="-38,0 -34,112 34,112 38,0" fill="none" stroke="#111827" strokeWidth="1.8" />
          <rect x="-32" y="56" width="64" height="16" fill="#FFFFFF" stroke="#111827" strokeWidth="1.4" />
          <text x="0" y="67" fontSize="7.5" fontWeight="800" fontFamily="monospace" fill="#111827" textAnchor="middle">CLASS-II BRICK</text>
          <rect x="-33" y="74" width="66" height="36" fill="none" stroke="#111827" strokeWidth="0.9" strokeDasharray="3,2" />
          {Array.from({ length: Math.min(Math.max(cableCount, 1), 8) }).map((_, i) => (
            <circle key={i} cx={-20 + (i % 4) * 13} cy={88 + Math.floor(i / 4) * 12} r="4" fill="#111827" />
          ))}
          <line x1="50" y1="0" x2="50" y2="112" stroke="#111827" strokeWidth="1" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
          <text x="56" y="60" fontSize="9.5" fontWeight="800" fontFamily="monospace" fill="#111827">
            {primaryDepth.toFixed(1)} m
          </text>
        </g>

        {/* Technical Notes Column */}
        <g transform="translate(230, 50)">
          <text x="0" y="12" fontSize="11.5" fontWeight="800" fontFamily="sans-serif" fill="#111827">
            CABLE: {cableCount} Nos. × {cableCore} Core {cableTypeLabel}
          </text>
          <text x="0" y="30" fontSize="10" fontWeight="600" fontFamily="monospace" fill="#111827">
            SPEC: {cableConductor} PVC Armoured (IRS: S 63/2014)
          </text>
          <line x1="0" y1="42" x2="395" y2="42" stroke="#111827" strokeWidth="0.8" />
          <text x="0" y="64" fontSize="10" fontWeight="600" fontFamily="sans-serif" fill="#111827">
            1. Minimum burial depth: {primaryDepth.toFixed(1)} m below G.L. (1.2 m at track crossings).
          </text>
          <text x="0" y="86" fontSize="10" fontWeight="600" fontFamily="sans-serif" fill="#111827">
            2. Protective cover: {primaryCover.slice(0, 46)}.
          </text>
          <text x="0" y="108" fontSize="10" fontWeight="600" fontFamily="sans-serif" fill="#111827">
            3. Provide 50 mm clean river sand bedding below and above cables.
          </text>
          <text x="0" y="130" fontSize="10" fontWeight="600" fontFamily="sans-serif" fill="#111827">
            4. Install Cable Route Markers (C.M.) every 50 m and at route bends.
          </text>
          <text x="0" y="152" fontSize="10" fontWeight="600" fontFamily="sans-serif" fill="#111827">
            5. Minimum bending radius shall not be less than 15D.
          </text>
          <text x="0" y="174" fontSize="10" fontWeight="600" fontFamily="sans-serif" fill="#111827">
            6. All dimensions are in metres unless otherwise noted.
          </text>
        </g>
      </g>

      {/* Right-Hand Vertical Official Indian Railways Title Block */}
      <g transform={`translate(${drawRight}, ${frameTop + 4})`}>
        <rect x="0" y="0" width={titleBlockW - 4} height={frameH - 8} fill="#FFFFFF" stroke="#111827" strokeWidth="1.6" />

        {/* Railway Zone Header */}
        <line x1="0" y1="68" x2={titleBlockW - 4} y2="68" stroke="#111827" strokeWidth="1.4" />
        <text x={(titleBlockW - 4) / 2} y="24" fontSize="10.5" fontWeight="800" fontFamily="sans-serif" fill="#111827" textAnchor="middle">
          INDIAN RAILWAYS
        </text>
        <text x={(titleBlockW - 4) / 2} y="42" fontSize="9.5" fontWeight="700" fontFamily="sans-serif" fill="#111827" textAnchor="middle">
          {(project.metadata.railwayZone || 'NORTHERN RAILWAY').slice(0, 26).toUpperCase()}
        </text>
        <text x={(titleBlockW - 4) / 2} y="58" fontSize="9" fontWeight="600" fontFamily="monospace" fill="#111827" textAnchor="middle">
          S&amp;T DEPT · {(project.metadata.division || 'DIV').toUpperCase()}
        </text>

        {/* Name of Work */}
        <line x1="0" y1="168" x2={titleBlockW - 4} y2="168" stroke="#111827" strokeWidth="1.2" />
        <text x="10" y="86" fontSize="8.5" fontWeight="700" fontFamily="monospace" fill="#475569">NAME OF WORK:</text>
        <text x="10" y="106" fontSize="9.5" fontWeight="700" fontFamily="sans-serif" fill="#111827">
          {(project.metadata.workName || 'SIGNALLING CABLE ROUTE').slice(0, 28)}
        </text>
        <text x="10" y="122" fontSize="9.5" fontWeight="700" fontFamily="sans-serif" fill="#111827">
          {(project.metadata.workName || '').slice(28, 56)}
        </text>
        <text x="10" y="146" fontSize="9" fontWeight="600" fontFamily="monospace" fill="#111827">
          SEC: {(project.metadata.stationSection || 'SECTION').slice(0, 24)}
        </text>

        {/* Drawing Number & Metadata */}
        <line x1="0" y1="264" x2={titleBlockW - 4} y2="264" stroke="#111827" strokeWidth="1.2" />
        <text x="10" y="186" fontSize="8.5" fontWeight="700" fontFamily="monospace" fill="#475569">DRAWING NO.:</text>
        <text x="10" y="204" fontSize="9.5" fontWeight="800" fontFamily="monospace" fill="#111827">
          {(project.metadata.drawingNumber || 'IR/S&T/01').slice(0, 25)}
        </text>
        <text x="10" y="228" fontSize="9" fontWeight="700" fontFamily="monospace" fill="#111827">
          SCALE: {project.metadata.scale || 'N.T.S.'}
        </text>
        <text x="10" y="246" fontSize="9" fontWeight="700" fontFamily="monospace" fill="#111827">
          REV: {project.metadata.revision || 'R0'} · DATE: {project.metadata.date || '2026'}
        </text>

        {/* Signature Blocks */}
        {[
          { y: 264, role: 'PREPARED BY', name: project.metadata.preparedBy, desig: project.metadata.preparedByDesig },
          { y: 362, role: 'CHECKED BY', name: project.metadata.checkedBy, desig: project.metadata.checkedByDesig },
          { y: 460, role: 'APPROVED BY', name: project.metadata.approvedBy, desig: project.metadata.approvedByDesig },
        ].map((sig) => (
          <g key={sig.role} transform={`translate(0, ${sig.y})`}>
            <line x1="0" y1="98" x2={titleBlockW - 4} y2="98" stroke="#111827" strokeWidth="1" />
            <text x="10" y="18" fontSize="8.5" fontWeight="700" fontFamily="monospace" fill="#475569">
              {sig.role}:
            </text>
            <text x="10" y="64" fontSize="10" fontWeight="800" fontFamily="sans-serif" fill="#111827">
              {sig.name || '________________'}
            </text>
            <text x="10" y="82" fontSize="8.5" fontWeight="600" fontFamily="monospace" fill="#111827">
              {sig.desig || 'S&T Officer'}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
};
