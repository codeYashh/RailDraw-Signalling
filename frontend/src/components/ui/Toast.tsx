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
    success: 'bg-surface-card/90 border-status-success-border text-ink-primary shadow-emerald-500/10',
    error: 'bg-status-error-bg/95 border-status-error-border text-status-error shadow-red-500/10',
    info: 'bg-surface-card/90 border-line/80 text-ink-primary shadow-slate-900/10',
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
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-2rem)] px-5 py-3 rounded-full border shadow-xl backdrop-blur-xl flex items-center gap-3 animate-fadeIn ${toneClasses}`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} aria-hidden="true" />
      <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug">{toast.message}</span>
      {toast.onRetry && (
        <button
          type="button"
          onClick={toast.onRetry}
          className="min-h-[32px] px-3 rounded-full text-xs font-bold border border-current/30 hover:bg-surface-hover/80 inline-flex items-center gap-1 shrink-0 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="w-8 h-8 -mr-1 inline-flex items-center justify-center rounded-full text-ink-muted hover:text-ink-primary hover:bg-surface-hover/80 shrink-0 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
