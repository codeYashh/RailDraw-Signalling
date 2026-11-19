import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export interface ToastState {
  message: string;
  tone: 'success' | 'error' | 'info';
  onRetry?: () => void;
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const toneClasses = {
    success: 'bg-surface-card border-status-success-border text-ink-primary',
    error: 'bg-status-error-bg border-status-error-border text-status-error',
    info: 'bg-surface-card border-line text-ink-primary',
  }[toast.tone];

  const Icon =
    toast.tone === 'success'
      ? CheckCircle2
      : toast.tone === 'error'
      ? AlertCircle
      : Info;

  const iconColor =
    toast.tone === 'success'
      ? 'text-status-success'
      : toast.tone === 'error'
      ? 'text-status-error'
      : 'text-primary';

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-2rem)] px-4 py-2.5 rounded-md border shadow-md flex items-center gap-3 ${toneClasses}`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} aria-hidden="true" />
      <span className="text-sm font-medium flex-1 leading-snug">{toast.message}</span>
      {toast.onRetry && (
        <button
          type="button"
          onClick={toast.onRetry}
          className="min-h-[36px] px-2.5 rounded-sm text-xs font-semibold border border-current/25 hover:bg-surface-hover inline-flex items-center gap-1 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="min-h-[36px] min-w-[36px] -mr-1 inline-flex items-center justify-center rounded-sm text-ink-muted hover:text-ink-primary hover:bg-surface-hover shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
