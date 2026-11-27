import React, { useState } from 'react';
import {
  Menu,
  ArrowLeft,
  Sun,
  Moon,
  Download,
  FileText,
  Share2,
  Pencil,
  Plus,
  Minus,
  RotateCw,
  Copy,
  Trash2,
  Sliders,
  Tag,
  Maximize2,
  Minimize2,
  Check,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { DrawingProject, DrawingVariant, PlacedSymbol, SymbolItem } from '../../types/drawing';
import { CANVAS_CONFIG, UI_LIMITS } from '../../constants/uiConstants';
import { CadCanvas } from '../Canvas/CadCanvas';
import { Button } from '../ui/Button';
import { DrawingVariantPicker } from '../ui/DrawingVariantPicker';
import { DrawingInfoModal } from './DrawingInfoModal';
import { DrawingDetailsEditor } from './DrawingDetailsEditor';
import { SymbolManagerDrawer } from './SymbolManagerDrawer';

interface ResultWorkspaceProps {
  project: DrawingProject;
  symbols: Record<string, SymbolItem>;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onBackToHome: () => void;
  onUpdateProject: (updated: DrawingProject) => void;
  onChangeDrawingVariant: (variant: DrawingVariant) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  selectedSymbol: PlacedSymbol | null;
  onSelectSymbol: (id: string | null) => void;
  onUpdatePlacedSymbols: (next: PlacedSymbol[]) => void;
  onPatchSelectedSymbol: (patch: Partial<PlacedSymbol>) => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onOpenSymbolPicker: () => void;
  onSavePng: () => void;
  onSavePdf: () => void;
  onOpenShare: () => void;
  isBusyExport: boolean;
}

export const ResultWorkspace: React.FC<ResultWorkspaceProps> = ({
  project,
  symbols,
  isDark,
  onToggleTheme,
  onOpenHistory,
  onBackToHome,
  onUpdateProject,
  onChangeDrawingVariant,
  isEditMode,
  onToggleEditMode,
  selectedSymbol,
  onSelectSymbol,
  onUpdatePlacedSymbols,
  onPatchSelectedSymbol,
  onDuplicateSelected,
  onDeleteSelected,
  onOpenSymbolPicker,
  onSavePng,
  onSavePdf,
  onOpenShare,
  isBusyExport,
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [infoModalTab, setInfoModalTab] = useState<'route' | 'segments' | 'cable' | 'titleBlock'>('route');
  const [isSymbolDrawerOpen, setIsSymbolDrawerOpen] = useState<boolean>(false);
  const [isLandscapeMode, setIsLandscapeMode] = useState<boolean>(false);
  const [editActiveSection, setEditActiveSection] = useState<'symbols' | 'details'>('symbols');

  const totalLength = project.segments.reduce((acc, s) => acc + (Number(s.length) || 0), 0);
  const placedCount = (project.placedSymbols || []).length;

  const handleOpenEditInfoWithTab = (tab: 'route' | 'segments' | 'cable' | 'titleBlock' = 'route') => {
    setInfoModalTab(tab);
    setIsInfoModalOpen(true);
  };

  const handleToggleLandscape = () => {
    setIsLandscapeMode((prev) => {
      const next = !prev;
      if (next && (screen.orientation as any)?.lock) {
        try {
          (screen.orientation as any).lock('landscape').catch(() => {});
        } catch {
          // ignore if unsupported
        }
      }
      return next;
    });
  };

  const primaryCable = project.cables && project.cables[0] ? project.cables[0] : null;

  return (
    <div
      className={`min-h-[100dvh] flex flex-col bg-surface-page text-ink-primary ${
        isLandscapeMode ? 'w-full h-[100dvh] overflow-hidden' : ''
      }`}
    >
      {/* Liquid Glass Header Bar */}
      <header
        className={`px-3 sm:px-4 flex items-center justify-between gap-2 glass-header sticky top-0 z-30 transition-all ${
          isLandscapeMode ? 'py-1 min-h-[44px]' : 'py-2 min-h-[52px]'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenHistory}
            className="liquid-glass-icon-btn min-h-[40px] min-w-[40px]"
            aria-label="Open saved drawings"
            title="Saved drawings"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Button variant="secondary" size="sm" onClick={onBackToHome}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">New Prompt</span>
          </Button>

          {/* Prominent Edit Mode Toggle Button */}
          <Button
            variant={isEditMode ? 'accent' : 'secondary'}
            size="sm"
            onClick={onToggleEditMode}
            className={isEditMode ? 'shadow-md animate-pulse' : 'shadow-xs'}
            title={isEditMode ? 'Finish editing and view drawing' : 'Enter Edit Mode to position symbols or adjust details'}
          >
            {isEditMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4 text-primary" />}
            <span>{isEditMode ? 'Done Editing' : 'Edit Mode'}</span>
          </Button>

          {/* Landscape Mode Button */}
          <Button
            variant={isLandscapeMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleToggleLandscape}
            title={isLandscapeMode ? 'Switch to Portrait view' : 'Expand to Landscape view'}
          >
            {isLandscapeMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">{isLandscapeMode ? 'Portrait' : 'Landscape'}</span>
          </Button>
        </div>

        {/* Center Route Tag */}
        <div className="text-center min-w-0 px-2 hidden md:block">
          <h1 className="text-sm font-bold text-ink-primary truncate flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{project.startNode.id} &rarr; {project.endNode.id}</span>
          </h1>
          <p className="text-[11px] text-ink-muted tabular-nums font-medium">
            {totalLength} m · {project.segments.length} segments · RDSO S&amp;T
          </p>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className="liquid-glass-icon-btn min-h-[40px] min-w-[40px]"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
          </button>
        </div>
      </header>

      {/* EDIT MODE CONTROL DOCK (Clean, Focused, Uncluttered) */}
      {isEditMode && !isLandscapeMode && (
        <div className="px-3 sm:px-4 py-2 bg-surface-subtle/80 border-b border-line/50 backdrop-blur-md shrink-0 animate-fadeIn">
          <div className="max-w-md mx-auto flex items-center justify-center">
            {/* Liquid Glass Segmented Pill Tabs for Edit Mode */}
            <div className="flex items-center gap-1 bg-surface-card/90 p-1 rounded-full border border-line/80 shadow-sm w-full">
              <button
                type="button"
                onClick={() => setEditActiveSection('symbols')}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  editActiveSection === 'symbols'
                    ? 'liquid-glass-primary shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Place Symbols ({placedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setEditActiveSection('details')}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  editActiveSection === 'details'
                    ? 'liquid-glass-primary shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Route &amp; Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawing Image Options Strip (Hidden in compact landscape) */}
      {!isLandscapeMode && !isEditMode && (
        <div className="px-3 sm:px-4 pt-2.5 pb-1 bg-surface-page shrink-0">
          <div className="max-w-5xl mx-auto flex flex-col gap-2">
            <DrawingVariantPicker
              value={project.settings.drawingVariant || 'standard'}
              onChange={onChangeDrawingVariant}
            />
          </div>
        </div>
      )}

      {/* Main CAD Drawing Area & Details Panel */}
      <main
        className={`flex-1 flex flex-col transition-all ${
          isLandscapeMode
            ? 'p-0 h-[calc(100dvh-44px)] w-full overflow-hidden'
            : 'px-3 sm:px-4 py-2 w-full max-w-5xl mx-auto overflow-y-auto space-y-3'
        }`}
      >
        {/* CAD Canvas Frame */}
        <div
          className={`w-full bg-surface-card overflow-hidden flex flex-col shadow-xl transition-all shrink-0 ${
            isLandscapeMode
              ? 'rounded-none border-0 h-full'
              : 'h-[52dvh] sm:h-[60dvh] rounded-3xl border border-line/60'
          }`}
        >
          <CadCanvas
            project={project}
            symbols={symbols}
            isEditMode={isEditMode}
            onToggleEditMode={onToggleEditMode}
            selectedSymbolId={selectedSymbol?.id ?? null}
            onSelectSymbol={onSelectSymbol}
            onUpdatePlacedSymbols={onUpdatePlacedSymbols}
            onOpenAddSymbolPicker={onOpenSymbolPicker}
            onOpenEditInfo={handleOpenEditInfoWithTab}
            onOpenSymbolManager={() => setIsSymbolDrawerOpen(true)}
          />
        </div>

        {/* DETAILS SECTION BELOW DRAWING */}
        {!isLandscapeMode && (
          <>
            {isEditMode ? (
              editActiveSection === 'details' ? (
                /* IN EDIT MODE (DETAILS TAB): SHOW THE CLEAN TABBED DETAILS EDITOR */
                <div className="w-full pb-3 shrink-0 animate-fadeIn">
                  <DrawingDetailsEditor
                    project={project}
                    onUpdateProject={onUpdateProject}
                    defaultTab="route"
                  />
                </div>
              ) : (
                /* IN EDIT MODE (SYMBOLS TAB): SHOW A COMPACT INSTRUCTION PILL */
                <div className="w-full pb-3 shrink-0 animate-fadeIn">
                  <div className="glass-panel rounded-2xl p-3 sm:p-3.5 border border-line/60 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 text-ink-secondary">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="font-medium">Tap any symbol to resize, rotate, or duplicate. Drag to reposition.</span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditActiveSection('details')}
                    >
                      <Sliders className="w-3.5 h-3.5 text-primary" />
                      <span>Edit Written Details</span>
                    </Button>
                  </div>
                </div>
              )
            ) : (
              /* IN NORMAL VIEW MODE: ELEGANT LIQUID GLASS SUMMARY CARD */
              <div className="w-full pb-3 shrink-0">
                <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-lg border border-line/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-ink-primary">
                        Drawing Specifications:
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                        {totalLength} meters
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
                      <span className="px-2.5 py-1 rounded-full bg-surface-subtle border border-line/70">
                        From: <strong className="text-ink-primary">{project.startNode.id}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-surface-subtle border border-line/70">
                        To: <strong className="text-ink-primary">{project.endNode.id}</strong>
                      </span>
                      {primaryCable && (
                        <span className="px-2.5 py-1 rounded-full bg-surface-subtle border border-line/70">
                          Cable: <strong className="text-ink-primary">{primaryCable.coreCount} Core {primaryCable.cableType}</strong>
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-surface-subtle border border-line/70">
                        Symbols: <strong className="text-ink-primary">{placedCount} placed</strong>
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditActiveSection('details');
                      if (!isEditMode) onToggleEditMode();
                    }}
                    className="shadow-xs"
                  >
                    <Sliders className="w-4 h-4 text-primary" />
                    <span>Edit Specifications</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Contextual Floating Symbol Editor Dock (Appears when any symbol is selected) */}
      {selectedSymbol && (
        <div className="px-3 py-2 border-t border-line/60 bg-surface-subtle/85 backdrop-blur-xl shrink-0 z-20 animate-fadeIn">
          <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <label
                htmlFor="selected-symbol-tag"
                className="text-xs font-bold text-ink-primary"
              >
                Symbol:
              </label>
              <input
                id="selected-symbol-tag"
                type="text"
                value={selectedSymbol.label}
                onChange={(e) => onPatchSelectedSymbol({ label: e.target.value })}
                maxLength={UI_LIMITS.MAX_SYMBOL_LABEL_LENGTH}
                placeholder="e.g. S12"
                className="w-28 min-h-[38px] px-3.5 py-1 text-sm font-bold glass-input text-ink-primary rounded-full focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-ink-muted mr-1 hidden xs:inline">Size:</span>
              <button
                type="button"
                onClick={() =>
                  onPatchSelectedSymbol({
                    scale: Math.max(
                      CANVAS_CONFIG.SYMBOL_MIN_SCALE,
                      Number((selectedSymbol.scale - CANVAS_CONFIG.SYMBOL_SCALE_STEP).toFixed(2))
                    ),
                  })
                }
                disabled={selectedSymbol.scale <= CANVAS_CONFIG.SYMBOL_MIN_SCALE}
                className="liquid-glass-icon-btn min-h-[38px] min-w-[38px] disabled:opacity-30"
                aria-label="Decrease symbol size"
                title="Decrease size (-)"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onPatchSelectedSymbol({
                    scale: Math.min(
                      CANVAS_CONFIG.SYMBOL_MAX_SCALE,
                      Number((selectedSymbol.scale + CANVAS_CONFIG.SYMBOL_SCALE_STEP).toFixed(2))
                    ),
                  })
                }
                disabled={selectedSymbol.scale >= CANVAS_CONFIG.SYMBOL_MAX_SCALE}
                className="liquid-glass-icon-btn min-h-[38px] min-w-[38px] disabled:opacity-30"
                aria-label="Increase symbol size"
                title="Increase size (+)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onPatchSelectedSymbol({
                    rotation: (selectedSymbol.rotation + CANVAS_CONFIG.SYMBOL_ROTATION_STEP) % 360,
                  })
                }
                className="liquid-glass-secondary min-h-[38px] px-3 inline-flex items-center gap-1 text-xs font-bold"
                aria-label="Rotate symbol 45 degrees"
                title="Rotate 45°"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>45°</span>
              </button>
              <button
                type="button"
                onClick={onDuplicateSelected}
                className="liquid-glass-icon-btn min-h-[38px] min-w-[38px]"
                aria-label="Duplicate symbol"
                title="Duplicate symbol"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onDeleteSelected}
                className="liquid-glass-danger min-h-[38px] min-w-[38px] inline-flex items-center justify-center p-2"
                aria-label="Remove symbol"
                title="Remove symbol"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onSelectSymbol(null)}
                className="liquid-glass-primary min-h-[38px] px-4 inline-flex items-center gap-1 font-bold text-xs shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar: Export & Share */}
      <footer
        className={`glass-header border-t border-line/50 px-3 transition-all shrink-0 sticky bottom-0 z-20 ${
          isLandscapeMode ? 'py-1.5' : 'py-2.5'
        }`}
      >
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={isBusyExport}
              onClick={onOpenShare}
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={isBusyExport}
              onClick={onSavePdf}
            >
              <FileText className="w-4 h-4" />
              <span>A3 PDF</span>
            </Button>
          </div>

          <Button
            variant="primary"
            loading={isBusyExport}
            onClick={onSavePng}
            className="w-full sm:w-auto shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Save PNG Image</span>
          </Button>
        </div>
      </footer>

      {/* Written Info & Words Editor Modal */}
      <DrawingInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        project={project}
        onSave={onUpdateProject}
        initialTab={infoModalTab}
      />

      {/* Symbol Manager Slide-over Drawer */}
      <SymbolManagerDrawer
        isOpen={isSymbolDrawerOpen}
        onClose={() => setIsSymbolDrawerOpen(false)}
        symbols={project.placedSymbols || []}
        selectedSymbolId={selectedSymbol?.id ?? null}
        onSelectSymbol={onSelectSymbol}
        onUpdateSymbols={onUpdatePlacedSymbols}
        onOpenPicker={onOpenSymbolPicker}
      />
    </div>
  );
};
