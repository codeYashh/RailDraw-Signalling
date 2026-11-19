import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Undo2,
  Redo2,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  MessageSquareText,
  SlidersHorizontal,
  Smartphone,
  Image as ImageIcon,
  FileDown,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import { DrawingProject, DrawingVariant, UserRole, SymbolItem, PaperSize } from './types/drawing';
import { SAMPLE_PROJECT_REFERENCE } from './constants/railwayData';
import { CANVAS_CONFIG, UI_LIMITS } from './constants/uiConstants';
import { Header } from './components/Header';
import { PromptBar } from './components/PromptBar/PromptBar';
import { StepNavigation } from './components/Wizard/StepNavigation';
import { Step1Metadata } from './components/Wizard/Step1Metadata';
import { Step2Nodes } from './components/Wizard/Step2Nodes';
import { Step3RouteSegments } from './components/Wizard/Step3RouteSegments';
import { Step4Cables } from './components/Wizard/Step4Cables';
import { Step5PreviewExport } from './components/Wizard/Step5PreviewExport';
import { CadCanvas } from './components/Canvas/CadCanvas';
import { SymbolManagerModal } from './components/SymbolManager/SymbolManagerModal';
import { RulePackModal } from './components/RulePackManager/RulePackModal';
import { SavedGalleryModal } from './components/SavedGallery/SavedGalleryModal';
import { SimpleAppView } from './components/SimpleApp/SimpleAppView';
import { Button } from './components/ui/Button';
import { StatusBadge } from './components/ui/StatusBadge';
import { Toast, ToastState } from './components/ui/Toast';
import { DrawingVariantPicker } from './components/ui/DrawingVariantPicker';
import {
  getSavedDrawings,
  saveDrawingRecord,
  SavedDrawingRecord,
} from './services/storageService';
import { validateDrawingProject } from './services/validation';
import { exportSvgToPdf } from './services/pdfExport';
import {
  renderSvgToDataUrl,
  triggerBlobDownload,
  triggerDataUrlDownload,
  sanitizeFilenameSegment,
} from './services/canvasExport';
import { api } from './services/api';

export function App() {
  const [project, setProject] = useState<DrawingProject>(SAMPLE_PROJECT_REFERENCE);
  const [appMode, setAppMode] = useState<'simple' | 'prompt' | 'detailed'>('simple');
  const [currentStep, setCurrentStep] = useState<number>(3);
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [symbols, setSymbols] = useState<Record<string, SymbolItem>>({});
  const [isLoadingSymbols, setIsLoadingSymbols] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);
  const [isSymbolManagerOpen, setIsSymbolManagerOpen] = useState<boolean>(false);
  const [isRulePackOpen, setIsRulePackOpen] = useState<boolean>(false);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [savedRecords, setSavedRecords] = useState<SavedDrawingRecord[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [history, setHistory] = useState<DrawingProject[]>([SAMPLE_PROJECT_REFERENCE]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const canvasRef = useRef<SVGSVGElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((nextToast: ToastState) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(nextToast);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, UI_LIMITS.TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const fetchManifestAndHealth = useCallback(async () => {
    try {
      const [isOnline, manifest] = await Promise.all([
        api.checkServerHealth(),
        api.getSymbolManifest(),
      ]);
      setIsBackendOnline(isOnline);

      const symMap: Record<string, SymbolItem> = {};
      manifest.symbols.forEach((s) => {
        symMap[s.id] = s;
      });
      setSymbols(symMap);
      setSavedRecords(getSavedDrawings());
      setLoadError(null);
    } catch {
      setLoadError('Could not load S&T symbol manifest.');
    } finally {
      setIsLoadingSymbols(false);
    }
  }, []);

  const retryLoadInitialData = useCallback(() => {
    setIsLoadingSymbols(true);
    setLoadError(null);
    fetchManifestAndHealth();
  }, [fetchManifestAndHealth]);

  useEffect(() => {
    fetchManifestAndHealth();
  }, [fetchManifestAndHealth]);

  const handleRetryHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const online = await api.checkServerHealth();
      setIsBackendOnline(online);
      showToast({
        tone: online ? 'success' : 'info',
        message: online
          ? 'Connected to local Python DXF server.'
          : 'Local DXF server unavailable. Using offline browser CAD mode.',
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const updateProject = (newProject: DrawingProject, recordHistory = true) => {
    setProject(newProject);
    if (recordHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newProject);
      if (nextHistory.length > UI_LIMITS.MAX_UNDO_HISTORY) nextHistory.shift();
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setProject(history[targetIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setProject(history[targetIndex]);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const validation = validateDrawingProject(project);

  const isStepValid = (stepNum: number) => {
    if (stepNum === 1) return project.metadata.workName.trim().length > 0;
    if (stepNum === 2)
      return project.startNode.id.trim().length > 0 && project.endNode.id.trim().length > 0;
    if (stepNum === 3) return project.segments.length > 0;
    if (stepNum === 4) return project.cables.length > 0;
    return true;
  };

  const unverifiedSymbolsCount = Object.values(symbols).filter(
    (s) => s.verificationStatus === 'NEEDS VERIFICATION'
  ).length;

  const totalLength = project.segments.reduce((acc, s) => acc + (Number(s.length) || 0), 0);
  const sanitizedDrg = sanitizeFilenameSegment(project.metadata.drawingNumber || 'RailDraw');

  const handleDownloadPhoto = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await renderSvgToDataUrl(
        canvasRef.current,
        CANVAS_CONFIG.DESKTOP_PNG_WIDTH,
        CANVAS_CONFIG.DESKTOP_PNG_HEIGHT,
        'image/png',
        0.95
      );
      const filename = `RailDraw_${sanitizedDrg}_${project.startNode.id}_${project.endNode.id}.png`;
      triggerDataUrlDownload(dataUrl, filename);
      showToast({ tone: 'success', message: `Downloaded PNG (${filename}).` });
    } catch {
      showToast({
        tone: 'error',
        message: 'Could not render PNG drawing.',
        onRetry: handleDownloadPhoto,
      });
    }
  };

  const handleSaveToGallery = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await renderSvgToDataUrl(
        canvasRef.current,
        CANVAS_CONFIG.THUMBNAIL_WIDTH,
        CANVAS_CONFIG.THUMBNAIL_HEIGHT,
        'image/jpeg',
        0.85
      );
      const saved = saveDrawingRecord(project, dataUrl);
      setSavedRecords(getSavedDrawings());
      showToast({ tone: 'success', message: `Saved "${saved.title}" to device storage.` });
    } catch {
      showToast({
        tone: 'error',
        message: 'Could not save drawing to device storage.',
        onRetry: handleSaveToGallery,
      });
    }
  };

  const handleExportPdf = async () => {
    if (!canvasRef.current) return;
    try {
      const filename = `${sanitizedDrg}_${project.metadata.revision}_Cable_Route_Plan.pdf`;
      await exportSvgToPdf(canvasRef.current, project.settings.paperSize, filename);
      showToast({
        tone: 'success',
        message: `Exported ${project.settings.paperSize} PDF (${filename}).`,
      });
    } catch {
      showToast({
        tone: 'error',
        message: 'Failed to export PDF drawing.',
        onRetry: handleExportPdf,
      });
    }
  };

  const handleExportDxf = async () => {
    try {
      const blob = await api.exportDxf(project);
      const filename = `${sanitizedDrg}_${project.metadata.revision}.dxf`;
      triggerBlobDownload(blob, filename);
      showToast({ tone: 'success', message: `Exported AutoCAD DXF (${filename}).` });
    } catch {
      showToast({
        tone: 'error',
        message: 'Failed to export AutoCAD DXF.',
        onRetry: handleExportDxf,
      });
    }
  };

  if (appMode === 'simple') {
    return (
      <SimpleAppView
        project={project}
        symbols={symbols}
        onUpdateProject={updateProject}
        onSwitchToAdvanced={() => setAppMode('prompt')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-page text-ink-primary flex flex-col">
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onLoadPreset={(preset) => {
          updateProject(preset);
          showToast({ tone: 'info', message: `Loaded sample: ${preset.name}` });
        }}
        onOpenSymbolManager={() => setIsSymbolManagerOpen(true)}
        onOpenRulePack={() => setIsRulePackOpen(true)}
        onSwitchToSimple={() => setAppMode('simple')}
        isBackendOnline={isBackendOnline}
        isCheckingHealth={isCheckingHealth}
        onRetryHealth={handleRetryHealth}
        unverifiedCount={unverifiedSymbolsCount}
      />

      <main className="flex-1 max-w-[1680px] w-full mx-auto p-3 sm:p-4 flex flex-col">
        {loadError && (
          <div
            role="alert"
            className="mb-3 px-4 py-2.5 rounded-sm border border-status-error-border bg-status-error-bg text-status-error text-xs font-medium flex items-center justify-between gap-3"
          >
            <span>{loadError}</span>
            <Button variant="secondary" size="sm" onClick={retryLoadInitialData}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Workspace Mode Switcher + History Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className="inline-flex items-center p-0.5 rounded-sm bg-surface-card border border-line shadow-sm"
            role="tablist"
            aria-label="Drafting mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={appMode === 'prompt'}
              onClick={() => setAppMode('prompt')}
              className={`min-h-[40px] px-3.5 rounded-sm text-xs font-medium inline-flex items-center gap-1.5 transition-colors duration-fast ${
                appMode === 'prompt'
                  ? 'bg-primary text-primary-ink'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Voice &amp; Prompt</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={appMode === 'detailed'}
              onClick={() => setAppMode('detailed')}
              className={`min-h-[40px] px-3.5 rounded-sm text-xs font-medium inline-flex items-center gap-1.5 transition-colors duration-fast ${
                appMode === 'detailed'
                  ? 'bg-primary text-primary-ink'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Engineering Sections</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="/raildraw-signalling.apk"
              download="raildraw-signalling.apk"
              className="hidden md:inline-flex min-h-[44px] px-3 items-center gap-1.5 bg-surface-card hover:bg-surface-hover text-ink-primary border border-line rounded-sm text-xs font-medium transition-colors duration-fast"
            >
              <Smartphone className="w-4 h-4 text-ink-secondary" />
              <span>Android APK</span>
            </a>
            <Button
              variant="secondary"
              iconOnly
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              aria-label="Undo change"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              iconOnly
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              aria-label="Redo change"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Prompt Mode */}
        {appMode === 'prompt' && (
          <PromptBar
            currentProject={project}
            onApplyProject={(newProj) => updateProject(newProj)}
            onDownloadPhoto={handleDownloadPhoto}
            onSaveToGallery={handleSaveToGallery}
            onOpenGallery={() => setIsGalleryOpen(true)}
            savedCount={savedRecords.length}
          />
        )}

        {/* Detailed Mode Stepper */}
        {appMode === 'detailed' && (
          <div className="mb-3">
            <StepNavigation
              currentStep={currentStep}
              onSelectStep={setCurrentStep}
              isStepValid={isStepValid}
            />
          </div>
        )}

        {/* Split Workspace: Form Panel + Live CAD Sheet */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-[580px]">
          {appMode === 'detailed' && !isCanvasExpanded && (
            <div className="w-full lg:w-[46%] xl:w-[44%] flex flex-col bg-surface-card rounded-md shadow-sm border border-line overflow-hidden">
              <div className="px-4 py-3 bg-surface-subtle border-b border-line flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink-primary">
                  Step {currentStep} of 5
                </span>
                {validation.isValid ? (
                  <StatusBadge tone="success">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valid</span>
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="error">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{validation.errors.length} Issues</span>
                  </StatusBadge>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {currentStep === 1 && (
                  <Step1Metadata
                    metadata={project.metadata}
                    onChange={(patch) =>
                      updateProject({ ...project, metadata: { ...project.metadata, ...patch } })
                    }
                    onNext={() => setCurrentStep(2)}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Nodes
                    startNode={project.startNode}
                    endNode={project.endNode}
                    intermediateNodes={project.intermediateNodes}
                    symbols={symbols}
                    onUpdateStartNode={(patch) =>
                      updateProject({ ...project, startNode: { ...project.startNode, ...patch } })
                    }
                    onUpdateEndNode={(patch) =>
                      updateProject({ ...project, endNode: { ...project.endNode, ...patch } })
                    }
                    onUpdateIntermediateNodes={(nodes) =>
                      updateProject({ ...project, intermediateNodes: nodes })
                    }
                    onPrev={() => setCurrentStep(1)}
                    onNext={() => setCurrentStep(3)}
                  />
                )}
                {currentStep === 3 && (
                  <Step3RouteSegments
                    segments={project.segments}
                    onChangeSegments={(segs) => updateProject({ ...project, segments: segs })}
                    onPrev={() => setCurrentStep(2)}
                    onNext={() => setCurrentStep(4)}
                  />
                )}
                {currentStep === 4 && (
                  <Step4Cables
                    cables={project.cables}
                    settings={project.settings}
                    onChangeCables={(cables) => updateProject({ ...project, cables })}
                    onChangeSettings={(patch) =>
                      updateProject({ ...project, settings: { ...project.settings, ...patch } })
                    }
                    onPrev={() => setCurrentStep(3)}
                    onNext={() => setCurrentStep(5)}
                  />
                )}
                {currentStep === 5 && (
                  <Step5PreviewExport
                    project={project}
                    validation={validation}
                    svgRef={canvasRef}
                    onChangePaperSize={(size: PaperSize) =>
                      updateProject({
                        ...project,
                        settings: { ...project.settings, paperSize: size },
                      })
                    }
                    onPrev={() => setCurrentStep(4)}
                    onSaveProject={() => api.saveProject(project)}
                    onLoadProjectJson={(loaded) => updateProject(loaded)}
                  />
                )}
              </div>
            </div>
          )}

          {/* CAD Sheet Panel */}
          <div
            className={`flex flex-col bg-surface-card rounded-md shadow-sm overflow-hidden border border-line ${
              appMode === 'prompt' || isCanvasExpanded ? 'w-full' : 'flex-1'
            } min-h-[580px]`}
          >
            <div className="px-4 py-2 bg-surface-subtle border-b border-line flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="font-semibold text-ink-primary">CAD Preview</span>
                <span className="text-ink-muted" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono text-ink-secondary truncate">
                  {project.metadata.drawingNumber} (Rev {project.metadata.revision})
                </span>
                <span className="text-ink-muted" aria-hidden="true">
                  ·
                </span>
                <span className="font-medium text-ink-primary tabular-nums">
                  {totalLength} m total
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button variant="secondary" size="sm" onClick={handleDownloadPhoto}>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={handleExportPdf}>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={handleExportDxf}>
                  <FileCode className="w-3.5 h-3.5" />
                  <span>DXF</span>
                </Button>
                {appMode === 'detailed' && (
                  <Button
                    variant="ghost"
                    iconOnly
                    onClick={() => setIsCanvasExpanded((prev) => !prev)}
                    aria-label={isCanvasExpanded ? 'Show form panel' : 'Expand drawing canvas'}
                    title={isCanvasExpanded ? 'Show form panel' : 'Expand canvas'}
                  >
                    {isCanvasExpanded ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="px-4 py-2.5 bg-surface-card border-b border-line">
              <DrawingVariantPicker
                value={project.settings.drawingVariant || 'standard'}
                onChange={(variant: DrawingVariant) =>
                  updateProject({
                    ...project,
                    settings: { ...project.settings, drawingVariant: variant },
                  })
                }
                compact
              />
            </div>

            <div className="flex-1 relative">
              <CadCanvas
                project={project}
                symbols={symbols}
                canvasRef={canvasRef}
                onUpdateCalloutPos={(x, y) => {
                  setProject((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      calloutPosition: { ...prev.settings.calloutPosition, x, y },
                    },
                  }));
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <SavedGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        savedList={savedRecords}
        onSelectDrawing={(loaded) => updateProject(loaded)}
        onRefreshList={() => setSavedRecords(getSavedDrawings())}
      />

      <SymbolManagerModal
        isOpen={isSymbolManagerOpen}
        onClose={() => setIsSymbolManagerOpen(false)}
        symbols={symbols}
        isLoadingSymbols={isLoadingSymbols}
        currentRole={currentRole}
        onSymbolUpdated={(updated) => {
          setSymbols((prev) => ({ ...prev, [updated.id]: updated }));
        }}
      />

      <RulePackModal
        isOpen={isRulePackOpen}
        onClose={() => setIsRulePackOpen(false)}
        isAdmin={currentRole === 'Admin'}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default App;
