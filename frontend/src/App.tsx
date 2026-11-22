import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DrawingProject, SymbolItem } from './types/drawing';
import { SAMPLE_PROJECT_REFERENCE } from './constants/railwayData';
import { STORAGE_KEYS, UI_LIMITS } from './constants/uiConstants';
import { SplashScreen } from './components/Brand/SplashScreen';
import { SimpleAppView } from './components/SimpleApp/SimpleAppView';
import { UpdateModal } from './components/UpdateManager/UpdateModal';
import { UpdateInfo, checkForGitHubUpdates, getCachedUpdateInfo } from './services/updateService';
import { Toast, ToastState } from './components/ui/Toast';
import { api } from './services/api';
import { syncAndroidSystemBars } from './services/androidBridge';

export function App() {
  const [project, setProject] = useState<DrawingProject>(SAMPLE_PROJECT_REFERENCE);
  const [symbols, setSymbols] = useState<Record<string, SymbolItem>>({});
  const [isLoadingSymbols, setIsLoadingSymbols] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // App Theme state - initialized immediately so splash matches theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sync theme mode across DOM, document body, meta theme-color, and Android system bars
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('theme-dark');
        document.documentElement.style.backgroundColor = '#0A111A';
        document.body.style.backgroundColor = '#0A111A';
      } else {
        document.documentElement.classList.remove('theme-dark');
        document.documentElement.style.backgroundColor = '#F8FAFC';
        document.body.style.backgroundColor = '#F8FAFC';
      }
      const metaTheme = document.getElementById('meta-theme-color') || document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', isDark ? '#0A111A' : '#F8FAFC');
      }
    } catch {
      // Ignore storage failures in sandboxed contexts
    }
    syncAndroidSystemBars(isDark);
  }, [isDark]);

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

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <>
      {showSplash && (
        <SplashScreen
          isDark={isDark}
          onFinish={() => setShowSplash(false)}
        />
      )}

      <SimpleAppView
        project={project}
        symbols={symbols}
        onUpdateProject={handleUpdateProject}
        onOpenUpdates={() => setIsUpdateModalOpen(true)}
        isUpdateAvailable={updateInfo?.isUpdateAvailable}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
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
