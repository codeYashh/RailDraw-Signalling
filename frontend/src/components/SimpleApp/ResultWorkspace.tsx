import React, { useState, useEffect } from 'react';
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
  Smartphone,
  Check,
} from 'lucide-react';
import { DrawingProject, DrawingVariant, PlacedSymbol, SymbolItem } from '../../types/drawing';
import { CANVAS_CONFIG, UI_LIMITS } from '../../constants/uiConstants';
import { CadCanvas } from '../Canvas/CadCanvas';
import { Button } from '../ui/Button';
import { DrawingVariantPicker } from '../ui/DrawingVariantPicker';
import { DrawingInfoModal } from './DrawingInfoModal';
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

  const totalLength = project.segments.reduce((acc, s) => acc + (Number(s.length) || 0), 0);

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

  return (
    <div
      className={`min-h-[100dvh] flex flex-col bg-surface-page text-ink-primary ${
        isLandscapeMode ? 'w-full h-[100dvh] overflow-hidden' : ''
      }`}
    >
      {/* Top Bar */}
      <header
        className={`px-3 flex items-center justify-between gap-2 border-b border-line bg-surface-card transition-all ${
          isLandscapeMode ? 'py-1 min-h-[42px]' : 'py-2 min-h-[50px]'
        }`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenHistory}
            className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover active:bg-surface-active transition-colors duration-fast"
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
            variant={isEditMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={onToggleEditMode}
            className={isEditMode ? 'ring-2 ring-accent/40 font-bold' : ''}
            title={isEditMode ? 'Finish editing and return to view mode' : 'Enable editing for symbols and words'}
          >
            {isEditMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            <span>{isEditMode ? 'Done Editing' : 'Edit Mode'}</span>
          </Button>

          {/* Quick Edit Words Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenEditInfoWithTab('route')}
            title="Edit route names, lengths, cables, and notes"
          >
            <Sliders className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Edit Words</span>
          </Button>

          {/* Landscape Mode Toggle Button */}
          <Button
            variant={isLandscapeMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleToggleLandscape}
            title={isLandscapeMode ? 'Switch to Portrait view' : 'Expand & rotate to Landscape view for wider CAD viewing'}
          >
            {isLandscapeMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden xs:inline">{isLandscapeMode ? 'Portrait' : 'Landscape'}</span>
          </Button>
        </div>

        <div className="text-center min-w-0 px-2 hidden md:block">
          <h1 className="text-sm font-semibold text-ink-primary truncate">
            {project.startNode.id} to {project.endNode.id}
          </h1>
          <p className="text-xs text-ink-muted tabular-nums">
            {totalLength} m · {project.segments.length} segments
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSymbolDrawerOpen(true)}
            title="Manage placed symbols"
          >
            <Tag className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline">Symbols</span>
          </Button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover active:bg-surface-active transition-colors duration-fast"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Drawing Image Options Strip (Hidden in compact landscape to maximize sheet) */}
      {!isLandscapeMode && (
        <div className="px-3 sm:px-4 pt-2 pb-1 bg-surface-page shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <DrawingVariantPicker
              value={project.settings.drawingVariant || 'standard'}
              onChange={onChangeDrawingVariant}
            />

            <span className="text-xs text-ink-muted hidden md:inline">
              {isEditMode ? (
                <span className="text-accent font-semibold">
                  Edit Mode Active: Drag symbols or click any text on the drawing to re-write.
                </span>
              ) : (
                <>
                  Click <b>Edit Mode</b> or <b>Edit Words</b> to customize symbols, lengths, and titles.
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Main CAD Drawing Area */}
      <main
        className={`flex-1 overflow-hidden flex items-center justify-center transition-all ${
          isLandscapeMode
            ? 'p-0 h-[calc(100dvh-44px)] w-full'
            : 'px-3 sm:px-4 py-1.5'
        }`}
      >
        <div
          className={`w-full h-full bg-surface-card overflow-hidden flex flex-col shadow-sm transition-all ${
            isLandscapeMode
              ? 'rounded-none border-0 max-h-none'
              : 'max-h-[68dvh] rounded-md border border-line'
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
      </main>

      {/* Contextual Symbol Editor Strip (Appears when any symbol is selected) */}
      {selectedSymbol && (
        <div className="px-3 py-2 border-t border-primary-border bg-primary-subtle shrink-0">
          <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="selected-symbol-tag"
                className="text-xs font-semibold text-ink-secondary"
              >
                Symbol Label:
              </label>
              <input
                id="selected-symbol-tag"
                type="text"
                value={selectedSymbol.label}
                onChange={(e) => onPatchSelectedSymbol({ label: e.target.value })}
                maxLength={UI_LIMITS.MAX_SYMBOL_LABEL_LENGTH}
                placeholder="e.g. S12"
                className="w-28 min-h-[38px] px-2.5 py-1 text-sm font-semibold bg-surface-card text-ink-primary border border-line rounded-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                iconOnly
                onClick={() =>
                  onPatchSelectedSymbol({
                    scale: Math.max(
                      CANVAS_CONFIG.SYMBOL_MIN_SCALE,
                      Number((selectedSymbol.scale - CANVAS_CONFIG.SYMBOL_SCALE_STEP).toFixed(2))
                    ),
                  })
                }
                disabled={selectedSymbol.scale <= CANVAS_CONFIG.SYMBOL_MIN_SCALE}
                aria-label="Decrease symbol size"
                title="Decrease size"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                iconOnly
                onClick={() =>
                  onPatchSelectedSymbol({
                    scale: Math.min(
                      CANVAS_CONFIG.SYMBOL_MAX_SCALE,
                      Number((selectedSymbol.scale + CANVAS_CONFIG.SYMBOL_SCALE_STEP).toFixed(2))
                    ),
                  })
                }
                disabled={selectedSymbol.scale >= CANVAS_CONFIG.SYMBOL_MAX_SCALE}
                aria-label="Increase symbol size"
                title="Increase size"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                iconOnly
                onClick={() =>
                  onPatchSelectedSymbol({
                    rotation: (selectedSymbol.rotation + CANVAS_CONFIG.SYMBOL_ROTATION_STEP) % 360,
                  })
                }
                aria-label="Rotate symbol 45 degrees"
                title="Rotate 45°"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                iconOnly
                onClick={onDuplicateSelected}
                aria-label="Duplicate symbol"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                iconOnly
                onClick={onDeleteSelected}
                aria-label="Remove symbol"
                title="Remove symbol"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar: Export & Share */}
      <footer
        className={`border-t border-line bg-surface-card px-3 transition-all shrink-0 ${
          isLandscapeMode ? 'py-1.5' : 'py-2.5'
        }`}
      >
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="grid grid-cols-4 sm:flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenEditInfoWithTab('route')}
              title="Edit words, route names, and notes"
            >
              <Sliders className="w-4 h-4 text-primary" />
              <span>Edit Words</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSymbolDrawerOpen(true)}
              title="Manage placed symbols"
            >
              <Tag className="w-4 h-4 text-accent" />
              <span>Symbols</span>
            </Button>
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
            className="w-full sm:w-auto"
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
