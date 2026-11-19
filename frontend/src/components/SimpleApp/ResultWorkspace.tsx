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
  const [isSymbolDrawerOpen, setIsSymbolDrawerOpen] = useState<boolean>(false);

  const totalLength = project.segments.reduce((acc, s) => acc + (Number(s.length) || 0), 0);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-page text-ink-primary">
      {/* Top Bar */}
      <header className="px-3 py-2 flex items-center justify-between gap-2 border-b border-line bg-surface-card">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenHistory}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover active:bg-surface-active transition-colors duration-fast"
            aria-label="Open saved drawings"
            title="Saved drawings"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Button variant="secondary" size="sm" onClick={onBackToHome}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">New Prompt</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setIsInfoModalOpen(true)}>
            <Sliders className="w-4 h-4 text-primary" />
            <span>Edit Info</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setIsSymbolDrawerOpen(true)}>
            <Tag className="w-4 h-4 text-accent" />
            <span>Symbols</span>
          </Button>
        </div>

        <div className="text-center min-w-0 px-2 hidden sm:block">
          <h1 className="text-sm font-semibold text-ink-primary truncate">
            {project.startNode.id} to {project.endNode.id}
          </h1>
          <p className="text-xs text-ink-muted tabular-nums">
            {totalLength} m · {project.segments.length} segments
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover active:bg-surface-active transition-colors duration-fast"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Drawing Image Options Strip */}
      <div className="px-3 sm:px-4 pt-2 pb-1 bg-surface-page">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <DrawingVariantPicker
            value={project.settings.drawingVariant || 'standard'}
            onChange={onChangeDrawingVariant}
          />

          <span className="text-xs text-ink-muted hidden md:inline">
            Click <b>Edit Info</b> to modify written text &amp; lengths, or <b>Symbols</b> to manage placed items.
          </span>
        </div>
      </div>

      {/* Main CAD Drawing Area */}
      <main className="flex-1 overflow-hidden px-3 sm:px-4 py-1.5 flex items-center justify-center">
        <div className="w-full h-full max-h-[66dvh] rounded-md border border-line bg-surface-card overflow-hidden flex flex-col shadow-sm">
          <CadCanvas
            project={project}
            symbols={symbols}
            isEditMode={isEditMode}
            onToggleEditMode={onToggleEditMode}
            selectedSymbolId={selectedSymbol?.id ?? null}
            onSelectSymbol={onSelectSymbol}
            onUpdatePlacedSymbols={onUpdatePlacedSymbols}
            onOpenAddSymbolPicker={onOpenSymbolPicker}
            onOpenEditInfo={() => setIsInfoModalOpen(true)}
            onOpenSymbolManager={() => setIsSymbolDrawerOpen(true)}
          />
        </div>
      </main>

      {/* Contextual Symbol Editor Strip */}
      {selectedSymbol && (
        <div className="px-3 py-2 border-t border-primary-border bg-primary-subtle">
          <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="selected-symbol-tag"
                className="text-xs font-medium text-ink-secondary"
              >
                Label
              </label>
              <input
                id="selected-symbol-tag"
                type="text"
                value={selectedSymbol.label}
                onChange={(e) => onPatchSelectedSymbol({ label: e.target.value })}
                maxLength={UI_LIMITS.MAX_SYMBOL_LABEL_LENGTH}
                className="w-28 min-h-[40px] px-2.5 py-1 text-sm font-medium bg-surface-card text-ink-primary border border-line rounded-sm focus:border-primary focus:outline-none"
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

      {/* Bottom Action Bar: Clear Single Primary Action + Secondary Actions */}
      <footer className="border-t border-line bg-surface-card px-3 py-2.5">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="grid grid-cols-4 sm:flex items-center gap-1.5">
            <Button variant="secondary" size="sm" onClick={() => setIsInfoModalOpen(true)}>
              <Sliders className="w-4 h-4 text-primary" />
              <span>Edit Info</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsSymbolDrawerOpen(true)}>
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

      {/* Written Info Editor Modal */}
      <DrawingInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        project={project}
        onSave={onUpdateProject}
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
