import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Download,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { RouteSegment, LayingMethod } from '../../types/drawing';
import { LAYING_METHODS, COVER_TYPES } from '../../constants/railwayData';
import { downloadFile } from '../../services/pdfExport';
import { Button } from '../ui/Button';
import { FormField, inputBaseClass, inputErrorClass } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';

interface Step3RouteSegmentsProps {
  segments: RouteSegment[];
  onChangeSegments: (segments: RouteSegment[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step3RouteSegments: React.FC<Step3RouteSegmentsProps> = ({
  segments,
  onChangeSegments,
  onPrev,
  onNext,
}) => {
  const [notice, setNotice] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);
  const totalLength = segments.reduce((acc, s) => acc + (Number(s.length) || 0), 0);

  const addSegment = () => {
    setNotice(null);
    const nextNum = segments.length + 1;
    const newSeg: RouteSegment = {
      id: `seg-${Date.now()}-${nextNum}`,
      length: 100,
      layingMethod: 'Normal Trenching',
      depth: 1.0,
      coverType: 'Class II Bricks laid flat',
      remarks: 'Standard soil trench',
    };
    onChangeSegments([...segments, newSeg]);
  };

  const removeSegment = (idx: number) => {
    if (segments.length <= 1) {
      setNotice({ tone: 'error', message: 'At least one route segment is required.' });
      return;
    }
    setNotice(null);
    onChangeSegments(segments.filter((_, i) => i !== idx));
  };

  const updateSegment = (idx: number, patch: Partial<RouteSegment>) => {
    setNotice(null);
    const updated = segments.map((seg, i) => {
      if (i !== idx) return seg;
      const next = { ...seg, ...patch };
      if (patch.layingMethod && patch.layingMethod !== seg.layingMethod) {
        const mInfo = LAYING_METHODS.find((m) => m.id === patch.layingMethod);
        if (mInfo) next.depth = mInfo.defaultDepth;
      }
      return next;
    });
    onChangeSegments(updated);
  };

  const moveSegment = (idx: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === segments.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const copy = [...segments];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    onChangeSegments(copy);
  };

  const handleExportCsv = () => {
    const headers = 'Length (m),Laying Method,Depth (m),Cover Type,Remarks\n';
    const rows = segments
      .map((s) => `${s.length},"${s.layingMethod}",${s.depth},"${s.coverType}","${s.remarks || ''}"`)
      .join('\n');
    downloadFile(headers + rows, 'Route_Segments_Schedule.csv', 'text/csv');
    setNotice({ tone: 'success', message: 'Route segment schedule exported as CSV.' });
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const parsed: RouteSegment[] = [];
      lines.slice(1).forEach((line, i) => {
        const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 2) {
          parsed.push({
            id: `seg-imp-${Date.now()}-${i}`,
            length: parseFloat(parts[0]) || 50,
            layingMethod: (parts[1] as LayingMethod) || 'Normal Trenching',
            depth: parseFloat(parts[2]) || 1.0,
            coverType: parts[3] || 'Class II Bricks laid flat',
            remarks: parts[4] || '',
          });
        }
      });
      if (parsed.length > 0) {
        onChangeSegments(parsed);
        setNotice({ tone: 'success', message: `Imported ${parsed.length} segments from CSV.` });
      } else {
        setNotice({
          tone: 'error',
          message: 'No valid route segments found in CSV file.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getGraphicTag = (method: LayingMethod) => {
    if (method === 'Trenchless-HDD') return '45° HDD Hatch';
    if (method.includes('Pipe')) return 'Casing Pipe';
    if (method.includes('crossing')) return 'Crossing Detail';
    return 'Trench Line';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-line">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            Route Segments &amp; Laying Methods
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Define sequential lengths, laying methods, burial depths, and protective covers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-medium bg-surface-card hover:bg-surface-hover text-ink-primary rounded-sm border border-line cursor-pointer transition-colors duration-fast">
            <Upload className="w-4 h-4 text-ink-secondary" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>
          <Button variant="secondary" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 text-ink-secondary" />
            <span>Export CSV</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={addSegment}>
            <Plus className="w-4 h-4" />
            <span>Add Segment</span>
          </Button>
        </div>
      </div>

      {/* Inline Status Notice */}
      {notice && (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`px-3 py-2.5 rounded-sm border text-xs font-medium flex items-center gap-2 ${
            notice.tone === 'error'
              ? 'bg-status-error-bg border-status-error-border text-status-error'
              : 'bg-status-success-bg border-status-success-border text-status-success'
          }`}
        >
          {notice.tone === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Route Length Summary Strip */}
      <div className="px-4 py-3 rounded-md border border-line bg-surface-subtle flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-ink-muted">Total Route Length</div>
          <div className="text-base font-semibold text-ink-primary tabular-nums mt-0.5">
            {totalLength} m
            <span className="text-xs font-normal text-ink-secondary ml-2">
              (
              {segments.map((s, i) => (
                <span key={s.id || i}>
                  {s.length}m {s.layingMethod}
                  {i < segments.length - 1 ? ' + ' : ''}
                </span>
              ))}
              )
            </span>
          </div>
        </div>
        <StatusBadge tone={totalLength > 0 ? 'success' : 'error'}>
          {segments.length} {segments.length === 1 ? 'Segment' : 'Segments'}
        </StatusBadge>
      </div>

      {/* Structured Segment Schedule List */}
      <div className="border border-line rounded-md divide-y divide-line bg-surface-card overflow-hidden">
        {segments.map((seg, idx) => {
          const segNum = idx + 1;
          const lengthInvalid = Number(seg.length) <= 0;
          const normalDepthWarn = seg.layingMethod === 'Normal Trenching' && seg.depth < 1.0;
          const trackDepthViolation =
            (seg.layingMethod === 'Track crossing' || seg.layingMethod === 'Rail crossing') &&
            seg.depth < 1.2;

          return (
            <div key={seg.id || idx} className="p-4 space-y-3">
              {/* Row Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-sm bg-surface-subtle border border-line text-ink-primary text-xs font-semibold tabular-nums flex items-center justify-center shrink-0">
                    {segNum}
                  </span>
                  <span className="text-sm font-semibold text-ink-primary tabular-nums truncate">
                    {seg.length} m · {seg.layingMethod}
                  </span>
                  <StatusBadge tone="neutral">{getGraphicTag(seg.layingMethod)}</StatusBadge>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    iconOnly
                    onClick={() => moveSegment(idx, 'up')}
                    disabled={idx === 0}
                    aria-label={`Move segment ${segNum} up`}
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    iconOnly
                    onClick={() => moveSegment(idx, 'down')}
                    disabled={idx === segments.length - 1}
                    aria-label={`Move segment ${segNum} down`}
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    iconOnly
                    onClick={() => removeSegment(idx)}
                    aria-label={`Delete segment ${segNum}`}
                    title="Delete segment"
                  >
                    <Trash2 className="w-4 h-4 text-ink-muted hover:text-status-error" />
                  </Button>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                <FormField
                  label="Length (m)"
                  required
                  error={lengthInvalid ? 'Must be > 0' : undefined}
                >
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={seg.length}
                    onChange={(e) =>
                      updateSegment(idx, { length: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputBaseClass} tabular-nums font-medium ${
                      lengthInvalid ? inputErrorClass : ''
                    }`}
                  />
                </FormField>

                <FormField label="Laying Method" required className="md:col-span-2">
                  <select
                    value={seg.layingMethod}
                    onChange={(e) =>
                      updateSegment(idx, { layingMethod: e.target.value as LayingMethod })
                    }
                    className={inputBaseClass}
                  >
                    {LAYING_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.pipeType})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Depth (m)" hint="Min 1.0 m">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={seg.depth}
                    onChange={(e) =>
                      updateSegment(idx, { depth: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputBaseClass} tabular-nums ${
                      trackDepthViolation ? inputErrorClass : ''
                    }`}
                  />
                </FormField>

                <FormField label="Protective Cover" className="md:col-span-2">
                  <select
                    value={seg.coverType}
                    onChange={(e) => updateSegment(idx, { coverType: e.target.value })}
                    className={inputBaseClass}
                  >
                    {COVER_TYPES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Terrain / Remarks" className="sm:col-span-2 md:col-span-6">
                  <input
                    type="text"
                    value={seg.remarks ?? ''}
                    onChange={(e) => updateSegment(idx, { remarks: e.target.value })}
                    placeholder="e.g. Crossing under Goods Line via HDD"
                    className={inputBaseClass}
                  />
                </FormField>
              </div>

              {normalDepthWarn && (
                <div className="px-3 py-2 rounded-sm bg-status-warning-bg border border-status-warning-border text-status-warning text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Depth {seg.depth} m is below IRSEM Para 15.5.1 minimum of 1.0 m for normal
                    trenching.
                  </span>
                </div>
              )}

              {trackDepthViolation && (
                <div className="px-3 py-2 rounded-sm bg-status-error-bg border border-status-error-border text-status-error text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Depth {seg.depth} m is below IRSEM Para 15.5.3 mandatory minimum of 1.2 m for
                    track crossings.
                  </span>
                </div>
              )}
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
          <span>Next: Cable Schedule</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
