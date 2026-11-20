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
    'bg-primary text-primary-ink border border-primary/90 hover:bg-primary-hover active:bg-primary-active shadow-md shadow-primary/20 backdrop-blur-md',
  secondary:
    'bg-surface-card/85 text-ink-primary border border-line/80 hover:bg-surface-hover active:bg-surface-active shadow-sm backdrop-blur-md',
  ghost:
    'bg-transparent text-ink-secondary border border-transparent hover:bg-surface-hover hover:text-ink-primary active:bg-surface-active rounded-xl',
  danger:
    'bg-status-error-bg/90 text-status-error border border-status-error-border hover:bg-status-error hover:text-ink-inverse active:opacity-90 shadow-sm backdrop-blur-md',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[42px] px-3.5 py-1.5 text-xs font-semibold gap-1.5',
  md: 'min-h-[44px] px-4 py-2.5 text-sm font-semibold gap-2',
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
        'inline-flex items-center justify-center rounded-xl select-none whitespace-nowrap',
        'transition-all duration-fast active:scale-[0.98]',
        'disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        iconOnly ? 'min-h-[42px] min-w-[42px] p-2 rounded-xl' : SIZE_CLASSES[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
};
