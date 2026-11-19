import React from 'react';
import { Check } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  isStepValid: (step: number) => boolean;
}

const STEPS = [
  { num: 1, title: 'Project Info', sub: 'Zone, work & title block' },
  { num: 2, title: 'Locations', sub: 'Start, end & junctions' },
  { num: 3, title: 'Route Segments', sub: 'Lengths & laying methods' },
  { num: 4, title: 'Cable Schedule', sub: 'Cores & callout' },
  { num: 5, title: 'Review & Export', sub: 'PDF, DXF, SVG, PNG' },
] as const;

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onSelectStep,
  isStepValid,
}) => {
  return (
    <nav
      aria-label="Drawing wizard steps"
      className="bg-surface-card border border-line rounded-md px-3 py-2 shadow-sm"
    >
      <ol className="flex items-center gap-1.5 overflow-x-auto">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isDone = isStepValid(step.num) && currentStep > step.num;

          return (
            <React.Fragment key={step.num}>
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectStep(step.num)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`min-h-[44px] flex items-center gap-2.5 px-3 py-1.5 rounded-sm text-left transition-colors duration-fast ${
                    isActive
                      ? 'bg-primary text-primary-ink'
                      : isDone
                      ? 'bg-surface-subtle hover:bg-surface-hover text-ink-primary'
                      : 'hover:bg-surface-subtle text-ink-secondary'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-semibold tabular-nums shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-primary-ink'
                        : isDone
                        ? 'bg-status-success-bg text-status-success border border-status-success-border'
                        : 'bg-surface-hover text-ink-secondary'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </span>
                  <div>
                    <div
                      className={`text-xs font-semibold leading-tight ${
                        isActive ? 'text-primary-ink' : 'text-ink-primary'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div
                      className={`text-xs leading-tight mt-0.5 hidden md:block ${
                        isActive ? 'text-white/80' : 'text-ink-muted'
                      }`}
                    >
                      {step.sub}
                    </div>
                  </div>
                </button>
              </li>

              {idx < STEPS.length - 1 && (
                <li aria-hidden="true" className="hidden sm:block flex-1 h-px bg-line min-w-[12px]" />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
