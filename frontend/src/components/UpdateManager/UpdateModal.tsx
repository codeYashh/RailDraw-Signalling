import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  X,
  Package,
  Calendar,
  AlertCircle,
  ArrowUpCircle,
  ShieldCheck,
} from 'lucide-react';
import { UpdateInfo, checkForGitHubUpdates } from '../../services/updateService';
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
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCheckedThisSession, setHasCheckedThisSession] = useState<boolean>(false);

  // Automatically perform a fresh check when modal opens if not checked recently
  useEffect(() => {
    if (isOpen && !hasCheckedThisSession) {
      handleManualCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualCheck = async () => {
    setIsChecking(true);
    setErrorMessage(null);
    try {
      const result = await checkForGitHubUpdates(true);
      onUpdateInfoChange(result);
      setHasCheckedThisSession(true);
    } catch (err) {
      setErrorMessage('Could not connect to GitHub to check for updates. Please check your internet connection.');
    } finally {
      setIsChecking(false);
    }
  };

  const isNewAvailable = updateInfo?.isUpdateAvailable ?? false;
  const currentVer = updateInfo?.currentVersion || '1.4.0';
  const latestVer = updateInfo?.latestVersion || currentVer;

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
                {isNewAvailable && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                    New Available
                  </span>
                )}
              </h2>
              <p className="text-xs text-ink-muted">
                Official RailDraw Updates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-hover/80 transition-colors"
            aria-label="Close update checker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Active checking state */}
          {isChecking ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-primary animate-spin" />
              <div className="text-sm font-bold text-ink-primary">
                Checking for updates...
              </div>
              <p className="text-xs text-ink-muted max-w-xs">
                Querying GitHub repository for new release versions and signed APK builds.
              </p>
            </div>
          ) : isNewAvailable ? (
            /* POP-UP CASE 1: NEW VERSION IS AVAILABLE! */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
                <ArrowUpCircle className="w-8 h-8 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink-primary">
                    New Version Available: v{latestVer}
                  </div>
                  <p className="text-xs text-ink-secondary mt-1">
                    A newer release of RailDraw Signalling is ready to download with fresh features and improvements!
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-lg bg-surface-subtle border border-line text-ink-muted">
                      Current: v{currentVer}
                    </span>
                    <span className="text-ink-muted">→</span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                      Latest: v{latestVer}
                    </span>
                  </div>
                </div>
              </div>

              {/* What's New Box */}
              {updateInfo?.releaseNotes && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    What's New in v{latestVer}:
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-subtle/80 border border-line text-xs text-ink-secondary whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                    {updateInfo.releaseNotes}
                  </div>
                </div>
              )}

              {/* Primary Download Button */}
              <a
                href={updateInfo?.apkDownloadUrl || 'https://github.com/codeYashh/RailDraw-Signalling/raw/main/RailDraw.apk'}
                download="RailDraw.apk"
                className="w-full min-h-[46px] px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Latest Version (APK)</span>
              </a>

              <p className="text-[11px] text-ink-muted text-center leading-relaxed">
                Tip: After downloading, tap the APK to install. If your phone shows "App not installed", uninstall previous test builds first.
              </p>
            </div>
          ) : (
            /* POP-UP CASE 2: YOUR VERSION IS UP TO DATE! */
            <div className="py-3 flex flex-col items-center justify-center text-center space-y-3.5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-ink-primary">
                  Your Version is Up to Date!
                </h3>
                <p className="text-xs text-ink-secondary mt-1 max-w-xs">
                  You are running the latest version of RailDraw Signalling (<span className="font-mono font-semibold">v{currentVer}</span>).
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-line text-xs font-semibold text-ink-secondary">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>No updates required</span>
              </div>

              {/* Re-download latest APK fallback if user wants to reinstall */}
              <div className="pt-2 w-full flex flex-col gap-2">
                <Button
                  variant="primary"
                  className="w-full rounded-2xl min-h-[44px]"
                  onClick={onClose}
                >
                  <span>OK, Got It</span>
                </Button>

                <a
                  href={updateInfo?.apkDownloadUrl || 'https://github.com/codeYashh/RailDraw-Signalling/raw/main/RailDraw.apk'}
                  download="RailDraw.apk"
                  className="text-xs text-ink-muted hover:text-primary transition-colors py-1 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download APK again</span>
                </a>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-status-error-bg/80 border border-status-error-border text-status-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-line/40 bg-surface-subtle/40 backdrop-blur-md flex items-center justify-between text-xs text-ink-muted">
          <button
            type="button"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-hover min-h-[36px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check Again</span>
          </button>

          <a
            href={updateInfo?.htmlUrl || 'https://github.com/codeYashh/RailDraw-Signalling'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-ink-primary transition-colors"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
