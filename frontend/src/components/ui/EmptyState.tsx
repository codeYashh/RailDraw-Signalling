import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div
    className={`py-10 px-6 flex flex-col items-center justify-center text-center border border-dashed border-line rounded-md bg-surface-subtle/60 ${className}`}
  >
    <div className="w-10 h-10 rounded-md bg-surface-card border border-line flex items-center justify-center text-ink-muted mb-3">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-ink-primary">{title}</h3>
    <p className="text-xs text-ink-muted mt-1 max-w-xs leading-relaxed">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
