import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DrawingProject, SymbolItem } from './types/drawing';
import { SAMPLE_PROJECT_REFERENCE } from './constants/railwayData';
import { UI_LIMITS } from './constants/uiConstants';
import { SplashScreen } from './components/Brand/SplashScreen';
import { SimpleAppView } from './components/SimpleApp/SimpleAppView';
import { UpdateModal } from './components/UpdateManager/UpdateModal';
import { UpdateInfo, checkForGitHubUpdates, getCachedUpdateInfo } from './services/updateService';
import { Toast, ToastState } from './components/ui/Toast';
import { api } from './services/api';

export function App() {
  const [project, setProject] = useState<DrawingProject>(SAMPLE_PROJECT_REFERENCE);
  const [symbols, setSymbols] = useState<Record<string, SymbolItem>>({});
  const [isLoadingSymbols, setIsLoadingSymbols] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // App Launch Splash Animation & GitHub Update states
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(() => getCachedUpdateInfo());
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((nextToast: ToastState) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(nextToast);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, UI_LIMITS.TOAST_DURATION_MS);
  }, []);

  // Fetch symbol manifest on startup
  const fetchManifest = useCallback(async () => {
    try {
      const manifest = await api.getSymbolManifest();
      const symMap: Record<string, SymbolItem> = {};
      manifest.symbols.forEach((s) => {
        symMap[s.id] = s;
      });
      setSymbols(symMap);
      setLoadError(null);
    } catch {
      setLoadError('Could not load S&T symbol manifest.');
    } finally {
      setIsLoadingSymbols(false);
    }
  }, []);

  useEffect(() => {
    fetchManifest();
  }, [fetchManifest]);

  // Check for updates in background
  useEffect(() => {
    checkForGitHubUpdates(false)
      .then((info) => setUpdateInfo(info))
      .catch(() => {});
  }, []);

  const handleUpdateProject = (nextProject: DrawingProject) => {
    setProject(nextProject);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <SimpleAppView
        project={project}
        symbols={symbols}
        onUpdateProject={handleUpdateProject}
        onOpenUpdates={() => setIsUpdateModalOpen(true)}
        isUpdateAvailable={updateInfo?.isUpdateAvailable}
      />

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={updateInfo}
        onUpdateInfoChange={setUpdateInfo}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

export default App;
