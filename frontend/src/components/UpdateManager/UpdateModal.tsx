import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  X,
  AlertCircle,
  ArrowUpCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UpdateInfo, checkForGitHubUpdates, downloadUpdateApk } from '../../services/updateService';
import { openExternalUrl } from '../../services/androidBridge';
import { VandeBharatLogo } from '../Brand/VandeBharatLogo';
import { Button } from '../ui/Button';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  onUpdateInfoChange: (info: UpdateInfo) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onUpdateInfoChange,
}) => {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStatusText, setDownloadStatusText] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Keep track of check state to avoid flash
  const hasCheckedOnOpen = useRef<boolean>(false);

  const performCheck = async (force: boolean = true) => {
    setIsChecking(true);
    setErrorMessage(null);
    setDownloadSuccess(false);
    setIsDownloading(false);

    // Guaranteed minimum display time of 1300ms so the wheel rotates smoothly without glitching or flashing
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1300));

    try {
      const [result] = await Promise.all([
        checkForGitHubUpdates(force),
        minDelay,
      ]);
      onUpdateInfoChange(result);
    } catch {
      await minDelay;
      setErrorMessage('Could not connect to update servers. Check your connection or try again.');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      hasCheckedOnOpen.current = true;
      performCheck(true);
    } else {
      hasCheckedOnOpen.current = false;
      setIsDownloading(false);
      setDownloadSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isNewAvailable = updateInfo?.isUpdateAvailable ?? false;
  const currentVer = updateInfo?.currentVersion || '1.4.0';
  const latestVer = updateInfo?.latestVersion || currentVer;
  const apkDownloadUrl =
    updateInfo?.apkDownloadUrl ||
    'https://github.com/codeYashh/RailDraw-Signalling/raw/main/RailDraw.apk';
  const githubRepoUrl =
    updateInfo?.htmlUrl || 'https://github.com/codeYashh/RailDraw-Signalling';

  const handleStartUpdate = async () => {
    setIsDownloading(true);
    setDownloadProgress(10);
    setDownloadStatusText('Connecting to update repository...');

    // Progress simulation while downloading real file
    const pTimer = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(pTimer);
          return 85;
        }
        return prev + 15;
      });
    }, 250);

    try {
      await downloadUpdateApk(apkDownloadUrl, (percent, text) => {
        setDownloadProgress(percent);
        setDownloadStatusText(text);
      });
      clearInterval(pTimer);
      setDownloadProgress(100);
      setDownloadStatusText('Download complete! Installing update...');
      setDownloadSuccess(true);
    } catch (err: any) {
      clearInterval(pTimer);
      setIsDownloading(false);
      setErrorMessage(err?.message || 'Failed to download update APK.');
    }
  };

  const handleSimulateUpdateToggle = () => {
    if (!updateInfo) return;
    if (updateInfo.isUpdateAvailable) {
      // Switch to up to date
      onUpdateInfoChange({
        ...updateInfo,
        latestVersion: updateInfo.currentVersion,
        isUpdateAvailable: false,
      });
    } else {
      // Simulate newer version
      onUpdateInfoChange({
        ...updateInfo,
        latestVersion: '1.5.0',
        releaseName: 'RailDraw Signalling v1.5.0 (New Feature Pack)',
        releaseNotes: '• Redesigned Liquid Glass interface with smooth pill buttons\n• Modern streamlined Edit Mode with easy-to-use tabbed details\n• Glitch-free real-time update engine with native APK installer integration\n• Enhanced RDSO CAD vector precision & high-res export',
        isUpdateAvailable: true,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      <div className="w-full max-w-md bg-surface-card text-ink-primary rounded-3xl border border-line/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        {/* Tricolour Accent Ribbon at the very top */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#FF9933]" />
          <div className="h-full flex-1 bg-[#FFFFFF] border-y border-gray-200" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-line/50 bg-surface-subtle/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <VandeBharatLogo size={36} className="shrink-0" />
            <div>
              <h2 id="update-modal-title" className="text-base font-bold text-ink-primary flex items-center gap-2">
                <span>Update Checker</span>
                {isNewAvailable && !isChecking && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                    New Update
                  </span>
                )}
              </h2>
              <p className="text-xs text-ink-muted">
                Official RailDraw Signalling Updates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="liquid-glass-icon-btn min-h-[36px] min-w-[36px] p-1.5"
            aria-label="Close update checker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* STATE 1: SMOOTH LOADING WHEEL ROTATION WITH "CHECKING FOR UPDATES..." BELOW */}
          {isChecking ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-5 animate-fadeIn">
              {/* Premium Rotating Loading Wheel */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Exterior Glow Ring */}
                <div className="absolute inset-0 rounded-full blur-md bg-gradient-to-tr from-primary/30 via-accent/25 to-sky-400/20 animate-pulse" />

                {/* Smooth Rotating Wheel SVG */}
                <svg
                  className="w-20 h-20 animate-liquid-spin"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="text-line/40"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="url(#spinner-gradient)"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeDasharray="160"
                    strokeDashoffset="110"
                  />
                  <defs>
                    <linearGradient id="spinner-gradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0F2942" />
                      <stop offset="0.5" stopColor="#0284C7" />
                      <stop offset="1" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <VandeBharatLogo size={28} />
                </div>
              </div>

              {/* Text Clearly Written Below The Loading Wheel */}
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-ink-primary tracking-tight">
                  Checking for updates...
                </h3>
                <p className="text-xs text-ink-muted max-w-xs leading-relaxed">
                  Querying RailDraw release repository for signed APK builds and updates.
                </p>
              </div>

              {/* Minimalist Progress Dots */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#138808] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : isNewAvailable ? (
            /* STATE 2: NEW UPDATE AVAILABLE! ACTUAL WORKING UPDATE BUTTON */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 backdrop-blur-md">
                <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
                  <ArrowUpCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink-primary">
                    New Version Ready: v{latestVer}
                  </div>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    A fresh update for RailDraw Signalling is available with latest features!
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-subtle border border-line text-ink-muted">
                      v{currentVer}
                    </span>
                    <span className="text-ink-muted font-bold">&rarr;</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                      v{latestVer}
                    </span>
                  </div>
                </div>
              </div>

              {/* What's New Box */}
              {updateInfo?.releaseNotes && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                    <span>What's New in v{latestVer}:</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-line/70 text-xs text-ink-secondary whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-medium">
                    {updateInfo.releaseNotes}
                  </div>
                </div>
              )}

              {/* DOWNLOADING / INSTALLING PROGRESS STATE */}
              {isDownloading ? (
                <div className="p-4 rounded-2xl bg-surface-subtle/90 border border-line/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink-primary">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>{downloadStatusText || 'Downloading update...'}</span>
                    </span>
                    <span className="font-mono text-primary font-bold">{downloadProgress}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-line/50 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-sky-500 to-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>

                  {downloadSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Update file downloaded! Tap below to install if needed.</span>
                    </div>
                  )}
                </div>
              ) : (
                /* PRIMARY REAL UPDATE ACTION BUTTON */
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartUpdate}
                  className="w-full shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Update Now (Download APK)</span>
                </Button>
              )}

              <p className="text-[11px] text-ink-muted text-center leading-relaxed">
                Direct signed package: Tap Update to download the production APK. You can install it directly over your current build.
              </p>
            </div>
          ) : (
            /* STATE 3: YOUR APP IS UP TO DATE */
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-ink-primary tracking-tight">
                  Your Version is Up to Date!
                </h3>
                <p className="text-xs text-ink-secondary mt-1 max-w-xs">
                  RailDraw Signalling is running the latest build (<span className="font-mono font-bold text-ink-primary">v{currentVer}</span>).
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-subtle/80 border border-line/80 text-xs font-semibold text-ink-secondary">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Official S&amp;T Build</span>
              </div>

              {/* Verified APK download option so user can test and download anytime */}
              <div className="pt-2 w-full flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={onClose}
                >
                  <span>OK, Got It</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadUpdateApk(apkDownloadUrl)}
                  className="w-full"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Re-install Latest APK (GitHub)</span>
                </Button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-status-error-bg/90 border border-status-error-border text-status-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-line/40 bg-surface-subtle/40 backdrop-blur-md flex items-center justify-between text-xs text-ink-muted">
          <button
            type="button"
            onClick={() => performCheck(true)}
            disabled={isChecking}
            className="liquid-glass-secondary px-3.5 py-1.5 inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-hover"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check Again</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Quick simulation toggle so user can test the update workflow anytime */}
            <button
              type="button"
              onClick={handleSimulateUpdateToggle}
              title="Test update available UI & flow"
              className="text-[10px] text-ink-muted hover:text-primary underline px-1 py-0.5"
            >
              {isNewAvailable ? 'Show Up-to-Date' : 'Preview Update UI'}
            </button>

            <button
              type="button"
              onClick={() => openExternalUrl(githubRepoUrl)}
              className="liquid-glass-icon-btn min-h-[32px] px-2.5 py-1 inline-flex items-center gap-1 text-[11px]"
              title="Open GitHub repository"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
