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
    subtitle: 'Route plan with Detail A & legend',
  },
  {
    id: 'schematic',
    label: 'Option 2 · Route & Table',
    subtitle: 'Route plan with chainage schedule',
  },
  {
    id: 'detailed',
    label: 'Option 3 · Track & Trench',
    subtitle: 'Route plan with offset cross-section',
  },
  {
    id: 'blueprint',
    label: 'Option 4 · Print Sheet',
    subtitle: 'Monochrome CAD route & Detail A',
  },
];

const MiniPreview: React.FC<{ variant: DrawingVariant }> = ({ variant }) => {
  if (variant === 'schematic') {
    return (
      <svg viewBox="0 0 64 40" className="w-12 h-8 rounded-xl border border-line bg-white shrink-0 shadow-xs">
        <rect x="2" y="2" width="60" height="36" fill="none" stroke="#0C2340" strokeWidth="1" />
        <line x1="6" y1="9" x2="58" y2="9" stroke="#64748B" strokeWidth="1" strokeDasharray="3,1.5" />
        <line x1="6" y1="15" x2="58" y2="15" stroke="#0C2340" strokeWidth="1.8" />
        <rect x="15" y="13" width="9" height="4" fill="#CCFBF1" stroke="#0F766E" strokeWidth="0.7" />
        <rect x="34" y="13" width="14" height="4" fill="#EDE9FE" stroke="#6D28D9" strokeWidth="0.7" />
        <rect x="5" y="21" width="34" height="13" fill="#F8FAFC" stroke="#0C2340" strokeWidth="0.7" />
        <line x1="5" y1="25" x2="39" y2="25" stroke="#CBD5E1" strokeWidth="0.7" />
        <line x1="5" y1="29" x2="39" y2="29" stroke="#CBD5E1" strokeWidth="0.7" />
        <rect x="42" y="21" width="17" height="13" fill="#F8FAFC" stroke="#0C2340" strokeWidth="0.7" />
      </svg>
    );
  }

  if (variant === 'detailed') {
    return (
      <svg viewBox="0 0 64 40" className="w-12 h-8 rounded-xl border border-line bg-white shrink-0 shadow-xs">
        <rect x="2" y="2" width="60" height="36" fill="none" stroke="#0C2340" strokeWidth="1" />
        <line x1="6" y1="9" x2="58" y2="9" stroke="#64748B" strokeWidth="1" strokeDasharray="3,1.5" />
        <line x1="6" y1="15" x2="58" y2="15" stroke="#0C2340" strokeWidth="1.8" />
        <rect x="16" y="13" width="10" height="4" fill="#FEE2E2" stroke="#B91C1C" strokeWidth="0.7" />
        <rect x="5" y="21" width="30" height="13" fill="#F8FAFC" stroke="#0C2340" strokeWidth="0.7" />
        <polygon points="8,27 17,27 15,24 10,24" fill="#CBD5E1" />
        <rect x="21" y="26" width="6" height="6" fill="#FEF3C7" stroke="#0C2340" strokeWidth="0.6" />
        <rect x="38" y="21" width="21" height="13" fill="#F8FAFC" stroke="#0C2340" strokeWidth="0.7" />
      </svg>
    );
  }

  if (variant === 'blueprint') {
    return (
      <svg viewBox="0 0 64 40" className="w-12 h-8 rounded-xl border border-line bg-white shrink-0 shadow-xs">
        <rect x="2" y="2" width="60" height="36" fill="none" stroke="#111827" strokeWidth="1.1" />
        <line x1="6" y1="9" x2="58" y2="9" stroke="#111827" strokeWidth="0.8" strokeDasharray="3,1.5" />
        <line x1="6" y1="15" x2="58" y2="15" stroke="#111827" strokeWidth="1.8" />
        <rect x="16" y="13" width="10" height="4" fill="#F3F4F6" stroke="#111827" strokeWidth="0.8" />
        <rect x="5" y="21" width="25" height="13" fill="#FFFFFF" stroke="#111827" strokeWidth="0.8" />
        <rect x="34" y="21" width="25" height="13" fill="#FFFFFF" stroke="#111827" strokeWidth="0.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 40" className="w-12 h-8 rounded-xl border border-line bg-white shrink-0 shadow-xs">
      <rect x="2" y="2" width="60" height="36" fill="none" stroke="#0C2340" strokeWidth="1" />
      <line x1="6" y1="9" x2="58" y2="9" stroke="#64748B" strokeWidth="1" strokeDasharray="3,1.5" />
      <line x1="6" y1="15" x2="58" y2="15" stroke="#0C2340" strokeWidth="1.8" />
      <rect x="14" y="13" width="8" height="4" fill="#CCFBF1" stroke="#0F766E" strokeWidth="0.8" />
      <rect x="22" y="13" width="10" height="4" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="0.8" />
      <rect x="5" y="21" width="25" height="13" fill="#F8FAFC" stroke="#0C2340" strokeWidth="0.8" />
      <rect x="34" y="21" width="25" height="13" fill="#F8FAFC" stroke="#0C2340" strokeWidth="0.8" />
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
      className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 w-full"
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
            className={`min-h-[48px] px-3 py-2 rounded-2xl border text-left flex items-center gap-2.5 transition-all duration-200 ${
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
