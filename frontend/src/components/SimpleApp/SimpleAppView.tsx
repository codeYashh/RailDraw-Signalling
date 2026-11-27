import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DrawingProject, DrawingVariant, PlacedSymbol, SymbolItem } from '../../types/drawing';
import { parseNaturalLanguagePrompt, DimensionProposal } from '../../services/promptParser';
import { InteractiveSymbolDef } from '../Canvas/InteractiveSymbols';
import { buildPdfFromSvg, exportSvgToPdf } from '../../services/pdfExport';
import { renderSvgToDataUrl } from '../../services/canvasExport';
import {
  getSavedDrawings,
  saveDrawingRecord,
  updateRecordThumbnail,
  deleteSavedRecord,
  SavedDrawingRecord,
} from '../../services/storageService';
import {
  savePngToPhone,
  sharePngNatively,
  sharePdfNatively,
  triggerAndroidVoice,
  syncAndroidSystemBars,
  notifyAppExit,
} from '../../services/androidBridge';
import { CANVAS_CONFIG, STORAGE_KEYS, UI_LIMITS } from '../../constants/uiConstants';
import { SplashScreen } from '../Brand/SplashScreen';
import { Toast, ToastState } from '../ui/Toast';
import { HistoryDrawer } from './HistoryDrawer';
import { HomeComposer } from './HomeComposer';
import { ResultWorkspace } from './ResultWorkspace';
import { SymbolPickerSheet } from './SymbolPickerSheet';
import { ShareSheet } from './ShareSheet';

interface SimpleAppViewProps {
  project: DrawingProject;
  symbols: Record<string, SymbolItem>;
  onUpdateProject: (newProject: DrawingProject) => void;
  onOpenUpdates?: () => void;
  isUpdateAvailable?: boolean;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const SimpleAppView: React.FC<SimpleAppViewProps> = ({
  project,
  symbols,
  onUpdateProject,
  onOpenUpdates,
  isUpdateAvailable,
  isDark: propIsDark,
  onToggleTheme: propOnToggleTheme,
}) => {
  const [internalDark, setInternalDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const isDark = propIsDark !== undefined ? propIsDark : internalDark;
  const toggleTheme = propOnToggleTheme || (() => setInternalDark((prev) => !prev));

  useEffect(() => {
    if (propIsDark === undefined) {
      try {
        localStorage.setItem(STORAGE_KEYS.THEME_MODE, isDark ? 'dark' : 'light');
      } catch {
        // Ignore storage failures in restricted contexts
      }
      syncAndroidSystemBars(isDark);
    }
  }, [isDark, propIsDark]);

  const [screen, setScreen] = useState<'home' | 'result'>('home');
  const [promptText, setPromptText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dimensionProposal, setDimensionProposal] = useState<DimensionProposal | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<SavedDrawingRecord[]>(() => getSavedDrawings());
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const pendingHistoryIdRef = useRef<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const lastBackTriggerRef = useRef<number>(0);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedSymbolId, setSelectedSymbolId] = useState<string | null>(null);
  const [isSymbolPickerOpen, setIsSymbolPickerOpen] = useState<boolean>(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState<boolean>(false);
  const [isBusyExport, setIsBusyExport] = useState<boolean>(false);

  // Master single-step back navigation for phone gestures, back buttons, and edge swipes
  const handleBack = useCallback((): boolean => {
    const now = Date.now();
    if (now - lastBackTriggerRef.current < 350) {
      return true; // Debounce rapid back triggers
    }
    lastBackTriggerRef.current = now;

    // 1. Close symbol picker sheet if open
    if (isSymbolPickerOpen) {
      setIsSymbolPickerOpen(false);
      return true;
    }
    // 2. Close share sheet if open
    if (isShareSheetOpen) {
      setIsShareSheetOpen(false);
      return true;
    }
    // 3. Close history sidebar if open
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
      return true;
    }
    // 4. Deselect symbol or exit edit mode
    if (selectedSymbolId) {
      setSelectedSymbolId(null);
      return true;
    }
    if (isEditMode) {
      setIsEditMode(false);
      return true;
    }
    // 5. If on drawing result workspace, return to home
    if (screen === 'result') {
      setIsEditMode(false);
      setSelectedSymbolId(null);
      setScreen('home');
      return true;
    }
    // 6. On home screen: ask Android to show "Press back again to exit" (prevents accidental full exit)
    notifyAppExit();
    return false;
  }, [isSymbolPickerOpen, isShareSheetOpen, isSidebarOpen, selectedSymbolId, isEditMode, screen]);

  // Connect to Android native back button & gesture navigation
  useEffect(() => {
    (window as any).__onHardwareBack = () => {
      handleBack();
    };
    return () => {
      delete (window as any).__onHardwareBack;
    };
  }, [handleBack]);

  // Left-swipe drawer gesture: swipe from left (left-to-right) opens left sidebar; swipe left closes it
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let startedInInput = false;
    let startedInCanvas = false;
    let gestureHandled = false;
    let tracking = false;

    const tryHandleSwipe = (clientX: number, clientY: number, minDx: number) => {
      if (!tracking || gestureHandled) return;
      const dx = clientX - touchStartX;
      const dy = clientY - touchStartY;

      if (Math.abs(dy) > 80 || Math.abs(dy) > Math.abs(dx)) {
        return;
      }

      if (isSidebarOpen) {
        if (dx < -minDx) {
          gestureHandled = true;
          setIsSidebarOpen(false);
        }
        return;
      }

      if (isSymbolPickerOpen || isShareSheetOpen) return;

      const allowOpenFromHome =
        screen === 'home' && (!startedInInput || touchStartX < 72);
      const allowOpenFromResult =
        screen === 'result' && !isEditMode && (touchStartX < 56 || !startedInCanvas);

      if ((allowOpenFromHome || allowOpenFromResult) && dx > minDx) {
        gestureHandled = true;
        setHistoryItems(getSavedDrawings());
        setIsSidebarOpen(true);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        tracking = false;
        return;
      }
      tracking = true;
      gestureHandled = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      const target = e.target as HTMLElement | null;
      startedInInput = Boolean(target?.closest('textarea, input, select'));
      startedInCanvas = Boolean(target?.closest('#rail-cad-canvas'));
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking || gestureHandled || e.touches.length !== 1) return;
      tryHandleSwipe(e.touches[0].clientX, e.touches[0].clientY, 72);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking || gestureHandled || e.changedTouches.length !== 1) {
        tracking = false;
        return;
      }
      tryHandleSwipe(e.changedTouches[0].clientX, e.changedTouches[0].clientY, 50);
      tracking = false;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isSidebarOpen, isSymbolPickerOpen, isShareSheetOpen, screen, isEditMode]);

  const showToast = useCallback((nextToast: ToastState) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
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

  useEffect(() => {
    window.__onAndroidVoiceResult = (transcript: string) => {
      setPromptText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
      setErrorMessage(null);
    };

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-IN';

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPromptText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        setErrorMessage(null);
      };

      recog.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone permission denied. Enter the route details manually.');
        }
      };

      recog.onend = () => setIsListening(false);
      recognitionRef.current = recog;
    }

    return () => {
      delete window.__onAndroidVoiceResult;
    };
  }, []);

  useEffect(() => {
    if (screen !== 'result' || !pendingHistoryIdRef.current) return;
    const recordId = pendingHistoryIdRef.current;

    const timer = window.setTimeout(async () => {
      const svg = document.querySelector('svg#rail-cad-canvas') as SVGSVGElement | null;
      if (svg) {
        try {
          const thumb = await renderSvgToDataUrl(
            svg,
            CANVAS_CONFIG.THUMBNAIL_WIDTH,
            CANVAS_CONFIG.THUMBNAIL_HEIGHT,
            'image/jpeg',
            0.8
          );
          setHistoryItems(updateRecordThumbnail(recordId, thumb));
        } catch {
          // Ignore thumbnail errors
        }
      }
      pendingHistoryIdRef.current = null;
    }, UI_LIMITS.THUMBNAIL_CAPTURE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [screen, project]);

  const toggleMic = () => {
    if (triggerAndroidVoice('')) {
      setErrorMessage(null);
      return;
    }

    const recog = recognitionRef.current;
    if (!recog) {
      setErrorMessage('Voice recognition is unavailable in this browser. Enter details manually.');
      return;
    }

    if (isListening) {
      recog.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      try {
        recog.lang = navigator.language || 'en-IN';
        recog.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const commitGeneratedProject = (nextProject: DrawingProject, notice?: string) => {
    setErrorMessage(null);
    setDimensionProposal(null);
    setIsEditMode(false);
    setSelectedSymbolId(null);
    onUpdateProject(nextProject);

    const rec = saveDrawingRecord(nextProject, '', promptText.trim());
    pendingHistoryIdRef.current = rec.id;
    setActiveHistoryId(rec.id);
    setHistoryItems(getSavedDrawings());
    setScreen('result');
    if (notice) {
      showToast({ message: notice, tone: 'success' });
    }
  };

  const handleGenerate = () => {
    if (!promptText.trim()) {
      setErrorMessage('Enter a signalling cable route description before generating.');
      return;
    }

    const result = parseNaturalLanguagePrompt(promptText);
    if (result.error) {
      setDimensionProposal(null);
      setErrorMessage(result.error);
      return;
    }

    // Automatically calibrate unmeasured or mismatched segment totals without blocking on errors
    commitGeneratedProject(result.project);
  };

  const handleChangeDrawingVariant = (variant: DrawingVariant) => {
    onUpdateProject({
      ...project,
      settings: {
        ...project.settings,
        drawingVariant: variant,
      },
    });
  };

  const handleSavePng = async () => {
    setIsBusyExport(true);
    try {
      const svg = document.querySelector('svg#rail-cad-canvas') as SVGSVGElement | null;
      if (!svg) {
        showToast({ message: 'Drawing sheet is still rendering.', tone: 'error', onRetry: handleSavePng });
        return;
      }

      const pngUrl = await renderSvgToDataUrl(
        svg,
        CANVAS_CONFIG.PNG_EXPORT_WIDTH,
        CANVAS_CONFIG.PNG_EXPORT_HEIGHT,
        'image/png',
        1.0
      );
      const fileName = `RailDraw_${project.startNode.id}_to_${project.endNode.id}_${Date.now()}.png`;
      const result = savePngToPhone(pngUrl, fileName);

      const thumb = await renderSvgToDataUrl(
        svg,
        CANVAS_CONFIG.THUMBNAIL_WIDTH,
        CANVAS_CONFIG.THUMBNAIL_HEIGHT,
        'image/jpeg',
        0.8
      );
      const currentList = getSavedDrawings();
      if (activeHistoryId && currentList.some((r) => r.id === activeHistoryId)) {
        setHistoryItems(updateRecordThumbnail(activeHistoryId, thumb));
      } else {
        const saved = saveDrawingRecord(project, thumb, promptText.trim());
        setActiveHistoryId(saved.id);
        setHistoryItems(getSavedDrawings());
      }

      if (result.ok) {
        showToast({ message: `PNG saved (${result.location})`, tone: 'success' });
      } else {
        showToast({
          message: result.error || 'Could not save PNG image.',
          tone: 'error',
          onRetry: handleSavePng,
        });
      }
    } catch {
      showToast({ message: 'Failed to export PNG image.', tone: 'error', onRetry: handleSavePng });
    } finally {
      setIsBusyExport(false);
    }
  };

  const handleSavePdf = async () => {
    setIsBusyExport(true);
    try {
      const svg = document.querySelector('svg#rail-cad-canvas') as SVGSVGElement | null;
      if (!svg) {
        showToast({ message: 'Drawing sheet is not ready.', tone: 'error', onRetry: handleSavePdf });
        return;
      }
      const fileName = `RailDraw_${project.startNode.id}_to_${project.endNode.id}_${Date.now()}.pdf`;
      const res = await exportSvgToPdf(svg, 'A3', fileName);
      showToast({ message: `A3 PDF saved (${res.location})`, tone: 'success' });
    } catch (err: any) {
      showToast({
        message: err?.message || 'Failed to save A3 PDF.',
        tone: 'error',
        onRetry: handleSavePdf,
      });
    } finally {
      setIsBusyExport(false);
    }
  };

  const handleShareAsImage = async () => {
    setIsShareSheetOpen(false);
    setIsBusyExport(true);
    const shareTitle = `RailDraw Plan (${project.startNode.id} to ${project.endNode.id})`;
    const shareCaption = `Indian Railways signalling cable route drawing (${project.startNode.id} to ${project.endNode.id})${
      promptText ? `\n${promptText}` : ''
    }`;

    try {
      const svg = document.querySelector('svg#rail-cad-canvas') as SVGSVGElement | null;
      if (!svg) {
        showToast({ message: 'Drawing sheet is not ready to share.', tone: 'error', onRetry: handleShareAsImage });
        return;
      }

      const pngUrl = await renderSvgToDataUrl(
        svg,
        CANVAS_CONFIG.PNG_EXPORT_WIDTH,
        CANVAS_CONFIG.PNG_EXPORT_HEIGHT,
        'image/png',
        1.0
      );
      const fileName = `RailDraw_${project.startNode.id}_to_${project.endNode.id}_${Date.now()}.png`;

      if (sharePngNatively(pngUrl, fileName, shareCaption)) return;

      const blob = await (await fetch(pngUrl)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: shareTitle, text: shareCaption, files: [file] });
          return;
        } catch {
          return;
        }
      }

      savePngToPhone(pngUrl, fileName);
      showToast({ message: 'PNG downloaded for sharing.', tone: 'info' });
    } catch {
      showToast({ message: 'Could not share PNG image.', tone: 'error', onRetry: handleShareAsImage });
    } finally {
      setIsBusyExport(false);
    }
  };

  const handleShareAsPdf = async () => {
    setIsShareSheetOpen(false);
    setIsBusyExport(true);
    const shareTitle = `RailDraw A3 PDF (${project.startNode.id} to ${project.endNode.id})`;
    const shareCaption = `Indian Railways signalling cable route A3 PDF (${project.startNode.id} to ${project.endNode.id})`;

    try {
      const svg = document.querySelector('svg#rail-cad-canvas') as SVGSVGElement | null;
      if (!svg) {
        showToast({ message: 'Drawing sheet is not ready to share.', tone: 'error', onRetry: handleShareAsPdf });
        return;
      }

      const { pdf, dataUri, blob } = await buildPdfFromSvg(svg, 'A3');
      const fileName = `RailDraw_${project.startNode.id}_to_${project.endNode.id}_${Date.now()}.pdf`;

      if (sharePdfNatively(dataUri, fileName, shareCaption)) return;

      const file = new File([blob], fileName, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: shareTitle, text: shareCaption, files: [file] });
          return;
        } catch {
          return;
        }
      }

      pdf.save(fileName);
      showToast({ message: 'A3 PDF downloaded for sharing.', tone: 'info' });
    } catch {
      showToast({ message: 'Could not share A3 PDF.', tone: 'error', onRetry: handleShareAsPdf });
    } finally {
      setIsBusyExport(false);
    }
  };

  const handleUpdatePlacedSymbols = (nextSymbols: PlacedSymbol[]) => {
    onUpdateProject({ ...project, placedSymbols: nextSymbols });
  };

  const handleAddSymbol = (def: InteractiveSymbolDef) => {
    const existing = project.placedSymbols || [];
    const sameCount = existing.filter((s) => s.symbolType === def.type).length;
    const label =
      def.defaultPrefix.length >= 3 ? def.defaultPrefix : `${def.defaultPrefix}${sameCount + 1}`;
    const offset = (existing.length % 6) * 44;
    const newSym: PlacedSymbol = {
      id: `sym_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      symbolType: def.type,
      label,
      x: Math.min(260 + offset, 760),
      y: 138 + (existing.length % 2) * 58,
      scale: 1.0,
      rotation: 0,
    };
    handleUpdatePlacedSymbols([...existing, newSym]);
    setSelectedSymbolId(newSym.id);
    setIsEditMode(true);
    setIsSymbolPickerOpen(false);
    showToast({ message: `Inserted ${def.name}. Drag to position.`, tone: 'info' });
  };

  const selectedSymbol =
    (project.placedSymbols || []).find((s) => s.id === selectedSymbolId) || null;

  const patchSelectedSymbol = (patch: Partial<PlacedSymbol>) => {
    if (!selectedSymbol) return;
    handleUpdatePlacedSymbols(
      (project.placedSymbols || []).map((s) =>
        s.id === selectedSymbol.id ? { ...s, ...patch } : s
      )
    );
  };

  const handleDuplicateSelected = () => {
    if (!selectedSymbol) return;
    const copy: PlacedSymbol = {
      ...selectedSymbol,
      id: `sym_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      x: Math.min(selectedSymbol.x + 36, 910),
      y: Math.min(selectedSymbol.y + 24, 515),
    };
    handleUpdatePlacedSymbols([...(project.placedSymbols || []), copy]);
    setSelectedSymbolId(copy.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedSymbol) return;
    handleUpdatePlacedSymbols(
      (project.placedSymbols || []).filter((s) => s.id !== selectedSymbol.id)
    );
    setSelectedSymbolId(null);
  };

  const handleOpenHistoryItem = (item: SavedDrawingRecord) => {
    pendingHistoryIdRef.current = null;
    setActiveHistoryId(item.id);
    onUpdateProject(item.project);
    if (item.promptText) setPromptText(item.promptText);
    setErrorMessage(null);
    setIsSidebarOpen(false);
    setScreen('result');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryItems(deleteSavedRecord(id));
    if (activeHistoryId === id) setActiveHistoryId(null);
    showToast({ message: 'Removed drawing from history.', tone: 'info' });
  };

  const handleNewDrawing = () => {
    setPromptText('');
    setErrorMessage(null);
    setIsSidebarOpen(false);
    setScreen('home');
  };

  return (
    <div className={isDark ? 'theme-dark' : ''}>
      <HistoryDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={historyItems}
        activeId={activeHistoryId}
        onSelect={handleOpenHistoryItem}
        onDelete={handleDeleteHistoryItem}
        onNewDrawing={handleNewDrawing}
        onOpenUpdates={onOpenUpdates}
        isUpdateAvailable={isUpdateAvailable}
      />

      {screen === 'home' ? (
        <HomeComposer
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenHistory={() => {
            setHistoryItems(getSavedDrawings());
            setIsSidebarOpen(true);
          }}
          historyCount={historyItems.length}
          promptText={promptText}
          onPromptChange={(val) => {
            setPromptText(val);
            setErrorMessage(null);
            setDimensionProposal(null);
          }}
          isListening={isListening}
          onToggleMic={toggleMic}
          onGenerate={handleGenerate}
          errorMessage={errorMessage}
          dimensionProposal={dimensionProposal}
          onApproveDimensionProposal={(approvedProject, label) =>
            commitGeneratedProject(approvedProject, label)
          }
          onDismissDimensionProposal={() => setDimensionProposal(null)}
          onOpenUpdates={onOpenUpdates}
          isUpdateAvailable={isUpdateAvailable}
        />
      ) : (
        <>
          <ResultWorkspace
            project={project}
            symbols={symbols}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onOpenHistory={() => {
              setHistoryItems(getSavedDrawings());
              setIsSidebarOpen(true);
            }}
            onBackToHome={() => {
              setIsEditMode(false);
              setSelectedSymbolId(null);
              setScreen('home');
            }}
            onUpdateProject={onUpdateProject}
            onChangeDrawingVariant={handleChangeDrawingVariant}
            isEditMode={isEditMode}
            onToggleEditMode={() => {
              setIsEditMode((prev) => {
                if (prev) setSelectedSymbolId(null);
                return !prev;
              });
            }}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbolId}
            onUpdatePlacedSymbols={handleUpdatePlacedSymbols}
            onPatchSelectedSymbol={patchSelectedSymbol}
            onDuplicateSelected={handleDuplicateSelected}
            onDeleteSelected={handleDeleteSelected}
            onOpenSymbolPicker={() => setIsSymbolPickerOpen(true)}
            onSavePng={handleSavePng}
            onSavePdf={handleSavePdf}
            onOpenShare={() => setIsShareSheetOpen(true)}
            isBusyExport={isBusyExport}
          />

          <SymbolPickerSheet
            isOpen={isSymbolPickerOpen}
            onClose={() => setIsSymbolPickerOpen(false)}
            onAddSymbol={handleAddSymbol}
          />

          <ShareSheet
            isOpen={isShareSheetOpen}
            onClose={() => setIsShareSheetOpen(false)}
            onShareImage={handleShareAsImage}
            onSharePdf={handleShareAsPdf}
            isBusy={isBusyExport}
          />
        </>
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};
