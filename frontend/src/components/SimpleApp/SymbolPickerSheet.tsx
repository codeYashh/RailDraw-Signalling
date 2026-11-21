import React, { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import {
  INTERACTIVE_SYMBOLS,
  InteractiveSymbolDef,
  RenderInteractiveSymbol,
} from '../Canvas/InteractiveSymbols';
import { SYMBOL_PICKER_CATEGORIES } from '../../constants/uiConstants';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface SymbolPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSymbol: (def: InteractiveSymbolDef) => void;
}

export const SymbolPickerSheet: React.FC<SymbolPickerSheetProps> = ({
  isOpen,
  onClose,
  onAddSymbol,
}) => {
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const filtered = INTERACTIVE_SYMBOLS.filter((sym) => {
    const matchesCat = category === 'All' || sym.category === category;
    const matchesQuery =
      !trimmed ||
      sym.name.toLowerCase().includes(trimmed) ||
      sym.shortName.toLowerCase().includes(trimmed) ||
      sym.category.toLowerCase().includes(trimmed);
    return matchesCat && matchesQuery;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Add S&T Symbol"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[82dvh] bg-surface-card text-ink-primary rounded-t-3xl sm:rounded-3xl border border-line/60 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-line/50 flex items-center justify-between gap-3 bg-surface-subtle/50 backdrop-blur-md">
          <div>
            <h3 className="text-base font-bold text-ink-primary">Insert S&amp;T Symbol</h3>
            <p className="text-xs text-ink-muted">
              Select a symbol to place on the sheet, then drag to position it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-glass-icon-btn min-h-[36px] min-w-[36px]"
            aria-label="Close symbol picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filters */}
        <div className="px-5 py-3 border-b border-line/40 space-y-2.5 bg-surface-subtle/40 backdrop-blur-md">
          <div className="relative">
            <Search
              className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter symbols by name..."
              className="w-full min-h-[42px] pl-10 pr-4 py-2 text-xs sm:text-sm glass-input text-ink-primary rounded-full placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {SYMBOL_PICKER_CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`min-h-[34px] px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'liquid-glass-primary shadow-xs'
                      : 'bg-surface-card/80 border border-line text-ink-secondary hover:bg-surface-hover'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Symbol List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="w-5 h-5" />}
              title="No matching symbols"
              description="Try another symbol name or reset your category filter."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setCategory('All');
                    setQuery('');
                  }}
                >
                  Reset Filters
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2">
              {filtered.map((def) => (
                <li key={def.type}>
                  <button
                    type="button"
                    onClick={() => onAddSymbol(def)}
                    className="w-full min-h-[56px] px-4 py-2.5 flex items-center gap-3.5 text-left rounded-2xl bg-surface-card hover:bg-surface-subtle/80 border border-line/60 shadow-xs transition-all active:scale-[0.98]"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white border border-line/70 flex items-center justify-center p-1 shrink-0 shadow-xs">
                      <svg viewBox="-28 -28 56 56" className="w-full h-full">
                        <RenderInteractiveSymbol type={def.type} />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-ink-primary truncate">
                        {def.name}
                      </div>
                      <div className="text-xs text-ink-muted">{def.category}</div>
                    </div>
                    <span className="liquid-glass-secondary px-3 py-1 text-xs font-bold text-primary shrink-0">
                      Insert
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
