import React from 'react';
import { X, Plus, Trash2, Copy, RotateCw, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { PlacedSymbol } from '../../types/drawing';
import { INTERACTIVE_SYMBOLS, RenderInteractiveSymbol } from '../Canvas/InteractiveSymbols';
import { Button } from '../ui/Button';
import { CANVAS_CONFIG } from '../../constants/uiConstants';

interface SymbolManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  symbols: PlacedSymbol[];
  selectedSymbolId: string | null;
  onSelectSymbol: (id: string | null) => void;
  onUpdateSymbols: (updated: PlacedSymbol[]) => void;
  onOpenPicker: () => void;
}

export const SymbolManagerDrawer: React.FC<SymbolManagerDrawerProps> = ({
  isOpen,
  onClose,
  symbols,
  selectedSymbolId,
  onSelectSymbol,
  onUpdateSymbols,
  onOpenPicker,
}) => {
  if (!isOpen) return null;

  const handleUpdate = (id: string, patch: Partial<PlacedSymbol>) => {
    onUpdateSymbols(symbols.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleDelete = (id: string) => {
    onUpdateSymbols(symbols.filter((s) => s.id !== id));
    if (selectedSymbolId === id) onSelectSymbol(null);
  };

  const handleDuplicate = (sym: PlacedSymbol) => {
    const copy: PlacedSymbol = {
      ...sym,
      id: `sym_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      label: `${sym.label}_copy`,
      x: Math.min(sym.x + 30, 880),
      y: Math.min(sym.y + 20, 500),
    };
    onUpdateSymbols([...symbols, copy]);
    onSelectSymbol(copy.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md h-full bg-surface-card border-l border-line/60 shadow-2xl flex flex-col text-ink-primary overflow-hidden">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-line/50 flex items-center justify-between bg-surface-subtle/50 backdrop-blur-md">
          <div>
            <h2 className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary" />
              <span>Manage S&amp;T Symbols</span>
            </h2>
            <p className="text-xs text-ink-muted">
              Add, edit labels, reposition or remove symbols from the drawing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-glass-icon-btn min-h-[36px] min-w-[36px]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: Add New Symbol */}
        <div className="px-5 py-3 border-b border-line/40 bg-surface-subtle/30 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-secondary">
            {symbols.length} Symbol{symbols.length === 1 ? '' : 's'} on Drawing
          </span>
          <Button variant="primary" size="sm" onClick={onOpenPicker}>
            <Plus className="w-4 h-4" />
            <span>Add Symbol</span>
          </Button>
        </div>

        {/* Symbols List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {symbols.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-line/70 rounded-3xl bg-surface-subtle/30">
              <p className="text-sm font-semibold text-ink-muted">No symbols placed yet.</p>
              <p className="text-xs text-ink-muted mt-1">
                Click "Add Symbol" above to insert signals, point machines, or route markers.
              </p>
              <Button variant="secondary" size="sm" onClick={onOpenPicker} className="mt-4">
                <Plus className="w-4 h-4" />
                <span>Add First Symbol</span>
              </Button>
            </div>
          ) : (
            symbols.map((sym) => {
              const isSelected = selectedSymbolId === sym.id;
              const def = INTERACTIVE_SYMBOLS.find((d) => d.type === sym.symbolType);

              return (
                <div
                  key={sym.id}
                  onClick={() => onSelectSymbol(sym.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30'
                      : 'border-line/70 bg-surface-card hover:bg-surface-subtle/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-white border border-line/70 flex items-center justify-center shrink-0 shadow-xs">
                        <svg viewBox="-26 -26 52 52" className="w-8 h-8">
                          <g transform={`scale(${Math.min(sym.scale, 1.1)}) rotate(${sym.rotation})`}>
                            <RenderInteractiveSymbol type={sym.symbolType} />
                          </g>
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={sym.label}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdate(sym.id, { label: e.target.value })}
                            className="px-2.5 py-0.5 text-xs font-bold glass-input rounded-full text-ink-primary w-24 focus:border-primary"
                          />
                          <span className="text-[10px] text-ink-muted truncate font-semibold">
                            ({def?.shortName || sym.symbolType})
                          </span>
                        </div>
                        <div className="text-[10px] text-ink-muted mt-0.5 tabular-nums font-medium">
                          X: {sym.x}, Y: {sym.y} · {sym.scale}x
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(sym)}
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-hover/80 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sym.id)}
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center text-status-error hover:bg-status-error-bg/80 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded controls when selected */}
                  {isSelected && (
                    <div
                      className="mt-3 pt-3 border-t border-primary-border/60 grid grid-cols-2 gap-2 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label className="block text-[10px] font-medium text-ink-secondary mb-1">
                          Symbol Type
                        </label>
                        <select
                          value={sym.symbolType}
                          onChange={(e) => handleUpdate(sym.id, { symbolType: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-surface-card border border-line rounded-sm text-ink-primary"
                        >
                          {INTERACTIVE_SYMBOLS.map((d) => (
                            <option key={d.type} value={d.type}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-ink-secondary mb-1">
                          Size &amp; Rotation
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdate(sym.id, {
                                scale: Math.max(CANVAS_CONFIG.SYMBOL_MIN_SCALE, Number((sym.scale - 0.15).toFixed(2))),
                              })
                            }
                            className="p-1 bg-surface-card border border-line rounded-sm hover:bg-surface-hover"
                            title="Decrease size"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdate(sym.id, {
                                scale: Math.min(CANVAS_CONFIG.SYMBOL_MAX_SCALE, Number((sym.scale + 0.15).toFixed(2))),
                              })
                            }
                            className="p-1 bg-surface-card border border-line rounded-sm hover:bg-surface-hover"
                            title="Increase size"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdate(sym.id, {
                                rotation: (sym.rotation + 45) % 360,
                              })
                            }
                            className="p-1 bg-surface-card border border-line rounded-sm hover:bg-surface-hover"
                            title="Rotate 45°"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Nudge Position Controls */}
                      <div className="col-span-2 pt-1 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-ink-secondary">
                          Nudge Position:
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdate(sym.id, { x: Math.max(20, sym.x - 15) })}
                            className="p-1 bg-surface-card border border-line rounded-sm hover:bg-surface-hover"
                            title="Nudge Left"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdate(sym.id, { x: Math.min(940, sym.x + 15) })}
                            className="p-1 bg-surface-card border border-line rounded-sm hover:bg-surface-hover"
                            title="Nudge Right"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdate(sym.id, { y: Math.max(40, sym.y - 12) })}
                            className="p-1 bg-surface-card border border-line rounded-sm hover:bg-surface-hover"
                            title="Nudge Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdate(sym.id, { y: Math.min(540, sym.y + 12) })}
                            className="p-1 bg-surface-card border border-line rounded-sm hover:bg-surface-hover"
                            title="Nudge Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-line bg-surface-subtle flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
