import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'liquid-glass-primary font-bold shadow-lg shadow-primary/25 active:scale-[0.97]',
  secondary:
    'liquid-glass-secondary font-semibold active:scale-[0.97]',
  glass:
    'glass-button font-semibold text-ink-primary active:scale-[0.97]',
  accent:
    'liquid-glass-accent font-bold active:scale-[0.97]',
  ghost:
    'bg-transparent text-ink-secondary border border-transparent hover:bg-surface-hover/80 hover:text-ink-primary active:bg-surface-active rounded-full transition-all',
  danger:
    'liquid-glass-danger font-bold active:scale-[0.97]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[38px] px-3.5 py-1.5 text-xs rounded-full gap-1.5',
  md: 'min-h-[44px] px-5 py-2 text-sm rounded-full gap-2',
  lg: 'min-h-[50px] px-6 py-2.5 text-base rounded-full gap-2.5',
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
        'inline-flex items-center justify-center select-none whitespace-nowrap',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        iconOnly
          ? 'min-h-[42px] min-w-[42px] p-2.5 rounded-full'
          : SIZE_CLASSES[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
};
