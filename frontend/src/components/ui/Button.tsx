import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-ink border border-primary hover:bg-primary-hover active:bg-primary-active shadow-sm',
  secondary:
    'bg-surface-card text-ink-primary border border-line hover:bg-surface-hover active:bg-surface-active shadow-sm',
  ghost:
    'bg-transparent text-ink-secondary border border-transparent hover:bg-surface-hover hover:text-ink-primary active:bg-surface-active',
  danger:
    'bg-status-error-bg text-status-error border border-status-error-border hover:bg-status-error hover:text-ink-inverse active:opacity-90',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] px-3 py-2 text-xs font-medium gap-1.5',
  md: 'min-h-[44px] px-4 py-2.5 text-sm font-medium gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  iconOnly = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-sm select-none whitespace-nowrap',
        'transition-colors duration-fast',
        'disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        iconOnly ? 'min-h-[44px] min-w-[44px] p-2' : SIZE_CLASSES[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
};
