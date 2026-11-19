import React, { useState } from 'react';
import {
  FileDown,
  FileCode,
  Download,
  Image as ImageIcon,
  Save,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { DrawingProject, PaperSize, ValidationResult } from '../../types/drawing';
import { exportSvgToPdf, downloadFile, serializeCleanSvg } from '../../services/pdfExport';
import {
  renderSvgToDataUrl,
  triggerBlobDownload,
  triggerDataUrlDownload,
  sanitizeFilenameSegment,
} from '../../services/canvasExport';
import { CANVAS_CONFIG, PAPER_SIZES } from '../../constants/uiConstants';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface Step5PreviewExportProps {
  project: DrawingProject;
  validation: ValidationResult;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onChangePaperSize: (size: PaperSize) => void;
  onPrev: () => void;
  onSaveProject: () => Promise<unknown> | void;
  onLoadProjectJson: (project: DrawingProject) => void;
}

export const Step5PreviewExport: React.FC<Step5PreviewExportProps> = ({
  project,
  validation,
  svgRef,
  onChangePaperSize,
  onPrev,
  onSaveProject,
  onLoadProjectJson,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDxf, setIsExportingDxf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error';
    message: string;
    onRetry?: () => void;
  } | null>(null);

  const drgPrefix = sanitizeFilenameSegment(project.metadata.drawingNumber || 'RailDraw');
  const rev = project.metadata.revision || 'R0';

  const handleExportPdf = async () => {
    if (!svgRef.current) {
      setFeedback({
        tone: 'error',
        message: 'Drawing canvas is not ready for PDF export.',
        onRetry: handleExportPdf,
      });
      return;
    }
    setIsExportingPdf(true);
    setFeedback(null);
    try {
      const filename = `${drgPrefix}_${rev}_Cable_Route_Plan.pdf`;
      await exportSvgToPdf(svgRef.current, project.settings.paperSize, filename);
      setFeedback({
        tone: 'success',
        message: `Exported ${project.settings.paperSize} PDF (${filename}).`,
      });
    } catch {
      setFeedback({
        tone: 'error',
        message: 'Failed to generate vector PDF.',
        onRetry: handleExportPdf,
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDxf = async () => {
    setIsExportingDxf(true);
    setFeedback(null);
    try {
      const blob = await api.exportDxf(project);
      const filename = `${drgPrefix}_${rev}.dxf`;
      triggerBlobDownload(blob, filename);
      setFeedback({ tone: 'success', message: `Exported AutoCAD DXF (${filename}).` });
    } catch {
      setFeedback({
        tone: 'error',
        message: 'Failed to export AutoCAD DXF file.',
        onRetry: handleExportDxf,
      });
    } finally {
      setIsExportingDxf(false);
    }
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgString = serializeCleanSvg(svgRef.current);
    const filename = `${drgPrefix}_${rev}.svg`;
    downloadFile(svgString, filename, 'image/svg+xml');
    setFeedback({ tone: 'success', message: `Exported Vector SVG (${filename}).` });
  };

  const handleExportPng = async () => {
    if (!svgRef.current) return;
    setIsExportingPng(true);
    setFeedback(null);
    try {
      const dataUrl = await renderSvgToDataUrl(
        svgRef.current,
        CANVAS_CONFIG.DESKTOP_PNG_WIDTH,
        CANVAS_CONFIG.DESKTOP_PNG_HEIGHT,
        'image/png',
        1.0
      );
      const filename = `${drgPrefix}_${rev}.png`;
      triggerDataUrlDownload(dataUrl, filename);
      setFeedback({ tone: 'success', message: `Exported 300 DPI PNG (${filename}).` });
    } catch {
      setFeedback({
        tone: 'error',
        message: 'Failed to export PNG image.',
        onRetry: handleExportPng,
      });
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleSaveProjectClick = async () => {
    setIsSavingProject(true);
    setFeedback(null);
    try {
      await onSaveProject();
      setFeedback({ tone: 'success', message: 'Drawing project saved locally.' });
    } catch {
      setFeedback({
        tone: 'error',
        message: 'Could not save drawing project.',
        onRetry: handleSaveProjectClick,
      });
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDownloadProjectJson = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const filename = `${sanitizeFilenameSegment(project.name)}.raildraw.json`;
    downloadFile(jsonStr, filename, 'application/json');
    setFeedback({ tone: 'success', message: `Downloaded project backup (${filename}).` });
  };

  const handleImportProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const loaded = JSON.parse(evt.target?.result as string);
        if (loaded && loaded.metadata && loaded.segments) {
          onLoadProjectJson(loaded);
          setFeedback({ tone: 'success', message: `Loaded project "${loaded.name || file.name}".` });
        } else {
          setFeedback({
            tone: 'error',
            message: 'Invalid project file format. Expected a RailDraw JSON export.',
          });
        }
      } catch {
        setFeedback({ tone: 'error', message: 'Failed to parse JSON project file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const checklistRows = [
    { label: 'Total Route Length', value: `${validation.totalLength} m` },
    { label: 'Route Segments', value: `${project.segments.length} configured` },
    { label: 'Dimensioning Standard', value: '3:1 arrowheads & centered dimensions' },
    { label: 'Title Block & Frame', value: 'Indian Railways standard frame & signatures' },
    { label: "Detail 'A' Callout", value: project.settings.showCallout ? 'Enabled' : 'Hidden' },
    {
      label: 'Title Block Language',
      value: project.metadata.isBilingual ? 'Bilingual (Hindi / English)' : 'English',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-line">
        <h2 className="text-base font-semibold text-ink-primary">
          Review &amp; Export Drawing
        </h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Verify IRSEM compliance and export for AutoCAD, printing, or project archival.
        </p>
      </div>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div
          role={feedback.tone === 'error' ? 'alert' : 'status'}
          className={`px-3.5 py-2.5 rounded-sm border text-xs font-medium flex items-center justify-between gap-3 ${
            feedback.tone === 'error'
              ? 'bg-status-error-bg border-status-error-border text-status-error'
              : 'bg-status-success-bg border-status-success-border text-status-success'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tone === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          {feedback.onRetry && (
            <button
              type="button"
              onClick={feedback.onRetry}
              className="min-h-[36px] px-2.5 rounded-sm border border-current/25 inline-flex items-center gap-1 font-semibold hover:bg-surface-card"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Primary Export Card */}
      <section className="p-4 rounded-md border border-line bg-surface-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink-primary">Print Sheet Export</h3>
            <p className="text-xs text-ink-muted font-mono mt-0.5">
              {project.metadata.drawingNumber} · Rev {rev}
            </p>
          </div>

          <div
            className="inline-flex items-center p-0.5 rounded-sm bg-surface-subtle border border-line"
            role="group"
            aria-label="Paper sheet size"
          >
            {PAPER_SIZES.map(({ size, recommended }) => {
              const active = project.settings.paperSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChangePaperSize(size)}
                  title={recommended ? 'IRSEM recommended print sheet size' : `${size} landscape`}
                  className={`min-h-[36px] px-2.5 rounded-sm text-xs font-medium transition-colors duration-fast ${
                    active
                      ? 'bg-primary text-primary-ink'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Single Clear Primary Export Action */}
        <Button
          variant="primary"
          loading={isExportingPdf}
          onClick={handleExportPdf}
          className="w-full"
        >
          <FileDown className="w-4 h-4" />
          <span>
            {isExportingPdf
              ? 'Generating PDF...'
              : `Export ${project.settings.paperSize} Printable PDF`}
          </span>
        </Button>

        {/* Secondary CAD & Raster Formats List */}
        <div className="divide-y divide-line-subtle border border-line rounded-sm overflow-hidden">
          <div className="px-3 py-2.5 flex items-center justify-between gap-3 bg-surface-card">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileCode className="w-4 h-4 text-ink-secondary shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink-primary">AutoCAD DXF</div>
                <div className="text-xs text-ink-muted truncate">
                  Layered R12 / R2010 CAD drawing
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              loading={isExportingDxf}
              onClick={handleExportDxf}
            >
              <span>Download DXF</span>
            </Button>
          </div>

          <div className="px-3 py-2.5 flex items-center justify-between gap-3 bg-surface-card">
            <div className="flex items-center gap-2.5 min-w-0">
              <Download className="w-4 h-4 text-ink-secondary shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink-primary">Vector SVG Master</div>
                <div className="text-xs text-ink-muted truncate">
                  Scalable source vector file
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportSvg}>
              <span>Download SVG</span>
            </Button>
          </div>

          <div className="px-3 py-2.5 flex items-center justify-between gap-3 bg-surface-card">
            <div className="flex items-center gap-2.5 min-w-0">
              <ImageIcon className="w-4 h-4 text-ink-secondary shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink-primary">High-Res PNG</div>
                <div className="text-xs text-ink-muted truncate">
                  2400 × 1696 px (300 DPI equivalent)
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              loading={isExportingPng}
              onClick={handleExportPng}
            >
              <span>Download PNG</span>
            </Button>
          </div>
        </div>

        {/* Project Archive Controls */}
        <div className="pt-3 border-t border-line-subtle flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={isSavingProject}
            onClick={handleSaveProjectClick}
          >
            <Save className="w-4 h-4" />
            <span>Save Project</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadProjectJson}>
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </Button>
          <label className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-medium bg-surface-card hover:bg-surface-hover text-ink-primary rounded-sm border border-line cursor-pointer transition-colors duration-fast">
            <Upload className="w-4 h-4 text-ink-secondary" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportProjectJson}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {/* IRSEM Verification Table */}
      <section className="rounded-md border border-line bg-surface-card overflow-hidden">
        <div className="px-4 py-3 border-b border-line bg-surface-subtle flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
            IRSEM Standards Check
          </h3>
          <StatusBadge tone={validation.warnings.length === 0 ? 'success' : 'warning'}>
            {validation.warnings.length === 0
              ? 'Compliant'
              : `${validation.warnings.length} Advisory`}
          </StatusBadge>
        </div>

        <dl className="divide-y divide-line-subtle text-xs">
          {checklistRows.map((row) => (
            <div key={row.label} className="px-4 py-2.5 flex items-center justify-between gap-4">
              <dt className="text-ink-muted">{row.label}</dt>
              <dd className="font-medium text-ink-primary text-right tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>

        {validation.warnings.length > 0 && (
          <div className="p-3.5 border-t border-status-warning-border bg-status-warning-bg space-y-1.5">
            <div className="text-xs font-semibold text-status-warning flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>IRSEM Advisories</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-status-warning">
              {validation.warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-line-subtle">
        <Button variant="secondary" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        <span className="text-xs text-ink-muted">Ready for drafting review</span>
      </div>
    </div>
  );
};
