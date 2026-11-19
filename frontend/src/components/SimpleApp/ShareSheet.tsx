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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share drawing"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-card text-ink-primary rounded-t-lg sm:rounded-lg border-t sm:border border-line shadow-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-line flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-ink-primary">Share Drawing</h3>
            <p className="text-xs text-ink-muted">
              Choose an export format for WhatsApp, email, or device storage.
            </p>
          </div>
          <Button variant="ghost" iconOnly onClick={onClose} aria-label="Close share sheet">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 divide-y divide-line-subtle border-b border-line-subtle">
          <button
            type="button"
            disabled={isBusy}
            onClick={onShareImage}
            className="w-full min-h-[64px] py-3 px-2 flex items-center gap-3 text-left rounded-sm hover:bg-surface-subtle active:bg-surface-active disabled:opacity-45 transition-colors duration-fast"
          >
            <div className="w-10 h-10 rounded-sm bg-primary-subtle text-primary border border-primary-border flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink-primary">Share High-Res PNG</div>
              <div className="text-xs text-ink-muted">
                2800 × 1800 px raster sheet for messaging and gallery
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={onSharePdf}
            className="w-full min-h-[64px] py-3 px-2 flex items-center gap-3 text-left rounded-sm hover:bg-surface-subtle active:bg-surface-active disabled:opacity-45 transition-colors duration-fast"
          >
            <div className="w-10 h-10 rounded-sm bg-surface-subtle text-ink-primary border border-line flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink-primary">Share A3 Landscape PDF</div>
              <div className="text-xs text-ink-muted">
                Print-ready IRSEM A3 sheet for formal review and email
              </div>
            </div>
          </button>
        </div>

        <div className="px-4 py-3 bg-surface-subtle flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
