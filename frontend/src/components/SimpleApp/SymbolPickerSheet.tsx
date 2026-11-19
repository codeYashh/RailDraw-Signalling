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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add S&T Symbol"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[80dvh] bg-surface-card text-ink-primary rounded-t-lg sm:rounded-lg border-t sm:border border-line shadow-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-line flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-ink-primary">Insert S&amp;T Symbol</h3>
            <p className="text-xs text-ink-muted">
              Select a symbol to place on the sheet, then drag to position it.
            </p>
          </div>
          <Button variant="ghost" iconOnly onClick={onClose} aria-label="Close symbol picker">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search & Category Filters */}
        <div className="px-4 py-3 border-b border-line-subtle space-y-2.5 bg-surface-subtle">
          <div className="relative">
            <Search
              className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter symbols by name..."
              className="w-full min-h-[44px] pl-9 pr-3 py-2 text-sm bg-surface-card text-ink-primary border border-line rounded-sm placeholder:text-ink-muted focus:border-primary focus:outline-none"
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
                  className={`min-h-[36px] px-3 py-1 rounded-sm text-xs font-medium whitespace-nowrap border transition-colors duration-fast ${
                    active
                      ? 'bg-primary text-primary-ink border-primary'
                      : 'bg-surface-card text-ink-secondary border-line hover:bg-surface-hover'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Symbol List */}
        <div className="flex-1 overflow-y-auto p-3">
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
            <ul className="divide-y divide-line-subtle border border-line rounded-md bg-surface-card overflow-hidden">
              {filtered.map((def) => (
                <li key={def.type}>
                  <button
                    type="button"
                    onClick={() => onAddSymbol(def)}
                    className="w-full min-h-[56px] px-3 py-2 flex items-center gap-3 text-left hover:bg-surface-subtle active:bg-surface-active transition-colors duration-fast"
                  >
                    <div className="w-11 h-11 rounded-sm bg-white border border-line flex items-center justify-center p-1 shrink-0">
                      <svg viewBox="-28 -28 56 56" className="w-full h-full">
                        <RenderInteractiveSymbol type={def.type} />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink-primary truncate">
                        {def.name}
                      </div>
                      <div className="text-xs text-ink-muted">{def.category}</div>
                    </div>
                    <span className="text-xs font-medium text-primary shrink-0">Insert</span>
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
