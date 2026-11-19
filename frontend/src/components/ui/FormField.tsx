import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  className = '',
  children,
}) => (
  <div className={className}>
    <div className="flex items-baseline justify-between gap-2 mb-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-ink-secondary"
      >
        {label}
        {required && (
          <span className="text-status-error ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </div>
    {children}
    {error && (
      <p role="alert" className="mt-1 text-xs text-status-error font-medium">
        {error}
      </p>
    )}
  </div>
);

export const inputBaseClass =
  'w-full min-h-[44px] px-3 py-2 text-sm bg-surface-card text-ink-primary border border-line rounded-sm placeholder:text-ink-muted hover:border-line-strong focus:border-primary focus:outline-none disabled:bg-surface-subtle disabled:text-ink-muted disabled:cursor-not-allowed';

export const inputErrorClass =
  'border-status-error focus:border-status-error';
