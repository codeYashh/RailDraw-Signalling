import React, { useEffect } from 'react';
import { X, Plus, Clock, Trash2, Sparkles } from 'lucide-react';
import { SavedDrawingRecord } from '../../services/storageService';
import { VandeBharatLogo } from '../Brand/VandeBharatLogo';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SavedDrawingRecord[];
  activeId: string | null;
  onSelect: (item: SavedDrawingRecord) => void;
  onDelete: (id: string) => void;
  onNewDrawing: () => void;
  onOpenUpdates?: () => void;
  isUpdateAvailable?: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  activeId,
  onSelect,
  onDelete,
  onNewDrawing,
  onOpenUpdates,
  isUpdateAvailable,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-base ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        aria-label="Drawing history"
        aria-hidden={!isOpen}
        className={`fixed top-0 left-0 bottom-0 z-50 w-[86%] max-w-[320px] flex flex-col bg-surface-card text-ink-primary border-r border-line shadow-md transition-transform duration-base ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-line">
          <div className="flex items-center gap-2.5 min-w-0">
            <VandeBharatLogo size={32} className="shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink-primary leading-tight">RailDraw</div>
              <div className="text-xs text-ink-muted">Saved Drawings</div>
            </div>
          </div>

          <Button
            variant="ghost"
            iconOnly
            onClick={onClose}
            aria-label="Close history drawer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Drawing Action */}
        <div className="p-3 border-b border-line-subtle">
          <Button variant="primary" className="w-full" onClick={onNewDrawing}>
            <Plus className="w-4 h-4" />
            <span>New Route Drawing</span>
          </Button>
        </div>

        {/* Section Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Recent Drawings</span>
          </span>
          <span className="text-xs font-medium text-ink-muted tabular-nums">
            {items.length}
          </span>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {items.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<Clock className="w-5 h-5" />}
              title="No saved drawings"
              description="Drawings you generate are stored locally on this device for quick recall."
            />
          ) : (
            <ul className="divide-y divide-line-subtle border border-line rounded-md bg-surface-card overflow-hidden">
              {items.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <li key={item.id}>
                    <div
                      className={`flex items-center gap-3 p-2.5 transition-colors duration-fast ${
                        isActive
                          ? 'bg-primary-subtle'
                          : 'hover:bg-surface-subtle'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className="flex-1 min-w-0 flex items-center gap-3 text-left min-h-[44px]"
                      >
                        <div className="w-16 h-11 rounded-sm border border-line bg-white overflow-hidden flex items-center justify-center shrink-0">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-ink-muted font-mono">CAD</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-ink-primary truncate">
                            {item.title}
                          </div>
                          {item.promptText && (
                            <div className="text-xs text-ink-muted truncate mt-0.5">
                              {item.promptText}
                            </div>
                          )}
                          <div className="text-xs text-ink-muted mt-0.5 tabular-nums">
                            {item.dateStr}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-sm text-ink-muted hover:text-status-error hover:bg-status-error-bg transition-colors duration-fast shrink-0"
                        title="Delete drawing from history"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-line bg-surface-subtle space-y-2">
          {onOpenUpdates && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full relative"
              onClick={() => {
                onClose();
                onOpenUpdates();
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Check for Updates</span>
              {isUpdateAvailable && (
                <span className="w-2 h-2 rounded-full bg-status-success animate-ping absolute top-2 right-2" />
              )}
            </Button>
          )}

          <p className="text-xs text-center text-ink-muted">
            Designed by <span className="font-medium text-ink-primary">Yash</span>
          </p>
        </div>
      </aside>
    </>
  );
};
