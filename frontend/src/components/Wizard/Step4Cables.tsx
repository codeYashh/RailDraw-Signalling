import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { CableDetail, DrawingSettings } from '../../types/drawing';
import { CABLE_TYPES, CONDUCTOR_SIZES, CORE_COUNTS } from '../../constants/railwayData';
import { Button } from '../ui/Button';
import { FormField, inputBaseClass, inputErrorClass } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';

interface Step4CablesProps {
  cables: CableDetail[];
  settings: DrawingSettings;
  onChangeCables: (cables: CableDetail[]) => void;
  onChangeSettings: (settings: Partial<DrawingSettings>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step4Cables: React.FC<Step4CablesProps> = ({
  cables,
  settings,
  onChangeCables,
  onChangeSettings,
  onPrev,
  onNext,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const totalCables = cables.reduce((acc, c) => acc + (Number(c.count) || 0), 0);
  const totalCores = cables.reduce(
    (acc, c) => acc + (Number(c.count) || 0) * (Number(c.coreCount) || 0),
    0
  );

  const addCable = () => {
    setErrorMsg(null);
    const nextIdx = cables.length + 1;
    const newCable: CableDetail = {
      id: `cab-${Date.now()}-${nextIdx}`,
      cableType: 'Signalling',
      count: 1,
      coreCount: 12,
      conductorSize: '1.5 sq mm',
      isArmoured: true,
      cableTag: `SIG-C-${nextIdx}`,
      function: 'Signal & Point Control',
    };
    onChangeCables([...cables, newCable]);
  };

  const removeCable = (idx: number) => {
    if (cables.length <= 1) {
      setErrorMsg('At least one cable entry is required in the schedule.');
      return;
    }
    setErrorMsg(null);
    onChangeCables(cables.filter((_, i) => i !== idx));
  };

  const updateCable = (idx: number, patch: Partial<CableDetail>) => {
    setErrorMsg(null);
    onChangeCables(cables.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const primaryCable = cables[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-line">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            Cable Schedule &amp; Detail &apos;A&apos; Callout
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Define cable runs in the trench. The first entry populates the Detail &apos;A&apos;
            cross-section.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={addCable}>
          <Plus className="w-4 h-4" />
          <span>Add Cable Run</span>
        </Button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="px-3 py-2.5 rounded-sm border border-status-error-border bg-status-error-bg text-status-error text-xs font-medium flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Detail 'A' Summary Strip */}
      <div className="px-4 py-3 rounded-md border border-line bg-surface-subtle flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-ink-muted">Detail &apos;A&apos; Callout</div>
          <div className="text-sm font-semibold text-ink-primary tabular-nums mt-0.5">
            {primaryCable?.count || 7} Nos. × {primaryCable?.coreCount || 12} Core{' '}
            {primaryCable?.cableType || 'Signalling'} ({primaryCable?.conductorSize || '1.5 sq mm'})
          </div>
          <div className="text-xs text-ink-muted mt-0.5 tabular-nums">
            Total Capacity: {totalCables} cables · {totalCores} cores
          </div>
        </div>

        <label className="min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-surface-card border border-line cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.showCallout}
            onChange={(e) => onChangeSettings({ showCallout: e.target.checked })}
            className="w-4 h-4 accent-primary rounded-sm cursor-pointer"
          />
          <span className="text-xs font-medium text-ink-primary">Show Detail Callout</span>
        </label>
      </div>

      {/* Cable Schedule Rows */}
      <div className="border border-line rounded-md divide-y divide-line bg-surface-card overflow-hidden">
        {cables.map((cab, idx) => {
          const invalidCount = Number(cab.count) < 1;
          return (
            <div key={cab.id || idx} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-sm bg-surface-subtle border border-line text-ink-primary text-xs font-semibold tabular-nums flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-ink-primary tabular-nums">
                    {cab.count} × {cab.coreCount}C {cab.cableType} ({cab.conductorSize})
                  </span>
                  {cab.isArmoured && <StatusBadge tone="neutral">Armoured IS:1554</StatusBadge>}
                </div>

                <Button
                  variant="ghost"
                  iconOnly
                  onClick={() => removeCable(idx)}
                  aria-label={`Remove cable run ${idx + 1}`}
                  title="Remove cable run"
                >
                  <Trash2 className="w-4 h-4 text-ink-muted hover:text-status-error" />
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <FormField label="Cable Type">
                  <select
                    value={cab.cableType}
                    onChange={(e) =>
                      updateCable(idx, { cableType: e.target.value as CableDetail['cableType'] })
                    }
                    className={inputBaseClass}
                  >
                    {CABLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Count (Nos.)"
                  error={invalidCount ? 'Min 1' : undefined}
                >
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={cab.count}
                    onChange={(e) =>
                      updateCable(idx, { count: parseInt(e.target.value, 10) || 1 })
                    }
                    className={`${inputBaseClass} tabular-nums font-medium ${
                      invalidCount ? inputErrorClass : ''
                    }`}
                  />
                </FormField>

                <FormField label="Cores">
                  <select
                    value={cab.coreCount}
                    onChange={(e) =>
                      updateCable(idx, { coreCount: parseInt(e.target.value, 10) || 12 })
                    }
                    className={`${inputBaseClass} tabular-nums`}
                  >
                    {CORE_COUNTS.map((c) => (
                      <option key={c} value={c}>
                        {c} Core
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Conductor">
                  <select
                    value={cab.conductorSize}
                    onChange={(e) => updateCable(idx, { conductorSize: e.target.value })}
                    className={inputBaseClass}
                  >
                    {CONDUCTOR_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Cable Tag">
                  <input
                    type="text"
                    value={cab.cableTag}
                    onChange={(e) => updateCable(idx, { cableTag: e.target.value })}
                    placeholder="SIG-01"
                    className={`${inputBaseClass} font-mono`}
                  />
                </FormField>

                <div className="flex items-end">
                  <label className="min-h-[44px] w-full px-3 inline-flex items-center gap-2 rounded-sm border border-line bg-surface-subtle cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cab.isArmoured}
                      onChange={(e) => updateCable(idx, { isArmoured: e.target.checked })}
                      className="w-4 h-4 accent-primary rounded-sm cursor-pointer"
                    />
                    <span className="text-xs font-medium text-ink-primary">Armoured</span>
                  </label>
                </div>

                <FormField label="Circuit Application" className="col-span-2 sm:col-span-3 md:col-span-6">
                  <input
                    type="text"
                    value={cab.function}
                    onChange={(e) => updateCable(idx, { function: e.target.value })}
                    placeholder="e.g. Signal aspects, point machine operation & track circuit repeaters"
                    className={inputBaseClass}
                  />
                </FormField>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-line-subtle">
        <Button variant="secondary" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        <Button variant="primary" onClick={onNext}>
          <span>Next: Review &amp; Export</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
