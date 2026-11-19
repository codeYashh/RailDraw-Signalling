import React from 'react';
import { ArrowRight, Languages } from 'lucide-react';
import { ProjectMetadata } from '../../types/drawing';
import { RAILWAY_ZONES, ZONE_DIVISIONS, S_AND_T_DESIGNATIONS } from '../../constants/railwayData';
import { Button } from '../ui/Button';
import { FormField, inputBaseClass, inputErrorClass } from '../ui/FormField';

interface Step1MetadataProps {
  metadata: ProjectMetadata;
  onChange: (updated: Partial<ProjectMetadata>) => void;
  onNext: () => void;
}

export const Step1Metadata: React.FC<Step1MetadataProps> = ({
  metadata,
  onChange,
  onNext,
}) => {
  const currentDivisions = ZONE_DIVISIONS[metadata.railwayZone] || ['General'];

  const workNameError = !metadata.workName.trim()
    ? 'Name of Work is required for the drawing title block.'
    : undefined;
  const drawingNumberError = !metadata.drawingNumber.trim()
    ? 'Drawing Number is required before final issue.'
    : undefined;
  const stationError = !metadata.stationSection.trim()
    ? 'Enter the station or block section.'
    : undefined;

  const signatureRows = [
    {
      role: 'Prepared By',
      nameKey: 'preparedBy' as const,
      desigKey: 'preparedByDesig' as const,
      nameValue: metadata.preparedBy,
      desigValue: metadata.preparedByDesig,
      placeholder: 'JE / Section Engineer Name',
    },
    {
      role: 'Checked By',
      nameKey: 'checkedBy' as const,
      desigKey: 'checkedByDesig' as const,
      nameValue: metadata.checkedBy,
      desigValue: metadata.checkedByDesig,
      placeholder: 'SSE (Signal) Name',
    },
    {
      role: 'Approved By',
      nameKey: 'approvedBy' as const,
      desigKey: 'approvedByDesig' as const,
      nameValue: metadata.approvedBy,
      desigValue: metadata.approvedByDesig,
      placeholder: 'Sr. DSTE / Dy. CSTE Name',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-line">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            Project &amp; Title Block Details
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Administrative header, drawing control number, and signature block metadata.
          </p>
        </div>

        <label className="min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-line bg-surface-subtle cursor-pointer select-none">
          <input
            type="checkbox"
            checked={metadata.isBilingual}
            onChange={(e) => onChange({ isBilingual: e.target.checked })}
            className="w-4 h-4 accent-primary rounded-sm cursor-pointer"
          />
          <Languages className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
          <span className="text-xs font-medium text-ink-primary">Bilingual Title Block</span>
        </label>
      </div>

      {/* Section 1: Railway Administration */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Railway Administration &amp; Section
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Railway Zone" htmlFor="meta-zone" required>
            <select
              id="meta-zone"
              value={metadata.railwayZone}
              onChange={(e) => {
                const zone = e.target.value;
                const divs = ZONE_DIVISIONS[zone] || ['General'];
                onChange({ railwayZone: zone, division: divs[0] || '' });
              }}
              className={inputBaseClass}
            >
              {RAILWAY_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Division" htmlFor="meta-division" required>
            <select
              id="meta-division"
              value={metadata.division}
              onChange={(e) => onChange({ division: e.target.value })}
              className={inputBaseClass}
            >
              {currentDivisions.map((div) => (
                <option key={div} value={div}>
                  {div} Division
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Station / Section"
            htmlFor="meta-section"
            required
            error={stationError}
            className="sm:col-span-2"
          >
            <input
              id="meta-section"
              type="text"
              value={metadata.stationSection}
              onChange={(e) => onChange({ stationSection: e.target.value })}
              placeholder="e.g. Ghaziabad - Sahibabad Section"
              className={`${inputBaseClass} ${stationError ? inputErrorClass : ''}`}
            />
          </FormField>

          <FormField
            label="Name of Work"
            htmlFor="meta-work-name"
            required
            error={workNameError}
            className="sm:col-span-2"
          >
            <textarea
              id="meta-work-name"
              rows={2}
              value={metadata.workName}
              onChange={(e) => onChange({ workName: e.target.value })}
              placeholder="e.g. PROVISION OF SIGNALLING CABLE ROUTE BETWEEN LOCATION BOX L1 AND L12"
              className={`${inputBaseClass} min-h-[72px] resize-none leading-relaxed ${
                workNameError ? inputErrorClass : ''
              }`}
            />
          </FormField>
        </div>
      </section>

      {/* Section 2: Drawing Control */}
      <section className="space-y-4 pt-5 border-t border-line-subtle">
        <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Drawing Control &amp; Revision
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FormField
            label="Drawing Number"
            htmlFor="meta-drg-no"
            required
            error={drawingNumberError}
            className="col-span-2"
          >
            <input
              id="meta-drg-no"
              type="text"
              value={metadata.drawingNumber}
              onChange={(e) => onChange({ drawingNumber: e.target.value })}
              placeholder="e.g. NR/S&T/SIG/CABLE/2026/042"
              className={`${inputBaseClass} font-mono font-medium ${
                drawingNumberError ? inputErrorClass : ''
              }`}
            />
          </FormField>

          <FormField label="Revision" htmlFor="meta-rev">
            <input
              id="meta-rev"
              type="text"
              value={metadata.revision}
              onChange={(e) => onChange({ revision: e.target.value })}
              placeholder="R0"
              className={`${inputBaseClass} font-mono`}
            />
          </FormField>

          <FormField label="Scale" htmlFor="meta-scale">
            <select
              id="meta-scale"
              value={metadata.scale}
              onChange={(e) => onChange({ scale: e.target.value })}
              className={inputBaseClass}
            >
              <option value="N.T.S.">N.T.S.</option>
              <option value="1:1000">1:1000</option>
              <option value="1:500">1:500</option>
              <option value="1:250">1:250</option>
              <option value="1:100">1:100</option>
            </select>
          </FormField>

          <FormField label="Date" htmlFor="meta-date" className="col-span-2">
            <input
              id="meta-date"
              type="text"
              value={metadata.date}
              onChange={(e) => onChange({ date: e.target.value })}
              placeholder="DD-MM-YYYY"
              className={`${inputBaseClass} tabular-nums`}
            />
          </FormField>

          <FormField label="Sheet No." htmlFor="meta-sheet-no">
            <input
              id="meta-sheet-no"
              type="text"
              value={metadata.sheetNo}
              onChange={(e) => onChange({ sheetNo: e.target.value })}
              className={`${inputBaseClass} tabular-nums text-center`}
            />
          </FormField>

          <FormField label="Total Sheets" htmlFor="meta-total-sheets">
            <input
              id="meta-total-sheets"
              type="text"
              value={metadata.totalSheets}
              onChange={(e) => onChange({ totalSheets: e.target.value })}
              className={`${inputBaseClass} tabular-nums text-center`}
            />
          </FormField>
        </div>
      </section>

      {/* Section 3: Signature Approval Table */}
      <section className="space-y-3 pt-5 border-t border-line-subtle">
        <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Approval Signatures
        </h3>

        <div className="border border-line rounded-md overflow-hidden bg-surface-card">
          <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 bg-surface-subtle border-b border-line text-xs font-medium text-ink-muted">
            <div className="col-span-3">Stage</div>
            <div className="col-span-4">Officer Name</div>
            <div className="col-span-5">Designation</div>
          </div>
          <div className="divide-y divide-line-subtle">
            {signatureRows.map((row) => (
              <div
                key={row.role}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 p-3 items-center"
              >
                <div className="sm:col-span-3 text-xs font-semibold text-ink-secondary">
                  {row.role}
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={row.nameValue}
                    onChange={(e) => onChange({ [row.nameKey]: e.target.value })}
                    placeholder={row.placeholder}
                    aria-label={`${row.role} name`}
                    className={inputBaseClass}
                  />
                </div>
                <div className="sm:col-span-5">
                  <select
                    value={row.desigValue}
                    onChange={(e) => onChange({ [row.desigKey]: e.target.value })}
                    aria-label={`${row.role} designation`}
                    className={inputBaseClass}
                  >
                    {S_AND_T_DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="flex justify-end pt-4 border-t border-line-subtle">
        <Button variant="primary" onClick={onNext}>
          <span>Next: Locations</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
