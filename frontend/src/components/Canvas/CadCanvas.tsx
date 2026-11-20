import React, { useRef, useState } from 'react';
import { Plus, Move, Check, ZoomIn, ZoomOut, Maximize2, Sliders, Tag } from 'lucide-react';
import { DrawingProject, PlacedSymbol, SymbolItem } from '../../types/drawing';
import { CANVAS_CONFIG } from '../../constants/uiConstants';
import { RenderInteractiveSymbol } from './InteractiveSymbols';
import { FieldSchematicSheet, MonochromeBlueprintSheet } from './DrawingVariants';

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
  const routeY = 175;

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
      {/* CAD Viewport Toolbar */}
      <div className="min-h-[52px] px-3 py-1 bg-surface-subtle border-b border-line flex items-center justify-between gap-2 text-ink-primary z-10 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {onToggleEditMode && (
            <button
              type="button"
              onClick={onToggleEditMode}
              className={`min-h-[40px] px-3 inline-flex items-center gap-1.5 rounded-sm text-xs font-bold border transition-all duration-fast shrink-0 shadow-xs ${
                isEditMode
                  ? 'bg-accent text-white border-accent shadow-sm ring-2 ring-accent/30'
                  : 'bg-surface-card hover:bg-surface-hover active:bg-surface-active text-ink-primary border-line'
              }`}
              title="Toggle interactive editing mode for symbols and text"
            >
              <Move className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Exit Editing' : 'Edit Mode'}</span>
            </button>
          )}
          {onOpenEditInfo && (
            <button
              type="button"
              onClick={() => onOpenEditInfo()}
              className="min-h-[40px] px-2.5 inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-ink rounded-sm text-xs font-semibold shadow-xs transition-colors duration-fast shrink-0"
              title="Edit written text, names, lengths, and notes"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Words &amp; Text</span>
            </button>
          )}
          {onOpenAddSymbolPicker && (
            <button
              type="button"
              onClick={onOpenAddSymbolPicker}
              className="min-h-[40px] px-2.5 inline-flex items-center gap-1.5 bg-surface-card hover:bg-surface-hover active:bg-surface-active text-ink-primary border border-line rounded-sm text-xs font-semibold shadow-xs transition-colors duration-fast shrink-0"
              title="Add S&T symbol to drawing"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Symbol</span>
            </button>
          )}
          {onOpenSymbolManager && (
            <button
              type="button"
              onClick={onOpenSymbolManager}
              className="min-h-[40px] px-2.5 inline-flex items-center gap-1.5 bg-surface-card hover:bg-surface-hover active:bg-surface-active text-ink-primary border border-line rounded-sm text-xs font-semibold shadow-xs transition-colors duration-fast shrink-0"
              title="Manage placed symbols"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Symbols ({placedSymbols.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.max(z - CANVAS_CONFIG.ZOOM_STEP, CANVAS_CONFIG.MIN_ZOOM))
            }
            disabled={zoom <= CANVAS_CONFIG.MIN_ZOOM}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-hover active:bg-surface-active rounded-sm disabled:opacity-40 transition-colors duration-fast"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-ink-primary tabular-nums w-11 text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.min(z + CANVAS_CONFIG.ZOOM_STEP, CANVAS_CONFIG.MAX_ZOOM))
            }
            disabled={zoom >= CANVAS_CONFIG.MAX_ZOOM}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-hover active:bg-surface-active rounded-sm disabled:opacity-40 transition-colors duration-fast"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="min-h-[44px] px-2.5 inline-flex items-center gap-1 bg-surface-card text-ink-primary hover:bg-surface-hover active:bg-surface-active rounded-sm text-xs font-medium border border-line transition-colors duration-fast"
            title="Reset zoom and pan to fit"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit</span>
          </button>
        </div>
      </div>

      {isEditMode && (
        <div className="px-3 py-1.5 bg-accent-subtle text-ink-primary text-xs font-semibold flex items-center justify-between border-b border-accent-border shrink-0 animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Editing Mode Active: Drag symbols to reposition, or click any symbol / words on the drawing to re-write.</span>
          </span>
          <span className="tabular-nums text-ink-secondary hidden sm:inline">{placedSymbols.length} placed symbol(s)</span>
        </div>
      )}

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

          {project.settings.drawingVariant === 'schematic' ? (
            <FieldSchematicSheet
              project={project}
              vbWidth={VB_WIDTH}
              vbHeight={VB_HEIGHT}
              totalLength={totalLength}
              cableCount={cableCount}
              cableCore={cableCore}
              cableTypeLabel={cableTypeLabel}
              cableConductor={cableConductor}
              primaryDepth={primaryDepth}
              primaryCover={primaryCover}
            />
          ) : project.settings.drawingVariant === 'blueprint' ? (
            <MonochromeBlueprintSheet
              project={project}
              vbWidth={VB_WIDTH}
              vbHeight={VB_HEIGHT}
              totalLength={totalLength}
              cableCount={cableCount}
              cableCore={cableCore}
              cableTypeLabel={cableTypeLabel}
              cableConductor={cableConductor}
              primaryDepth={primaryDepth}
              primaryCover={primaryCover}
            />
          ) : (
            <g id="variant-standard-plan">
              {/* 1. CLEAN ENGINEERING BORDER */}
              <rect x="12" y="12" width={VB_WIDTH - 24} height={VB_HEIGHT - 24} fill="none" stroke="#0C2340" strokeWidth="2" rx="3" />
              <rect x="16" y="16" width={VB_WIDTH - 32} height={VB_HEIGHT - 32} fill="none" stroke="#CBD2DC" strokeWidth="1" rx="2" />

          {/* 2. AUTHENTIC RAILWAY TITLE BLOCK HEADER */}
          <g transform="translate(30, 16)">
            <text x="0" y="12" fontSize="10.5" fontWeight="700" fontFamily="sans-serif" fill="#475569" letterSpacing="0.8px">
              {(project.metadata.railwayZone || 'INDIAN RAILWAYS').toUpperCase()} — SIGNAL &amp; TELECOMMUNICATION DEPARTMENT
            </text>
            <text x={VB_WIDTH - 60} y="12" fontSize="11" fontWeight="700" fontFamily="sans-serif" fill="#1E3A8A" textAnchor="end">
              TOTAL: {totalLength} m &nbsp;|&nbsp; {project.metadata.drawingNumber || 'IR/S&T/CAD'}
            </text>
            <text
              x="0"
              y="28"
              fontSize="13.5"
              fontWeight="900"
              fontFamily="sans-serif"
              fill="#0C2340"
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
            <line x1="0" y1="34" x2={VB_WIDTH - 60} y2="34" stroke="#0C2340" strokeWidth="1.2" />
          </g>

          {/* 3. TOP REFERENCE ROW: START/END BADGES & TRACK C/L DESIGNATION */}
          {/* Start Location Node Badge (Top Left) */}
          <g
            transform={`translate(${routeStartX}, 63)`}
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

          {/* End Location Node Badge (Top Right) */}
          <g
            transform={`translate(${routeEndX}, 63)`}
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
            <line x1="220" y1="63" x2="280" y2="63" stroke="#64748B" strokeWidth="1" strokeDasharray="6,3" />
            <text x="480" y="66.5" fontSize="9" fontWeight="800" fontFamily="sans-serif" fill="#334155" textAnchor="middle" letterSpacing="0.4px">
              C/L OF NEAREST RAILWAY TRACK (1676 mm BG पटरी — OFFSET: 3.5 m MIN)
            </text>
            <line x1="680" y1="63" x2="740" y2="63" stroke="#64748B" strokeWidth="1" strokeDasharray="6,3" />
          </g>

          {/* 3b. REALISTIC BROAD GAUGE RAILWAY TRACK (रेल की पटरी - Rail Patri) */}
          <g id="layer-rail-track">
            {/* Ballast Formation Bed (गिट्टी की ढलान) */}
            <polygon
              points="75,114 885,114 875,82 85,82"
              fill="url(#ballastPattern)"
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
            {/* Ballast shoulder slope shadow line */}
            <line x1="75" y1="114" x2="885" y2="114" stroke="#64748B" strokeWidth="1.6" />

            {/* PSC Sleepers (प्रीस्ट्रेस्ड कंक्रीट स्लीपर) across the ballast */}
            {(() => {
              const sleepers: React.ReactNode[] = [];
              for (let sx = 86; sx <= 874; sx += 15) {
                // Extended switch ties near Point Machine at the end (X > 820)
                const isExtendedSwitchTie = sx >= 822 && sx <= 864;
                const sleeperHeight = isExtendedSwitchTie ? 44 : 22;
                const sleeperY = 88;

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
                    <rect x={sx - 3} y={92} width="6" height="4" fill="#334155" />
                    {/* Bottom rail seat pad */}
                    <rect x={sx - 3} y={104} width="6" height="4" fill="#334155" />
                    {/* Pandrol clip marks */}
                    <circle cx={sx} cy={91.5} r="1.1" fill="#0F172A" />
                    <circle cx={sx} cy={108.5} r="1.1" fill="#0F172A" />
                  </g>
                );
              }
              return sleepers;
            })()}

            {/* TWIN CONTINUOUS STEEL RAILS (दोहरी स्टील रेल पटरी) */}
            {/* Top Steel Rail (Y = 94) */}
            <g id="rail-top">
              <line x1="76" y1="94" x2="884" y2="94" stroke="#0F172A" strokeWidth="4.2" strokeLinecap="round" />
              <line x1="76" y1="94" x2="884" y2="94" stroke="#475569" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="76" y1="93.5" x2="884" y2="93.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* Bottom Steel Rail (Y = 106, Broad Gauge 1676mm scale) */}
            <g id="rail-bottom">
              <line x1="76" y1="106" x2="884" y2="106" stroke="#0F172A" strokeWidth="4.2" strokeLinecap="round" />
              <line x1="76" y1="106" x2="884" y2="106" stroke="#475569" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="76" y1="105.5" x2="884" y2="105.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* Turnout Switch Blades / Tongue Rails near Point Machine (at end node) */}
            <g id="turnout-switch-points">
              <line x1="822" y1="106" x2="862" y2="120" stroke="#0F172A" strokeWidth="3" />
              <line x1="822" y1="106" x2="862" y2="120" stroke="#64748B" strokeWidth="1.8" />
              {/* Switch stretcher bar & drive rod connecting Point Machine to rail */}
              <line x1="840" y1="106" x2="840" y2="132" stroke="#0C2340" strokeWidth="2.4" />
              <line x1="854" y1="106" x2="854" y2="132" stroke="#0C2340" strokeWidth="2.4" />
              <rect x="836" y="112" width="22" height="3" fill="#1E293B" />
            </g>

            {/* Glued Insulated Joints (GIJ) on rail */}
            <line x1="180" y1="89" x2="180" y2="111" stroke="#B91C1C" strokeWidth="2.2" strokeDasharray="3,2" />
            <line x1="720" y1="89" x2="720" y2="111" stroke="#B91C1C" strokeWidth="2.2" strokeDasharray="3,2" />

            {/* Track Centerline (C/L) reference */}
            <line
              x1="76"
              y1="100"
              x2="884"
              y2="100"
              stroke="#64748B"
              strokeWidth="1.2"
              strokeDasharray="14,4,3,4"
            />

            {/* Safe Offset Dimension Indicator between Track and Cable Route */}
            <g transform="translate(64, 106)">
              <line x1="0" y1="0" x2="0" y2={routeY - 106} stroke="#0284C7" strokeWidth="1.2" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
              <text x="-5" y={(routeY - 106) / 2 + 3} fontSize="8.5" fontWeight="800" fill="#0284C7" textAnchor="end">
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
                        <rect x={curX} y={112} width={segWidth} height="5" fill="#0F766E" rx="1" />
                        <rect x={curX} y={routeY + 6} width={segWidth} height="5" fill="#0F766E" rx="1" />

                        {/* Diagonal Structural Steel Warren Truss Struts */}
                        {Array.from({ length: Math.max(Math.floor(segWidth / 22), 2) }).map((_, bIdx) => {
                          const x0 = curX + bIdx * 22;
                          const x1 = Math.min(x0 + 22, segEndX);
                          return (
                            <path
                              key={bIdx}
                              d={`M ${x0} ${routeY + 6} L ${(x0 + x1) / 2} 115 L ${x1} ${routeY + 6}`}
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
                        <rect x={midX - 20} y={112} width="40" height="58" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" rx="2" />
                        <path
                          d={`M ${midX - 14} 170 L ${midX - 14} 136 Q ${midX} 124 ${midX + 14} 136 L ${midX + 14} 170 Z`}
                          fill="#334155"
                          stroke="#0F172A"
                          strokeWidth="1.5"
                        />
                        {/* Flowing Water Stream underneath */}
                        <path d={`M ${midX - 20} 170 Q ${midX} 166 ${midX + 20} 170`} stroke="#0284C7" strokeWidth="2.5" />

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
                        <rect x={midX - 16} y={82} width="32" height="100" fill="#FEF3C7" stroke="#92400E" strokeWidth="2.2" rx="3" />
                        <line x1={midX - 9} y1={82} x2={midX - 9} y2={182} stroke="#0F172A" strokeWidth="3" />
                        <line x1={midX + 9} y1={82} x2={midX + 9} y2={182} stroke="#0F172A" strokeWidth="3" />
                        <rect x={curX} y={routeY - 8} width={segWidth} height="16" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
                      </g>
                    ) : isRoadCross ? (
                      /* 5. REAL-WORLD ROAD CROSSING: Asphalt Road across Track + Barrier Boom */
                      <g id={`roadcross-${idx}`}>
                        <rect x={midX - 24} y={82} width="48" height="100" fill="#475569" stroke="#1E293B" strokeWidth="1.8" rx="2" />
                        <line x1={midX} y1={84} x2={midX} y2={182} stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5,4" />
                        <rect x={midX - 26} y={114} width="52" height="5" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
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
                    <g transform={`translate(0, ${routeY + 36})`}>
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
            <g transform={`translate(0, ${routeY + 68})`}>
              <line x1={routeStartX} y1="-10" x2={routeStartX} y2="10" stroke="#0C2340" strokeWidth="1.5" />
              <line x1={routeEndX} y1="-10" x2={routeEndX} y2="10" stroke="#0C2340" strokeWidth="1.5" />
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
              <rect x={(routeStartX + routeEndX) / 2 - 130} y="-11" width="260" height="22" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1" rx="2" />
              <text
                x={(routeStartX + routeEndX) / 2}
                y="5"
                fontSize="13"
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

          {/* 5. TWO-PANEL BALANCED ENGINEERING SECTION */}
          {/* PANEL A: DETAIL 'A' — TRENCH CROSS-SECTION (LEFT) */}
          <g transform="translate(30, 275)" id="layer-callout-trench">
            <rect x="0" y="0" width="440" height="230" fill="#F8FAFC" stroke="#0C2340" strokeWidth="1.5" rx="4" />
            <rect x="0" y="0" width="440" height="28" fill="#0C2340" rx="3" />
            <text x="14" y="19" fill="#FFFFFF" fontSize="12" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5px">
              DETAIL 'A' — CABLE TRENCH CROSS-SECTION
            </text>

            {/* Realistic Trench Cut Diagram */}
            <g transform="translate(90, 48)">
              {/* Ground Level Surface Line */}
              <line x1="-60" y1="0" x2="60" y2="0" stroke="#334155" strokeWidth="2" />
              {/* Ground hatching */}
              <rect x="-60" y="-10" width="120" height="10" fill="url(#earthHatch)" />
              <text x="-65" y="-3" fontSize="10" fontWeight="800" fill="#475569" textAnchor="end">
                G.L. ▽
              </text>

              {/* Trench Walls */}
              <line x1="-38" y1="0" x2="-35" y2="105" stroke="#0C2340" strokeWidth="2" />
              <line x1="38" y1="0" x2="35" y2="105" stroke="#0C2340" strokeWidth="2" />
              <line x1="-35" y1="105" x2="35" y2="105" stroke="#0C2340" strokeWidth="2" />

              {/* Depth Dimension (Dynamic from route!) */}
              <line x1="50" y1="0" x2="50" y2="105" stroke="#0C2340" strokeWidth="1" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
              <text x="56" y="56" fontSize="10" fontWeight="800" fill="#0C2340">
                {primaryDepth.toFixed(1)} m
              </text>

              {/* Sand Bedding Layer (50 mm) */}
              <rect x="-34" y="70" width="68" height="35" fill="url(#sandPattern)" stroke="#CBD5E1" strokeWidth="0.8" />

              {/* Protective Bricks laid flat */}
              <rect x="-32" y="52" width="64" height="16" fill="#B45309" stroke="#78350F" strokeWidth="1" rx="1" />
              <text x="0" y="63" fontSize="8" fontWeight="800" fill="#FFFFFF" textAnchor="middle">
                CLASS-II BRICK
              </text>

              {/* 7 Cable cores in sand bedding */}
              {(() => {
                const count = Math.min(Math.max(cableCount, 1), 12);
                const r = 4.5;
                if (count === 1) {
                  return <circle cx="0" cy="88" r="7" fill="#0C2340" />;
                }
                const radius = 14;
                return Array.from({ length: count }).map((_, cIdx) => {
                  const angle = (cIdx * 2 * Math.PI) / count;
                  const cx = Math.round(radius * Math.cos(angle));
                  const cy = Math.round(88 + radius * Math.sin(angle));
                  return (
                    <g key={cIdx}>
                      <circle cx={cx} cy={cy} r={r} fill="#0C2340" stroke="#FFFFFF" strokeWidth="0.8" />
                      <circle cx={cx} cy={cy} r={r - 2} fill="#B45309" />
                    </g>
                  );
                });
              })()}
            </g>

            {/* Technical Trench Notes (Dynamic from actual cable & route specs) */}
            <g
              transform="translate(190, 48)"
              style={{ cursor: isEditMode ? 'pointer' : 'default' }}
              onClick={(e) => {
                if (isEditMode && onOpenEditInfo) {
                  e.stopPropagation();
                  onOpenEditInfo('cable');
                }
              }}
            >
              <text x="0" y="16" fontSize="13.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">
                {cableCount} Nos. x {cableCore} Core {cableTypeLabel}
              </text>
              <text x="0" y="34" fontSize="11" fontWeight="700" fontFamily="sans-serif" fill="#1E3A8A">
                {cableConductor} Armoured Railway Cable
              </text>

              <line x1="0" y1="46" x2="230" y2="46" stroke="#CBD2DC" strokeWidth="1" />

              <text x="0" y="66" fontSize="11" fontWeight="600" fontFamily="sans-serif" fill="#334155">
                • Trench Depth: {primaryDepth.toFixed(1)} m below G.L. (Min)
              </text>
              <text x="0" y="86" fontSize="11" fontWeight="600" fontFamily="sans-serif" fill="#334155">
                • Sand Bedding: 50 mm clean river sand layer
              </text>
              <text x="0" y="106" fontSize="11" fontWeight="600" fontFamily="sans-serif" fill="#334155">
                • Protection: {primaryCover.slice(0, 30)}
              </text>
              <text x="0" y="126" fontSize="11" fontWeight="600" fontFamily="sans-serif" fill="#334155">
                • Ref Standard: IRSEM Part-II / RDSO
              </text>
            </g>
          </g>

          {/* PANEL B: GENERAL NOTES & DYNAMIC SYMBOLS LEGEND (RIGHT) */}
          <g
            transform="translate(490, 275)"
            id="layer-legend-notes"
            style={{ cursor: isEditMode ? 'pointer' : 'default' }}
            onClick={(e) => {
              if (isEditMode && onOpenEditInfo) {
                e.stopPropagation();
                onOpenEditInfo('titleBlock');
              }
            }}
          >
            <rect x="0" y="0" width="440" height="230" fill="#F8FAFC" stroke={isEditMode ? '#0284C7' : '#0C2340'} strokeWidth={isEditMode ? '1.8' : '1.5'} rx="4" />
            <rect x="0" y="0" width="440" height="28" fill="#0C2340" rx="3" />
            <text x="14" y="19" fill="#FFFFFF" fontSize="12" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5px">
              GENERAL NOTES &amp; DRAWING LEGEND {isEditMode && '(CLICK TO EDIT)'}
            </text>

            {/* Dynamic Graphical Legend based on actual laying methods in THIS drawing */}
            <g transform="translate(16, 40)">
              {uniqueMethods.map((m, lIdx) => {
                const y = lIdx * 20;
                const descMap: Record<string, string> = {
                  'Trenchless-HDD': 'Trenchless / HDD bore under crossings (1.5 m)',
                  'GI Pipe': '100 mm dia GI Pipe Class-B protective casing',
                  'RCC Pipe': '150 mm dia RCC Pipe NP-2 heavy casing',
                  'HDPE Pipe': '110 mm dia DWC HDPE corrugated duct',
                  'Track crossing': 'Railway Track Crossing with RCC pipe (1.2 m)',
                  'Rail crossing': 'Railway Track Crossing with RCC pipe (1.2 m)',
                  'Road crossing': 'Road Crossing with GI/HDD protective pipe',
                  'Along Bridge': 'Along Bridge in galvanized cable tray',
                  'Culvert crossing': 'Culvert Crossing on GI pipe brackets',
                  'Cable Trough': 'Precast RCC Cable Trough along formation',
                  'Cable Tray': 'Hot-dip galvanized metallic Cable Tray',
                  'Normal Trenching': 'Normal Trenching with Cable Markers (C.M.)',
                };
                return (
                  <g key={m} transform={`translate(0, ${y})`}>
                    {m === 'Trenchless-HDD' ? (
                      <rect x="0" y="0" width="26" height="12" fill="url(#hddHatch)" stroke="#B91C1C" strokeWidth="1.5" />
                    ) : m === 'GI Pipe' ? (
                      <rect x="0" y="0" width="26" height="12" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="1.5" />
                    ) : m === 'RCC Pipe' ? (
                      <rect x="0" y="0" width="26" height="12" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
                    ) : m === 'HDPE Pipe' ? (
                      <rect x="0" y="0" width="26" height="12" fill="#FFEDD5" stroke="#C2410C" strokeWidth="1.5" />
                    ) : m === 'Track crossing' || m === 'Rail crossing' ? (
                      <rect x="0" y="0" width="26" height="12" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.5" />
                    ) : m === 'Road crossing' ? (
                      <rect x="0" y="0" width="26" height="12" fill="#475569" stroke="#1E293B" strokeWidth="1.5" />
                    ) : m === 'Along Bridge' || m === 'Culvert crossing' ? (
                      <rect x="0" y="0" width="26" height="12" fill="#CCFBF1" stroke="#0F766E" strokeWidth="1.5" />
                    ) : m === 'Cable Trough' || m === 'Cable Tray' ? (
                      <rect x="0" y="0" width="26" height="12" fill="#EDE9FE" stroke="#6D28D9" strokeWidth="1.5" />
                    ) : (
                      <g>
                        <line x1="0" y1="6" x2="26" y2="6" stroke="#0C2340" strokeWidth="3" />
                        <circle cx="13" cy="6" r="3" fill="#FFFFFF" stroke="#0C2340" strokeWidth="1.5" />
                      </g>
                    )}
                    <text x="34" y="10" fontSize="10.5" fontWeight="700" fontFamily="sans-serif" fill="#1E293B">
                      {descMap[m] || m}
                    </text>
                  </g>
                );
              })}
            </g>

            <line x1="16" y1="124" x2="424" y2="124" stroke="#CBD2DC" strokeWidth="1" />

            {/* 3 Essential Indian Railways Engineering Rules */}
            <g transform="translate(16, 138)">
              <text x="0" y="6" fontSize="10.5" fontWeight="700" fontFamily="sans-serif" fill="#0C2340">
                1. Cable Route Markers (C.M.) installed every 50 m &amp; track bends.
              </text>
              <text x="0" y="26" fontSize="10.5" fontWeight="700" fontFamily="sans-serif" fill="#0C2340">
                2. Minimum bending radius of cable shall not be less than 15D.
              </text>
              <text x="0" y="46" fontSize="10.5" fontWeight="700" fontFamily="sans-serif" fill="#0C2340">
                3. Route: {project.segments.length} segment(s) • {placedSymbols.length} S&amp;T symbol(s) • IRSEM Part-II.
              </text>
            </g>
          </g>

          {/* 6. ENGINEERING STAMP / TITLE BLOCK (BOTTOM — Dynamic!) */}
          <g
            transform={`translate(30, ${VB_HEIGHT - 65})`}
            style={{ cursor: isEditMode ? 'pointer' : 'default' }}
            onClick={(e) => {
              if (isEditMode && onOpenEditInfo) {
                e.stopPropagation();
                onOpenEditInfo('titleBlock');
              }
            }}
          >
            <rect x="0" y="0" width={VB_WIDTH - 60} height="38" fill="#F1F5F9" stroke={isEditMode ? '#F59E0B' : '#0C2340'} strokeWidth={isEditMode ? '1.8' : '1.2'} />
            <line x1="180" y1="0" x2="180" y2="38" stroke="#0C2340" strokeWidth="1" />
            <line x1="360" y1="0" x2="360" y2="38" stroke="#0C2340" strokeWidth="1" />
            <line x1="540" y1="0" x2="540" y2="38" stroke="#0C2340" strokeWidth="1" />
            <line x1="720" y1="0" x2="720" y2="38" stroke="#0C2340" strokeWidth="1" />

            <text x="12" y="15" fontSize="9" fontWeight="700" fontFamily="sans-serif" fill="#64748B">DRAWN BY:</text>
            <text x="12" y="29" fontSize="10.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">
              {(project.metadata.preparedBy || 'SSE / SIG / DESIGN').slice(0, 20)}
            </text>

            <text x="192" y="15" fontSize="9" fontWeight="700" fontFamily="sans-serif" fill="#64748B">CHECKED BY:</text>
            <text x="192" y="29" fontSize="10.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">
              {(project.metadata.checkedBy || 'ASTE / S&T').slice(0, 20)}
            </text>

            <text x="372" y="15" fontSize="9" fontWeight="700" fontFamily="sans-serif" fill="#64748B">APPROVED BY:</text>
            <text x="372" y="29" fontSize="10.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">
              {(project.metadata.approvedBy || 'DSTE / SR. DSTE').slice(0, 20)}
            </text>

            <text x="552" y="15" fontSize="9" fontWeight="700" fontFamily="sans-serif" fill="#64748B">RAILWAY / DIVISION:</text>
            <text x="552" y="29" fontSize="10.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">
              {(project.metadata.railwayZone || 'INDIAN RAILWAYS').slice(0, 18)} / {(project.metadata.division || 'S&T').slice(0, 8)}
            </text>

            <text x="732" y="15" fontSize="9" fontWeight="700" fontFamily="sans-serif" fill="#64748B">DATE / REV:</text>
            <text x="732" y="29" fontSize="10.5" fontWeight="800" fontFamily="sans-serif" fill="#0C2340">
              {project.metadata.date || '2026'} ({project.metadata.revision || 'R0'})
            </text>
          </g>
            </g>
          )}

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

                  {/* Editor-only selection halo (automatically stripped during PNG/PDF export) */}
                  {(isSelected || isEditMode) && (
                    <rect
                      data-editor-ui="true"
                      x={-26 * sym.scale}
                      y={-28 * sym.scale}
                      width={52 * sym.scale}
                      height={66 * sym.scale}
                      rx="6"
                      fill={isSelected ? 'rgba(14, 165, 233, 0.12)' : 'transparent'}
                      stroke={isSelected ? '#0284C7' : '#94A3B8'}
                      strokeWidth={isSelected ? '2' : '1'}
                      strokeDasharray={isSelected ? '4,3' : '3,3'}
                    />
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
