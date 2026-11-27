import React, { useRef, useState } from 'react';
import { Plus, Move, Check, ZoomIn, ZoomOut, Maximize2, Sliders, Tag } from 'lucide-react';
import { DrawingProject, PlacedSymbol, SymbolItem } from '../../types/drawing';
import { CANVAS_CONFIG } from '../../constants/uiConstants';
import { RenderInteractiveSymbol } from './InteractiveSymbols';
import { DiagramLowerPanels } from './DrawingVariants';

interface CadCanvasProps {
  project: DrawingProject;
  symbols: Record<string, SymbolItem>;
  onUpdateCalloutPos?: (x: number, y: number) => void;
  canvasRef?: React.RefObject<SVGSVGElement | null>;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  selectedSymbolId?: string | null;
  onSelectSymbol?: (id: string | null) => void;
  onUpdatePlacedSymbols?: (placedSymbols: PlacedSymbol[]) => void;
  onOpenAddSymbolPicker?: () => void;
  onOpenEditInfo?: (tab?: 'route' | 'segments' | 'cable' | 'titleBlock') => void;
  onOpenSymbolManager?: () => void;
}

export const CadCanvas: React.FC<CadCanvasProps> = ({
  project,
  canvasRef: externalCanvasRef,
  isEditMode = false,
  onToggleEditMode,
  selectedSymbolId = null,
  onSelectSymbol,
  onUpdatePlacedSymbols,
  onOpenAddSymbolPicker,
  onOpenEditInfo,
  onOpenSymbolManager,
}) => {
  const internalCanvasRef = useRef<SVGSVGElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hand-drag state for placed symbols (touch + mouse pointer events)
  const draggingSymRef = useRef<{
    id: string;
    dx: number;
    dy: number;
  } | null>(null);
  const [draggingSymbolId, setDraggingSymbolId] = useState<string | null>(null);

  // Touch gesture state for mobile pinch & pan
  const touchStartDist = useRef<number | null>(null);
  const initialZoom = useRef<number>(1.0);

  const VB_WIDTH = CANVAS_CONFIG.VIEWBOX_WIDTH;
  const VB_HEIGHT = CANVAS_CONFIG.VIEWBOX_HEIGHT;

  const placedSymbols: PlacedSymbol[] = project.placedSymbols || [];

  const clientToSvgPoint = (clientX: number, clientY: number): { x: number; y: number } => {
    const svg = canvasRef.current;
    if (!svg) return { x: VB_WIDTH / 2, y: VB_HEIGHT / 2 };
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / (rect.width || 1)) * VB_WIDTH,
      y: ((clientY - rect.top) / (rect.height || 1)) * VB_HEIGHT,
    };
  };

  const handleSymbolPointerDown = (e: React.PointerEvent<SVGGElement>, sym: PlacedSymbol) => {
    if (!onUpdatePlacedSymbols) return;
    e.stopPropagation();
    setIsPanning(false);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if capture not supported
    }
    if (!isEditMode && onToggleEditMode) {
      onToggleEditMode();
    }
    onSelectSymbol?.(sym.id);
    const pt = clientToSvgPoint(e.clientX, e.clientY);
    draggingSymRef.current = {
      id: sym.id,
      dx: pt.x - sym.x,
      dy: pt.y - sym.y,
    };
    setDraggingSymbolId(sym.id);
  };

  const handleSymbolPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const drag = draggingSymRef.current;
    if (!drag || !onUpdatePlacedSymbols) return;
    e.stopPropagation();
    const pt = clientToSvgPoint(e.clientX, e.clientY);
    const nextX = Math.round(Math.min(Math.max(pt.x - drag.dx, 28), VB_WIDTH - 28));
    const nextY = Math.round(Math.min(Math.max(pt.y - drag.dy, 52), VB_HEIGHT - 74));

    const updated = placedSymbols.map((s) =>
      s.id === drag.id ? { ...s, x: nextX, y: nextY } : s
    );
    onUpdatePlacedSymbols(updated);
  };

  const handleSymbolPointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (!draggingSymRef.current) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    draggingSymRef.current = null;
    setDraggingSymbolId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) =>
      Math.min(Math.max(prev * zoomFactor, CANVAS_CONFIG.MIN_ZOOM), CANVAS_CONFIG.MAX_ZOOM)
    );
  };

  const isSymbolTarget = (target: EventTarget | null) =>
    target instanceof Element && Boolean(target.closest('[data-placed-symbol="true"]'));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggingSymRef.current || isSymbolTarget(e.target)) return;
    if (e.button === 0) {
      if (isEditMode) {
        onSelectSymbol?.(null);
      }
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingSymRef.current) return;
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch handlers for smooth mobile interaction
  const handleTouchStart = (e: React.TouchEvent) => {
    if (draggingSymRef.current || isSymbolTarget(e.target)) return;
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      initialZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingSymRef.current) return;
    if (e.touches.length === 1 && isPanning) {
      setPan({ x: e.touches[0].clientX - panStart.x, y: e.touches[0].clientY - panStart.y });
    } else if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDist.current;
      setZoom(
        Math.min(
          Math.max(initialZoom.current * scale, CANVAS_CONFIG.MIN_ZOOM),
          CANVAS_CONFIG.MAX_ZOOM
        )
      );
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    touchStartDist.current = null;
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Route & Segment calculations
  const totalLength =
    project.segments.reduce((acc, s) => acc + (Number(s.length) || 0), 0) || 500;

  const routeStartX = 110;
  const routeEndX = 850;
  const availableWidth = routeEndX - routeStartX; // 740px
  const trackCenterY = 128; // Aligned with upper track band & auto-placed S&T symbols
  const routeY = 206;
  const activeVariant = project.settings.drawingVariant || 'standard';
  const isMono = activeVariant === 'blueprint';

  // Cable & Depth details (fully dynamic from prompt/project)
  const cableInfo = project.cables && project.cables.length > 0 ? project.cables[0] : null;
  const cableCount = cableInfo?.count || 4;
  const cableCore = cableInfo?.coreCount || 12;
  const cableTypeLabel = cableInfo?.cableType || 'Signalling';
  const cableConductor = cableInfo?.conductorSize || '1.5 sq mm';
  const primaryDepth =
    project.segments.find((s) => s.depth > 0)?.depth ?? 1.0;
  const primaryCover =
    project.segments.find((s) => s.layingMethod === 'Normal Trenching')?.coverType ||
    project.segments[0]?.coverType ||
    'Class-II Bricks laid flat';

  // Unique laying methods present in THIS drawing (for dynamic Legend!)
  const uniqueMethods = Array.from(
    new Set(project.segments.map((s) => s.layingMethod))
  ).slice(0, 4);

  const renderEndpointGlyph = (nodeType: string | undefined) => {
    if (nodeType === 'signal_cabin') {
      return (
        <g transform="scale(1.25)">
          <RenderInteractiveSymbol type="signal_cabin" />
        </g>
      );
    }
    if (nodeType === 'lc_gate') {
      return (
        <g transform="scale(1.25)">
          <RenderInteractiveSymbol type="lc_gate" />
        </g>
      );
    }
    if (nodeType === 'cls_4aspect') {
      return (
        <g transform="scale(1.25)">
          <RenderInteractiveSymbol type="cls_4aspect" />
        </g>
      );
    }
    if (nodeType === 'point_machine') {
      return (
        <g transform="scale(1.25)">
          <RenderInteractiveSymbol type="point_machine" />
        </g>
      );
    }
    // Classic Indian Railways Apparatus Case / Location Box
    return (
      <g>
        <rect x="-24" y="22" width="48" height="8" fill="#64748B" stroke="#0C2340" strokeWidth="1.8" />
        <rect x="-20" y="-34" width="40" height="56" fill="#E2E8F0" stroke="#0C2340" strokeWidth="2" rx="2" />
        <polygon points="-24,-34 0,-48 24,-34" fill="#0C2340" stroke="#0C2340" strokeWidth="1.5" />
        <line x1="0" y1="-34" x2="0" y2="22" stroke="#0C2340" strokeWidth="1.2" />
      </g>
    );
  };

  // Segment widths with guaranteed minimum width for clear readability
  const minSegPx = 110;
  const totalSegments = project.segments.length || 1;
  const totalMinRequired = totalSegments * minSegPx;

  const segmentWidths: number[] = [];
  if (totalMinRequired <= availableWidth) {
    const remainingWidth = availableWidth - totalMinRequired;
    project.segments.forEach((seg) => {
      const segLen = Number(seg.length) || 10;
      const proportionalExtra = (segLen / totalLength) * remainingWidth;
      segmentWidths.push(Math.round(minSegPx + proportionalExtra));
    });
  } else {
    project.segments.forEach((seg) => {
      const segLen = Number(seg.length) || 10;
      segmentWidths.push(Math.round((segLen / totalLength) * availableWidth));
    });
  }

  // Snap to exact available width
  const sumWidths = segmentWidths.reduce((a, b) => a + b, 0);
  if (segmentWidths.length > 0 && sumWidths !== availableWidth) {
    segmentWidths[segmentWidths.length - 1] += availableWidth - sumWidths;
  }

  return (
    <div className="relative w-full h-full bg-canvas-backdrop overflow-hidden flex flex-col">
      {/* CAD Viewport Floating Liquid Glass Toolbar */}
      <div className="min-h-[48px] px-3 py-1.5 bg-surface-subtle/80 backdrop-blur-md border-b border-line/60 flex items-center justify-between gap-2 text-ink-primary z-10 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {onOpenAddSymbolPicker && isEditMode && (
            <button
              type="button"
              onClick={onOpenAddSymbolPicker}
              className="liquid-glass-accent min-h-[38px] px-3.5 inline-flex items-center gap-1.5 text-xs font-bold shadow-sm transition-all"
              title="Add S&T symbol to drawing"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Symbol</span>
            </button>
          )}
          {onOpenSymbolManager && isEditMode && (
            <button
              type="button"
              onClick={onOpenSymbolManager}
              className="liquid-glass-secondary min-h-[38px] px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-all"
              title="Manage placed symbols"
            >
              <Tag className="w-3.5 h-3.5 text-accent" />
              <span>Placed ({placedSymbols.length})</span>
            </button>
          )}
          {isEditMode && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-ink-muted font-medium px-2 py-0.5 rounded-full bg-surface-card border border-line/50">
              Drag symbols on sheet to reposition
            </span>
          )}
        </div>

        {/* Minimalist Liquid Glass Zoom Pill */}
        <div className="flex items-center gap-1 bg-surface-card/80 backdrop-blur-md border border-line/70 rounded-full px-1.5 py-0.5 shadow-sm">
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.max(z - CANVAS_CONFIG.ZOOM_STEP, CANVAS_CONFIG.MIN_ZOOM))
            }
            disabled={zoom <= CANVAS_CONFIG.MIN_ZOOM}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-hover/80 active:bg-surface-active disabled:opacity-30 transition-colors"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-ink-primary tabular-nums px-1.5 text-center font-bold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.min(z + CANVAS_CONFIG.ZOOM_STEP, CANVAS_CONFIG.MAX_ZOOM))
            }
            disabled={zoom >= CANVAS_CONFIG.MAX_ZOOM}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-hover/80 active:bg-surface-active disabled:opacity-30 transition-colors"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-hover/80 active:bg-surface-active transition-colors ml-0.5"
            aria-label="Reset zoom and center view"
            title="Reset 100%"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main SVG CAD Drawing Area */}
      <div
        className={`flex-1 w-full h-full flex items-center justify-center p-3 overflow-hidden ${
          draggingSymbolId
            ? 'cursor-grabbing'
            : isEditMode
            ? 'cursor-default'
            : 'cursor-grab active:cursor-grabbing'
        }`}
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          id="rail-cad-canvas"
          ref={canvasRef}
          viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
          className="w-full h-auto max-h-full transition-transform duration-75 border border-line bg-white shadow-sm rounded-sm"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* DEFINITIONS */}
          <defs>
            {/* 45 Degree Clean Red Hatching for Trenchless / HDD */}
            <pattern id="hddHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#B91C1C" strokeWidth="2.5" />
            </pattern>

            {/* Earth Ground Hatching for Trench Cross-Section */}
            <pattern id="earthHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94A3B8" strokeWidth="1" />
            </pattern>

            {/* Sand Stipple Pattern */}
            <pattern id="sandPattern" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="#B45309" />
              <circle cx="8" cy="4" r="0.8" fill="#B45309" />
              <circle cx="5" cy="8" r="0.8" fill="#B45309" />
              <circle cx="10" cy="10" r="0.8" fill="#B45309" />
            </pattern>

            {/* Realistic Ballast Stone Stipple Pattern */}
            <pattern id="ballastPattern" width="16" height="12" patternUnits="userSpaceOnUse">
              <rect width="16" height="12" fill="#E2E8F0" />
              <circle cx="3" cy="3" r="1.2" fill="#94A3B8" />
              <circle cx="11" cy="4" r="1.4" fill="#64748B" />
              <circle cx="7" cy="8" r="1.1" fill="#475569" />
              <circle cx="14" cy="10" r="1.3" fill="#94A3B8" />
              <circle cx="2" cy="10" r="1.0" fill="#64748B" />
            </pattern>

            {/* River Water Ripple Pattern for Bridge Span */}
            <pattern id="waterRipple" width="24" height="8" patternUnits="userSpaceOnUse">
              <path d="M 0 4 Q 6 1 12 4 T 24 4" fill="none" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.8" />
            </pattern>

            {/* Concrete Precast Trough Modular Texture */}
            <pattern id="troughLidPattern" width="18" height="16" patternUnits="userSpaceOnUse">
              <rect width="17" height="16" fill="#EDE9FE" stroke="#6D28D9" strokeWidth="0.8" />
              <line x1="17" y1="0" x2="17" y2="16" stroke="#4C1D95" strokeWidth="1.2" />
              <circle cx="8.5" cy="8" r="1.2" fill="#7C3AED" />
            </pattern>

            {/* Standard Dimension Arrowheads */}
            <marker id="dimArrowStart" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#0C2340" />
            </marker>
            <marker id="dimArrowEnd" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0C2340" />
            </marker>
          </defs>

          <g id="layer-unified-diagram" style={isMono ? { filter: 'grayscale(1) contrast(1.12)' } : undefined}>
            {/* 1. CLEAN ENGINEERING BORDER */}
            <rect x="12" y="12" width={VB_WIDTH - 24} height={VB_HEIGHT - 24} fill="#FFFFFF" stroke={isMono ? '#111827' : '#0C2340'} strokeWidth="2" rx="3" />
            <rect x="16" y="16" width={VB_WIDTH - 32} height={VB_HEIGHT - 32} fill="none" stroke="#CBD2DC" strokeWidth="1" rx="2" />

            {/* 2. TOP DRAWING HEADER (No bottom Drawn By / Approved By bar) */}
            <g transform="translate(28, 22)">
              <text x="0" y="12" fontSize="9.5" fontWeight="700" fontFamily="sans-serif" fill="#475569" letterSpacing="0.6px">
                {(project.metadata.railwayZone || 'INDIAN RAILWAYS').toUpperCase()} — SIGNAL &amp; TELECOMMUNICATION DEPARTMENT
              </text>
              <text x={VB_WIDTH - 56} y="12" fontSize="10" fontWeight="700" fontFamily="sans-serif" fill={isMono ? '#111827' : '#1E3A8A'} textAnchor="end">
                TOTAL: {totalLength} m &nbsp;|&nbsp; {project.metadata.drawingNumber || 'IR/S&T/CAD'}
              </text>
              <text
                x="0"
                y="30"
                fontSize="13.5"
                fontWeight="900"
                fontFamily="sans-serif"
                fill={isMono ? '#111827' : '#0C2340'}
                letterSpacing="0.3px"
                style={{ cursor: isEditMode ? 'pointer' : 'default' }}
                onClick={(e) => {
                  if (isEditMode && onOpenEditInfo) {
                    e.stopPropagation();
                    onOpenEditInfo('titleBlock');
                  }
                }}
              >
                {cableTypeLabel.toUpperCase()} CABLE ROUTE : {project.startNode.id} TO {project.endNode.id}
              </text>
              <line x1="0" y1="38" x2={VB_WIDTH - 56} y2="38" stroke={isMono ? '#111827' : '#0C2340'} strokeWidth="1.2" />
            </g>

          {/* 3. TOP REFERENCE ROW: START/END BADGES & TRACK C/L DESIGNATION */}
          {/* Start Location Node Badge */}
          <g
            transform={`translate(${routeStartX}, ${trackCenterY - 46})`}
            id="badge-start-node"
            style={{ cursor: isEditMode ? 'pointer' : 'default' }}
            onClick={(e) => {
              if (isEditMode && onOpenEditInfo) {
                e.stopPropagation();
                onOpenEditInfo('route');
              }
            }}
          >
            {(() => {
              const labelText = project.startNode.id;
              const badgeW = Math.min(Math.max(labelText.length * 7.2 + 18, 75), 180);
              return (
                <g>
                  <rect
                    x={-badgeW / 2}
                    y="-9"
                    width={badgeW}
                    height="18"
                    fill="#0C2340"
                    stroke={isEditMode ? '#F59E0B' : '#0284C7'}
                    strokeWidth={isEditMode ? '2' : '1.5'}
                    strokeDasharray={isEditMode ? '4,2' : undefined}
                    rx="3"
                  />
                  <text x="0" y="3.5" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
                    {labelText}
                  </text>
                  <polygon points="-3,9 3,9 0,13" fill="#0C2340" />
                </g>
              );
            })()}
          </g>

          {/* End Location Node Badge */}
          <g
            transform={`translate(${routeEndX}, ${trackCenterY - 46})`}
            id="badge-end-node"
            style={{ cursor: isEditMode ? 'pointer' : 'default' }}
            onClick={(e) => {
              if (isEditMode && onOpenEditInfo) {
                e.stopPropagation();
                onOpenEditInfo('route');
              }
            }}
          >
            {(() => {
              const labelText = project.endNode.id;
              const badgeW = Math.min(Math.max(labelText.length * 7.2 + 18, 75), 180);
              return (
                <g>
                  <rect
                    x={-badgeW / 2}
                    y="-9"
                    width={badgeW}
                    height="18"
                    fill="#0C2340"
                    stroke={isEditMode ? '#F59E0B' : '#0284C7'}
                    strokeWidth={isEditMode ? '2' : '1.5'}
                    strokeDasharray={isEditMode ? '4,2' : undefined}
                    rx="3"
                  />
                  <text x="0" y="3.5" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
                    {labelText}
                  </text>
                  <polygon points="-3,9 3,9 0,13" fill="#0C2340" />
                </g>
              );
            })()}
          </g>

          {/* Track Reference Designation (Center) */}
          <g id="track-centerline-heading">
            <line x1="220" y1={trackCenterY - 46} x2="280" y2={trackCenterY - 46} stroke="#64748B" strokeWidth="1" strokeDasharray="6,3" />
            <text x="480" y={trackCenterY - 42.5} fontSize="9" fontWeight="800" fontFamily="sans-serif" fill="#334155" textAnchor="middle" letterSpacing="0.4px">
              C/L OF NEAREST RAILWAY TRACK (1676 mm BG — OFFSET: 3.5 m MIN)
            </text>
            <line x1="680" y1={trackCenterY - 46} x2="740" y2={trackCenterY - 46} stroke="#64748B" strokeWidth="1" strokeDasharray="6,3" />
          </g>

          {/* 3. REALISTIC BROAD GAUGE RAILWAY TRACK (Centered in between) */}
          <g id="layer-rail-track">
            {/* Ballast Formation Bed */}
            <polygon
              points={`75,${trackCenterY + 14} 885,${trackCenterY + 14} 875,${trackCenterY - 18} 85,${trackCenterY - 18}`}
              fill="url(#ballastPattern)"
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
            {/* Ballast shoulder slope shadow line */}
            <line x1="75" y1={trackCenterY + 14} x2="885" y2={trackCenterY + 14} stroke="#64748B" strokeWidth="1.6" />

            {/* PSC Sleepers across the ballast */}
            {(() => {
              const sleepers: React.ReactNode[] = [];
              for (let sx = 86; sx <= 874; sx += 15) {
                // Extended switch ties near Point Machine at the end (X > 820)
                const isExtendedSwitchTie = sx >= 822 && sx <= 864;
                const sleeperHeight = isExtendedSwitchTie ? 44 : 22;
                const sleeperY = trackCenterY - 12;

                sleepers.push(
                  <g key={sx}>
                    {/* Concrete sleeper block with chamfer */}
                    <rect
                      x={sx - 3.5}
                      y={sleeperY}
                      width="7"
                      height={sleeperHeight}
                      rx="1.2"
                      fill="#E2E8F0"
                      stroke="#475569"
                      strokeWidth="0.8"
                    />
                    {/* Top rail seat pad */}
                    <rect x={sx - 3} y={trackCenterY - 8} width="6" height="4" fill="#334155" />
                    {/* Bottom rail seat pad */}
                    <rect x={sx - 3} y={trackCenterY + 4} width="6" height="4" fill="#334155" />
                    {/* Pandrol clip marks */}
                    <circle cx={sx} cy={trackCenterY - 8.5} r="1.1" fill="#0F172A" />
                    <circle cx={sx} cy={trackCenterY + 8.5} r="1.1" fill="#0F172A" />
                  </g>
                );
              }
              return sleepers;
            })()}

            {/* TWIN CONTINUOUS STEEL RAILS */}
            {/* Top Steel Rail */}
            <g id="rail-top">
              <line x1="76" y1={trackCenterY - 6} x2="884" y2={trackCenterY - 6} stroke="#0F172A" strokeWidth="4.2" strokeLinecap="round" />
              <line x1="76" y1={trackCenterY - 6} x2="884" y2={trackCenterY - 6} stroke="#475569" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="76" y1={trackCenterY - 6.5} x2="884" y2={trackCenterY - 6.5} stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* Bottom Steel Rail */}
            <g id="rail-bottom">
              <line x1="76" y1={trackCenterY + 6} x2="884" y2={trackCenterY + 6} stroke="#0F172A" strokeWidth="4.2" strokeLinecap="round" />
              <line x1="76" y1={trackCenterY + 6} x2="884" y2={trackCenterY + 6} stroke="#475569" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="76" y1={trackCenterY + 5.5} x2="884" y2={trackCenterY + 5.5} stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* Turnout Switch Blades / Tongue Rails near Point Machine (at end node) */}
            <g id="turnout-switch-points">
              <line x1="822" y1={trackCenterY + 6} x2="862" y2={trackCenterY + 20} stroke="#0F172A" strokeWidth="3" />
              <line x1="822" y1={trackCenterY + 6} x2="862" y2={trackCenterY + 20} stroke="#64748B" strokeWidth="1.8" />
              {/* Switch stretcher bar & drive rod connecting Point Machine to rail */}
              <line x1="840" y1={trackCenterY + 6} x2="840" y2={routeY - 20} stroke="#0C2340" strokeWidth="2.4" />
              <line x1="854" y1={trackCenterY + 6} x2="854" y2={routeY - 20} stroke="#0C2340" strokeWidth="2.4" />
              <rect x="836" y={trackCenterY + 12} width="22" height="3" fill="#1E293B" />
            </g>

            {/* Glued Insulated Joints (GIJ) on rail */}
            <line x1="180" y1={trackCenterY - 11} x2="180" y2={trackCenterY + 11} stroke="#B91C1C" strokeWidth="2.2" strokeDasharray="3,2" />
            <line x1="720" y1={trackCenterY - 11} x2="720" y2={trackCenterY + 11} stroke="#B91C1C" strokeWidth="2.2" strokeDasharray="3,2" />

            {/* Track Centerline (C/L) reference */}
            <line
              x1="76"
              y1={trackCenterY}
              x2="884"
              y2={trackCenterY}
              stroke="#64748B"
              strokeWidth="1.2"
              strokeDasharray="14,4,3,4"
            />

            {/* Safe Offset Dimension Indicator between Track and Cable Route */}
            <g transform={`translate(64, ${trackCenterY + 6})`}>
              <line x1="0" y1="0" x2="0" y2={routeY - (trackCenterY + 6)} stroke="#0284C7" strokeWidth="1.2" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
              <text x="-5" y={(routeY - (trackCenterY + 6)) / 2 + 3} fontSize="8.5" fontWeight="800" fill="#0284C7" textAnchor="end">
                3.5 m MIN
              </text>
            </g>
          </g>


          {/* 4. MAIN CABLE ROUTE WITH REAL-WORLD SURROUNDINGS & REALISTIC S&T EQUIPMENT */}
          <g id="layer-route-main">
            {/* START LOCATION: REALISTIC S&T EQUIPMENT (Color Light Signal S12 on Cess beside Rail) */}
            <g transform={`translate(${routeStartX}, ${routeY})`} id="node-start">
              {/* Foundation Plinth on cess */}
              <rect x="-14" y="-8" width="28" height="16" fill="#64748B" stroke="#0C2340" strokeWidth="1.5" rx="1" />
              <line x1="-18" y1="8" x2="18" y2="8" stroke="#334155" strokeWidth="2.5" />

              {/* Realistic Signal Mast beside the Rail Track extending upwards to track height */}
              {project.startNode.type?.includes('cls') || project.startNode.type?.includes('signal') ? (
                <g transform="translate(0, -8)">
                  <line x1="0" y1="0" x2="0" y2="-64" stroke="#0C2340" strokeWidth="3.2" />
                  {/* Ladder rungs */}
                  {[-12, -22, -32, -42, -52].map((ly) => (
                    <line key={ly} x1="-5" y1={ly} x2="5" y2={ly} stroke="#475569" strokeWidth="1.2" />
                  ))}
                  {/* Base Transformer Box */}
                  <rect x="-8" y="-16" width="16" height="14" fill="#CBD5E1" stroke="#0C2340" strokeWidth="1.5" rx="1" />
                  {/* Signal Aspect Head Unit */}
                  <rect x="-7" y="-68" width="14" height="32" rx="6" fill="#0F172A" stroke="#0C2340" strokeWidth="1.8" />
                  {/* Visor hoods & lenses */}
                  <circle cx="0" cy="-62" r="3" fill="#22C55E" />
                  <circle cx="0" cy="-54" r="3" fill="#FACC15" />
                  <circle cx="0" cy="-46" r="3" fill="#EF4444" />
                </g>
              ) : (
                <g transform="scale(1.15)">
                  {renderEndpointGlyph(project.startNode.type)}
                </g>
              )}

              <text x="0" y="24" fill="#1E293B" fontSize="10" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
                START
              </text>
            </g>

            {/* END LOCATION: REALISTIC S&T EQUIPMENT (Point Machine P4 on Extended Switch Sleepers) */}
            <g transform={`translate(${routeEndX}, ${routeY})`} id="node-end">
              {/* Foundation Plinth on extended ties */}
              <rect x="-18" y="-8" width="36" height="16" fill="#64748B" stroke="#0C2340" strokeWidth="1.5" rx="1" />
              <line x1="-22" y1="8" x2="22" y2="8" stroke="#334155" strokeWidth="2.5" />

              {/* Realistic Point Machine Enclosure */}
              {project.endNode.type === 'point_machine' || project.endNode.id.toLowerCase().includes('point') ? (
                <g transform="translate(0, -6)">
                  <rect x="-18" y="-20" width="36" height="20" rx="3" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2.2" />
                  <rect x="-14" y="-16" width="28" height="12" fill="#BFDBFE" rx="1" />
                  <text x="0" y="-7" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#1E3A8A">
                    PM
                  </text>
                  <line x1="-18" y1="-10" x2="-28" y2="-10" stroke="#0C2340" strokeWidth="2.8" />
                  <line x1="18" y1="-10" x2="28" y2="-10" stroke="#0C2340" strokeWidth="2.8" />
                </g>
              ) : (
                <g transform="scale(1.15)">
                  {renderEndpointGlyph(project.endNode.type)}
                </g>
              )}

              <text x="0" y="24" fill="#1E293B" fontSize="10" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
                END
              </text>
            </g>

            {/* ROUTE SEGMENTS — REAL-WORLD SURROUNDINGS & AUTHENTIC ENGINEERING GRAPHICS */}
            {(() => {
              let curX = routeStartX + 26;
              const actualRouteWidth = routeEndX - 26 - (routeStartX + 26);
              const netWidths = segmentWidths.map((w) => Math.round((w / availableWidth) * actualRouteWidth));

              return project.segments.map((seg, idx) => {
                const segLen = Number(seg.length) || 10;
                const segWidth = netWidths[idx] || 110;
                const segEndX = curX + segWidth;
                const midX = curX + segWidth / 2;
                const method = seg.layingMethod;

                const isTrenchless = method === 'Trenchless-HDD' || method.includes('HDD');
                const isRcc = method === 'RCC Pipe';
                const isHdpe = method === 'HDPE Pipe';
                const isGiPipe = method === 'GI Pipe';
                const isTrackCross = method === 'Track crossing' || method === 'Rail crossing';
                const isRoadCross = method === 'Road crossing';
                const isBridge = method === 'Along Bridge';
                const isCulvert = method === 'Culvert crossing';
                const isTrough = method === 'Cable Trough';
                const isTray = method === 'Cable Tray';

                const methodShort = isBridge
                  ? 'ALONG BRIDGE (TRAY)'
                  : isCulvert
                  ? 'CULVERT CROSSING'
                  : isTrough
                  ? 'CABLE TROUGH'
                  : isTrenchless
                  ? 'TRENCHLESS (HDD)'
                  : isTrackCross
                  ? 'TRACK CROSSING'
                  : isRoadCross
                  ? 'ROAD CROSSING'
                  : isRcc
                  ? 'RCC PIPE'
                  : isGiPipe
                  ? 'GI PIPE'
                  : isHdpe
                  ? 'HDPE DUCT'
                  : isTray
                  ? 'CABLE TRAY'
                  : 'NORMAL TRENCHING';

                const methodColor = isBridge
                  ? '#0F766E'
                  : isCulvert
                  ? '#0284C7'
                  : isTrough
                  ? '#6D28D9'
                  : isTrenchless
                  ? '#B91C1C'
                  : isTrackCross
                  ? '#7C2D12'
                  : isRoadCross
                  ? '#334155'
                  : isGiPipe
                  ? '#1D4ED8'
                  : '#0C2340';

                const methodBg = isBridge
                  ? '#CCFBF1'
                  : isCulvert
                  ? '#E0F2FE'
                  : isTrough
                  ? '#EDE9FE'
                  : isTrenchless
                  ? '#FEE2E2'
                  : isTrackCross
                  ? '#FEF3C7'
                  : isRoadCross
                  ? '#E2E8F0'
                  : isGiPipe
                  ? '#DBEAFE'
                  : '#F1F5F9';

                const segElement = (
                  <g
                    key={seg.id || idx}
                    style={{ cursor: isEditMode ? 'pointer' : 'default' }}
                    onClick={(e) => {
                      if (isEditMode && onOpenEditInfo) {
                        e.stopPropagation();
                        onOpenEditInfo('segments');
                      }
                    }}
                  >
                    {/* REAL-WORLD ENVIRONMENT ACCORDING TO LAYING METHOD */}
                    {isBridge ? (
                      /* 1. REAL-WORLD BRIDGE: Steel Truss Girder + Masonry Piers + River Water Beneath! */
                      <g id={`bridge-${idx}`}>
                        {/* River / Water Channel under bridge */}
                        <rect x={curX - 2} y={routeY + 12} width={segWidth + 4} height="18" fill="#E0F2FE" rx="2" />
                        <rect x={curX - 2} y={routeY + 12} width={segWidth + 4} height="18" fill="url(#waterRipple)" />
                        <line x1={curX - 4} y1={routeY + 12} x2={segEndX + 4} y2={routeY + 12} stroke="#38BDF8" strokeWidth="1" />

                        {/* Heavy Masonry Bridge Support Piers */}
                        <rect x={curX} y={routeY + 6} width="10" height="24" fill="#475569" stroke="#1E293B" strokeWidth="1" rx="1" />
                        <rect x={segEndX - 10} y={routeY + 6} width="10" height="24" fill="#475569" stroke="#1E293B" strokeWidth="1" rx="1" />

                        {/* Steel Truss Girder Frame carrying track and cable */}
                        <rect x={curX} y={trackCenterY - 24} width={segWidth} height="5" fill="#0F766E" rx="1" />
                        <rect x={curX} y={routeY + 6} width={segWidth} height="5" fill="#0F766E" rx="1" />

                        {/* Diagonal Structural Steel Warren Truss Struts */}
                        {Array.from({ length: Math.max(Math.floor(segWidth / 22), 2) }).map((_, bIdx) => {
                          const x0 = curX + bIdx * 22;
                          const x1 = Math.min(x0 + 22, segEndX);
                          return (
                            <path
                              key={bIdx}
                              d={`M ${x0} ${routeY + 6} L ${(x0 + x1) / 2} ${trackCenterY - 21} L ${x1} ${routeY + 6}`}
                              fill="none"
                              stroke="#0F766E"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          );
                        })}

                        {/* Galvanized Cable Tray mounted on girder face carrying the cable */}
                        <rect
                          x={curX}
                          y={routeY - 8}
                          width={segWidth}
                          height="16"
                          fill="#CCFBF1"
                          stroke="#0F766E"
                          strokeWidth="2"
                          rx="2"
                        />
                        {/* Perforated Cable Tray slots */}
                        {Array.from({ length: Math.max(Math.floor(segWidth / 14), 2) }).map((_, pIdx) => (
                          <rect
                            key={pIdx}
                            x={curX + 4 + pIdx * 14}
                            y={routeY - 3}
                            width="6"
                            height="6"
                            fill="#0F766E"
                            rx="1"
                          />
                        ))}
                      </g>
                    ) : isCulvert ? (
                      /* 2. REAL-WORLD CULVERT: Embankment Stone/RCC Box Opening + Water Ditch + Pipe Brackets */
                      <g id={`culvert-${idx}`}>
                        {/* Embankment Cut & Culvert Opening under track */}
                        <rect x={midX - 20} y={trackCenterY - 24} width="40" height={routeY - (trackCenterY - 24)} fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" rx="2" />
                        <path
                          d={`M ${midX - 14} ${routeY} L ${midX - 14} ${trackCenterY} Q ${midX} ${trackCenterY - 12} ${midX + 14} ${trackCenterY} L ${midX + 14} ${routeY} Z`}
                          fill="#334155"
                          stroke="#0F172A"
                          strokeWidth="1.5"
                        />
                        {/* Flowing Water Stream underneath */}
                        <path d={`M ${midX - 20} ${routeY} Q ${midX} ${routeY - 4} ${midX + 20} ${routeY}`} stroke="#0284C7" strokeWidth="2.5" />

                        {/* Heavy GI Protective Pipe crossing culvert on steel brackets */}
                        <rect
                          x={curX}
                          y={routeY - 8}
                          width={segWidth}
                          height="16"
                          fill="#DBEAFE"
                          stroke="#1D4ED8"
                          strokeWidth="2.2"
                          rx="2"
                        />
                        <line x1={curX} y1={routeY} x2={segEndX} y2={routeY} stroke="#1D4ED8" strokeWidth="1.5" strokeDasharray="6,4" />
                        <rect x={curX - 2} y={routeY - 11} width="5" height="22" fill="#1E3A8A" />
                        <rect x={segEndX - 3} y={routeY - 11} width="5" height="22" fill="#1E3A8A" />
                      </g>
                    ) : isTrough ? (
                      /* 3. REAL-WORLD CABLE TROUGH: Modular Precast RCC Trough with Interlocking Concrete Lids */
                      <g id={`trough-${idx}`}>
                        <rect x={curX} y={routeY - 10} width={segWidth} height="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" rx="2" />
                        <rect
                          x={curX}
                          y={routeY - 8}
                          width={segWidth}
                          height="16"
                          fill="url(#troughLidPattern)"
                          stroke="#6D28D9"
                          strokeWidth="2"
                          rx="2"
                        />
                        <line x1={curX} y1={routeY - 3} x2={segEndX} y2={routeY - 3} stroke="#6D28D9" strokeWidth="1" />
                        <line x1={curX} y1={routeY + 3} x2={segEndX} y2={routeY + 3} stroke="#6D28D9" strokeWidth="1" />
                      </g>
                    ) : isTrackCross ? (
                      /* 4. REAL-WORLD TRACK CROSSING: RCC Casing passing directly under Rails & Sleepers */
                      <g id={`trackcross-${idx}`}>
                        <rect x={midX - 16} y={trackCenterY - 54} width="32" height={routeY + 12 - (trackCenterY - 54)} fill="#FEF3C7" stroke="#92400E" strokeWidth="2.2" rx="3" />
                        <line x1={midX - 9} y1={trackCenterY - 54} x2={midX - 9} y2={routeY + 12} stroke="#0F172A" strokeWidth="3" />
                        <line x1={midX + 9} y1={trackCenterY - 54} x2={midX + 9} y2={routeY + 12} stroke="#0F172A" strokeWidth="3" />
                        <rect x={curX} y={routeY - 8} width={segWidth} height="16" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
                      </g>
                    ) : isRoadCross ? (
                      /* 5. REAL-WORLD ROAD CROSSING: Asphalt Road across Track + Barrier Boom */
                      <g id={`roadcross-${idx}`}>
                        <rect x={midX - 24} y={trackCenterY - 54} width="48" height={routeY + 12 - (trackCenterY - 54)} fill="#475569" stroke="#1E293B" strokeWidth="1.8" rx="2" />
                        <line x1={midX} y1={trackCenterY - 52} x2={midX} y2={routeY + 12} stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5,4" />
                        <rect x={midX - 26} y={trackCenterY - 22} width="52" height="5" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
                        <rect x={curX} y={routeY - 7} width={segWidth} height="14" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="1.8" />
                      </g>
                    ) : isTrenchless ? (
                      /* 6. REAL-WORLD TRENCHLESS / HDD */
                      <g id={`hdd-${idx}`}>
                        <path
                          d={`M ${curX} ${routeY} Q ${midX} ${routeY + 24} ${segEndX} ${routeY}`}
                          fill="none"
                          stroke="#B91C1C"
                          strokeWidth="3.5"
                          strokeDasharray="6,3"
                        />
                        <rect x={curX} y={routeY - 9} width={segWidth} height="18" fill="url(#hddHatch)" stroke="#B91C1C" strokeWidth="2" rx="2" />
                        <rect x={curX - 3} y={routeY - 13} width="6" height="26" fill="#B91C1C" rx="1" />
                        <rect x={segEndX - 3} y={routeY - 13} width="6" height="26" fill="#B91C1C" rx="1" />
                      </g>
                    ) : isGiPipe ? (
                      <g id={`gipipe-${idx}`}>
                        <rect x={curX} y={routeY - 8} width={segWidth} height="16" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2" />
                        <line x1={curX} y1={routeY} x2={segEndX} y2={routeY} stroke="#1D4ED8" strokeWidth="1.4" strokeDasharray="6,4" />
                        <line x1={curX} y1={routeY - 11} x2={curX} y2={routeY + 11} stroke="#1E3A8A" strokeWidth="3" />
                        <line x1={segEndX} y1={routeY - 11} x2={segEndX} y2={routeY + 11} stroke="#1E3A8A" strokeWidth="3" />
                      </g>
                    ) : isRcc ? (
                      <g id={`rccpipe-${idx}`}>
                        <rect x={curX} y={routeY - 9} width={segWidth} height="18" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
                        <line x1={curX} y1={routeY} x2={segEndX} y2={routeY} stroke="#334155" strokeWidth="1.5" strokeDasharray="7,4" />
                        <rect x={curX - 3} y={routeY - 12} width="6" height="24" fill="#64748B" />
                        <rect x={segEndX - 3} y={routeY - 12} width="6" height="24" fill="#64748B" />
                      </g>
                    ) : (
                      /* 9. Normal Trenching with Cable Route Marker (C.M.) posts */
                      <g id={`normaltrench-${idx}`}>
                        <line x1={curX} y1={routeY} x2={segEndX} y2={routeY} stroke="#0C2340" strokeWidth="4.5" />
                        {Array.from({ length: Math.max(Math.floor(segWidth / 120), 1) }).map((_, mIdx) => {
                          const postX = curX + (mIdx + 1) * (segWidth / (Math.floor(segWidth / 120) + 1));
                          return (
                            <g key={mIdx}>
                              <circle cx={postX} cy={routeY} r="3.5" fill="#FFFFFF" stroke="#0C2340" strokeWidth="2" />
                              <line x1={postX} y1={routeY - 4} x2={postX} y2={routeY - 15} stroke="#0C2340" strokeWidth="1.8" />
                              <rect x={postX - 9} y={routeY - 24} width="18" height="10" fill="#F1F5F9" stroke="#0C2340" strokeWidth="1.2" rx="1" />
                              <text x={postX} y={routeY - 17} fontSize="7.5" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" fill="#0C2340">
                                C.M.
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    )}

                    {/* Segment Joint Seam Line */}
                    <line x1={segEndX} y1={routeY - 15} x2={segEndX} y2={routeY + 15} stroke="#0C2340" strokeWidth="1.6" />

                    {/* High-Contrast Method Label Badge Above Route */}
                    {(() => {
                      const isHigh = idx % 2 === 1;
                      const labelY = isHigh ? routeY - 34 : routeY - 20;
                      const pillW = Math.min(methodShort.length * 7.2 + 14, segWidth - 4);
                      return (
                        <g>
                          {isHigh && (
                            <line
                              x1={midX}
                              y1={labelY + 4}
                              x2={midX}
                              y2={routeY - 10}
                              stroke="#94A3B8"
                              strokeWidth="1"
                              strokeDasharray="2,2"
                            />
                          )}
                          <rect
                            x={midX - pillW / 2}
                            y={labelY - 11}
                            width={pillW}
                            height="16"
                            fill={methodBg}
                            stroke={methodColor}
                            strokeWidth="1.2"
                            rx="3"
                          />
                          <text
                            x={midX}
                            y={labelY + 1}
                            fontSize="9.5"
                            fontWeight="800"
                            fontFamily="sans-serif"
                            textAnchor="middle"
                            fill={methodColor}
                          >
                            {methodShort}
                          </text>
                        </g>
                      );
                    })()}

                    {/* Individual Segment Dimension Below Route */}
                    <g transform={`translate(0, ${routeY + 34})`}>
                      <line x1={curX} y1="-7" x2={curX} y2="7" stroke="#64748B" strokeWidth="1" />
                      <line x1={segEndX} y1="-7" x2={segEndX} y2="7" stroke="#64748B" strokeWidth="1" />
                      <line
                        x1={curX}
                        y1="0"
                        x2={segEndX}
                        y2="0"
                        stroke="#0C2340"
                        strokeWidth="1.2"
                        markerStart="url(#dimArrowStart)"
                        markerEnd="url(#dimArrowEnd)"
                      />
                      <rect x={midX - 22} y="-9" width="44" height="15" fill="#FFFFFF" rx="2" />
                      <text
                        x={midX}
                        y="2"
                        fontSize="11"
                        fontWeight="800"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                        fill="#0C2340"
                      >
                        {segLen} m
                      </text>
                    </g>
                  </g>
                );

                curX = segEndX;
                return segElement;
              });
            })()}

            {/* OVERALL ROUTE LENGTH DIMENSION */}
            <g transform={`translate(0, ${routeY + 62})`}>
              <line x1={routeStartX} y1="-9" x2={routeStartX} y2="9" stroke="#0C2340" strokeWidth="1.5" />
              <line x1={routeEndX} y1="-9" x2={routeEndX} y2="9" stroke="#0C2340" strokeWidth="1.5" />
              <line
                x1={routeStartX}
                y1="0"
                x2={routeEndX}
                y2="0"
                stroke="#0C2340"
                strokeWidth="1.8"
                markerStart="url(#dimArrowStart)"
                markerEnd="url(#dimArrowEnd)"
              />
              <rect x={(routeStartX + routeEndX) / 2 - 130} y="-10" width="260" height="20" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1" rx="2" />
              <text
                x={(routeStartX + routeEndX) / 2}
                y="4.5"
                fontSize="12.5"
                fontWeight="800"
                fontFamily="sans-serif"
                textAnchor="middle"
                fill="#0C2340"
                letterSpacing="0.4px"
              >
                TOTAL LENGTH : {totalLength} METRES
              </text>
            </g>
          </g>

          {/* LOWER VARIANT PANELS (Detail 'A', Table, Legend & Notes — No bottom Drawn By details) */}
          <DiagramLowerPanels
            project={project}
            variant={activeVariant}
            vbWidth={VB_WIDTH}
            vbHeight={VB_HEIGHT}
            totalLength={totalLength}
            cableCount={cableCount}
            cableCore={cableCore}
            cableTypeLabel={cableTypeLabel}
            cableConductor={cableConductor}
            primaryDepth={primaryDepth}
            primaryCover={primaryCover}
            uniqueMethods={uniqueMethods}
            onOpenEditInfo={onOpenEditInfo}
            isEditMode={isEditMode}
          />
          </g>

          {/* 7. USER-PLACED INTERACTIVE S&T SYMBOLS (Draggable by hand & included in PNG/PDF exports!) */}
          <g id="layer-placed-symbols">
            {placedSymbols.map((sym) => {
              const isSelected = selectedSymbolId === sym.id;
              return (
                <g
                  key={sym.id}
                  data-placed-symbol="true"
                  data-symbol-id={sym.id}
                  transform={`translate(${sym.x}, ${sym.y})`}
                  style={{ cursor: 'move', touchAction: 'none' }}
                  onPointerDown={(e) => handleSymbolPointerDown(e, sym)}
                  onPointerMove={handleSymbolPointerMove}
                  onPointerUp={handleSymbolPointerUp}
                  onPointerCancel={handleSymbolPointerUp}
                >
                  {/* Generous invisible touch hit target for effortless finger dragging */}
                  <circle cx="0" cy="0" r={Math.max(28 * sym.scale, 26)} fill="transparent" />

                  {/* Refined Liquid Glass Selection Ring - only on selected symbol */}
                  {isSelected && (
                    <g data-editor-ui="true">
                      {/* Soft ambient glow halo */}
                      <rect
                        x={-28 * sym.scale}
                        y={-30 * sym.scale}
                        width={56 * sym.scale}
                        height={64 * sym.scale}
                        rx="12"
                        fill="rgba(2, 132, 199, 0.12)"
                        stroke="#0284C7"
                        strokeWidth="2"
                      />
                      {/* 4 Sleek rounded corner grab markers */}
                      <circle cx={-28 * sym.scale} cy={-30 * sym.scale} r="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                      <circle cx={28 * sym.scale} cy={-30 * sym.scale} r="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                      <circle cx={-28 * sym.scale} cy={34 * sym.scale} r="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                      <circle cx={28 * sym.scale} cy={34 * sym.scale} r="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                    </g>
                  )}

                  {/* Pure inline SVG vector symbol */}
                  <g transform={`scale(${sym.scale}) rotate(${sym.rotation})`}>
                    <RenderInteractiveSymbol type={sym.symbolType} />
                  </g>

                  {/* Crisp Symbol Tag / Label */}
                  {sym.label && (
                    <g transform={`translate(0, ${Math.round(30 * sym.scale) + 4})`}>
                      <rect
                        x={-Math.max(sym.label.length * 4.2 + 6, 18)}
                        y="-9"
                        width={Math.max(sym.label.length * 8.4 + 12, 36)}
                        height="15"
                        rx="3"
                        fill="#0C2340"
                      />
                      <text
                        x="0"
                        y="2"
                        fontSize="10"
                        fontWeight="800"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                        fill="#FFFFFF"
                      >
                        {sym.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
