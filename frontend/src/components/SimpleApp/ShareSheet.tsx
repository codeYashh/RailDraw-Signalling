import React, { useEffect } from 'react';
import { X, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onShareImage: () => void;
  onSharePdf: () => void;
  isBusy: boolean;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({
  isOpen,
  onClose,
  onShareImage,
  onSharePdf,
  isBusy,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Share drawing"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-card text-ink-primary rounded-t-3xl sm:rounded-3xl border border-line/60 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-line/50 flex items-center justify-between gap-3 bg-surface-subtle/50 backdrop-blur-md">
          <div>
            <h3 className="text-base font-bold text-ink-primary">Share Drawing</h3>
            <p className="text-xs text-ink-muted">
              Choose an export format for WhatsApp, email, or device storage.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-glass-icon-btn min-h-[36px] min-w-[36px]"
            aria-label="Close share sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5">
          <button
            type="button"
            disabled={isBusy}
            onClick={onShareImage}
            className="w-full min-h-[64px] p-3 flex items-center gap-3.5 text-left rounded-2xl bg-surface-subtle/60 hover:bg-surface-subtle border border-line/60 disabled:opacity-45 transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/25 flex items-center justify-center shrink-0 shadow-xs">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-ink-primary">Share High-Res PNG</div>
              <div className="text-xs text-ink-muted">
                2800 &times; 1800 px raster sheet for messaging and gallery
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={onSharePdf}
            className="w-full min-h-[64px] p-3 flex items-center gap-3.5 text-left rounded-2xl bg-surface-subtle/60 hover:bg-surface-subtle border border-line/60 disabled:opacity-45 transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-ink-primary">Share A3 Landscape PDF</div>
              <div className="text-xs text-ink-muted">
                Print-ready IRSEM A3 sheet for formal review and email
              </div>
            </div>
          </button>
        </div>

        <div className="px-5 py-3.5 bg-surface-subtle/40 backdrop-blur-md flex justify-end border-t border-line/40">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
