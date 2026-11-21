import React from 'react';
import { Check } from 'lucide-react';
import { DrawingVariant } from '../../types/drawing';

interface DrawingVariantPickerProps {
  value: DrawingVariant;
  onChange: (variant: DrawingVariant) => void;
  compact?: boolean;
}

const DRAWING_OPTIONS: {
  id: DrawingVariant;
  label: string;
  subtitle: string;
}[] = [
  {
    id: 'standard',
    label: 'Option 1 · Standard Plan',
    subtitle: 'Full IRSEM sheet with Detail A & legend',
  },
  {
    id: 'schematic',
    label: 'Option 2 · Field Schematic',
    subtitle: 'Cumulative chainages & route table',
  },
  {
    id: 'blueprint',
    label: 'Option 3 · Print Blueprint',
    subtitle: 'Monochrome CAD sheet with filing margin',
  },
];

const MiniPreview: React.FC<{ variant: DrawingVariant }> = ({ variant }) => {
  if (variant === 'schematic') {
    return (
      <svg viewBox="0 0 64 40" className="w-12 h-8 rounded-xl border border-line bg-white shrink-0 shadow-xs">
        <rect x="2" y="2" width="60" height="36" fill="none" stroke="#0F2942" strokeWidth="1" />
        <line x1="6" y1="13" x2="58" y2="13" stroke="#0F2942" strokeWidth="2" />
        <circle cx="8" cy="13" r="2.2" fill="#0F2942" />
        <circle cx="24" cy="13" r="1.8" fill="#B91C1C" />
        <circle cx="40" cy="13" r="1.8" fill="#1D4ED8" />
        <circle cx="56" cy="13" r="2.2" fill="#0F2942" />
        <rect x="6" y="22" width="52" height="12" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="0.8" />
        <line x1="6" y1="26" x2="58" y2="26" stroke="#CBD5E1" strokeWidth="0.8" />
        <line x1="6" y1="30" x2="58" y2="30" stroke="#CBD5E1" strokeWidth="0.8" />
      </svg>
    );
  }

  if (variant === 'blueprint') {
    return (
      <svg viewBox="0 0 64 40" className="w-12 h-8 rounded-xl border border-line bg-white shrink-0 shadow-xs">
        <rect x="6" y="2" width="56" height="36" fill="none" stroke="#111827" strokeWidth="1.2" />
        <line x1="3" y1="2" x2="3" y2="38" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2,1" />
        <line x1="10" y1="15" x2="43" y2="15" stroke="#111827" strokeWidth="1.8" />
        <rect x="10" y="12" width="9" height="6" fill="none" stroke="#111827" strokeWidth="1" />
        <rect x="46" y="4" width="14" height="32" fill="#F8FAFC" stroke="#111827" strokeWidth="1" />
        <line x1="46" y1="14" x2="60" y2="14" stroke="#111827" strokeWidth="0.8" />
        <line x1="46" y1="24" x2="60" y2="24" stroke="#111827" strokeWidth="0.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 40" className="w-12 h-8 rounded-xl border border-line bg-white shrink-0 shadow-xs">
      <rect x="2" y="2" width="60" height="36" fill="none" stroke="#0F2942" strokeWidth="1" />
      <line x1="6" y1="12" x2="58" y2="12" stroke="#0F2942" strokeWidth="1.8" />
      <rect x="14" y="10" width="8" height="4" fill="#FEE2E2" stroke="#B91C1C" strokeWidth="0.8" />
      <rect x="22" y="10" width="10" height="4" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="0.8" />
      <rect x="5" y="19" width="25" height="14" fill="#F8FAFC" stroke="#0F2942" strokeWidth="0.8" />
      <rect x="34" y="19" width="25" height="14" fill="#F8FAFC" stroke="#0F2942" strokeWidth="0.8" />
    </svg>
  );
};

export const DrawingVariantPicker: React.FC<DrawingVariantPickerProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Drawing image options"
      className="grid grid-cols-1 sm:grid-cols-3 gap-2"
    >
      {DRAWING_OPTIONS.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.id)}
            className={`min-h-[48px] px-3.5 py-2 rounded-2xl border text-left flex items-center gap-2.5 transition-all duration-200 ${
              isSelected
                ? 'liquid-glass-secondary border-primary/50 shadow-sm ring-1 ring-primary/30'
                : 'bg-surface-card/80 backdrop-blur-md border-line/70 text-ink-secondary hover:bg-surface-hover/80 hover:text-ink-primary'
            }`}
          >
            <MiniPreview variant={opt.id} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-ink-primary flex items-center gap-1.5 truncate">
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </div>
              {!compact && (
                <div className="text-[11px] text-ink-muted truncate mt-0.5">{opt.subtitle}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
