import React, { useState } from 'react';
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
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualCheck = async () => {
    setIsChecking(true);
    setErrorMessage(null);
    try {
      const result = await checkForGitHubUpdates(true);
      onUpdateInfoChange(result);
    } catch (err) {
      setErrorMessage('Could not connect to GitHub to check for updates.');
    } finally {
      setIsChecking(false);
    }
  };

  const isNewAvailable = updateInfo?.isUpdateAvailable ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-surface-card text-ink-primary rounded-lg border border-line shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-modal-title"
      >
        {/* Tricolour Accent Line at the very top */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#FF9933]" />
          <div className="h-full flex-1 bg-[#FFFFFF] border-y border-gray-200" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-line bg-surface-subtle">
          <div className="flex items-center gap-3">
            <VandeBharatLogo size={36} className="shrink-0" />
            <div>
              <h2 id="update-modal-title" className="text-base font-semibold text-ink-primary flex items-center gap-2">
                <span>RailDraw Software Updates</span>
                {isNewAvailable && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-status-success text-white animate-pulse">
                    New Update
                  </span>
                )}
              </h2>
              <p className="text-xs text-ink-muted">
                GitHub Repository: <span className="font-mono">codeYashh/RailDraw-Signalling</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
            aria-label="Close updates dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Version Status Card */}
          <div
            className={`p-4 rounded-md border flex items-start gap-3.5 ${
              isNewAvailable
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-surface-subtle border-line'
            }`}
          >
            {isNewAvailable ? (
              <ArrowUpCircle className="w-6 h-6 text-status-success shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-status-success shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink-primary">
                {isNewAvailable
                  ? `Update Available: ${updateInfo?.latestVersion}`
                  : `You're on the latest version (${updateInfo?.currentVersion || 'v1.0.0'})`}
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                {isNewAvailable
                  ? 'A new version has been published on GitHub with latest features and fixes.'
                  : 'Your RailDraw Signalling installation is completely up to date with the main GitHub repository.'}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Package className="w-3.5 h-3.5" />
                  Installed: v{updateInfo?.currentVersion || '1.0.0'}
                </span>
                {isNewAvailable && (
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-status-success">
                    <Sparkles className="w-3.5 h-3.5" />
                    Latest: {updateInfo?.latestVersion}
                  </span>
                )}
                {updateInfo?.publishedAt && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(updateInfo.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Release Notes */}
          {isNewAvailable && updateInfo && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                What's New in {updateInfo.latestVersion}:
              </div>
              <div className="p-3.5 rounded-md bg-surface-subtle border border-line text-xs font-mono text-ink-secondary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {updateInfo.releaseNotes}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-md bg-status-error-bg border border-status-error-border text-status-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* How updates work note */}
          <div className="text-[11px] text-ink-muted border-t border-line-subtle pt-3">
            <span className="font-semibold text-ink-secondary">How updates work: </span>
            When you create a new release or push code to your GitHub repository, this app detects the new version and provides direct download and installation links.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-line bg-surface-subtle flex flex-wrap items-center justify-between gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking GitHub...' : 'Check for Updates'}</span>
          </Button>

          <div className="flex items-center gap-2">
            {updateInfo?.apkDownloadUrl && (
              <a
                href={updateInfo.apkDownloadUrl}
                download="RailDraw.apk"
                className="min-h-[36px] px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold bg-status-success text-white hover:bg-emerald-700 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isNewAvailable ? 'Install Update' : 'Download Latest APK'}</span>
              </a>
            )}

            <a
              href={updateInfo?.htmlUrl || 'https://github.com/codeYashh/RailDraw-Signalling'}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[36px] px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-ink hover:bg-primary-hover transition-colors shadow-sm"
            >
              <span>{isNewAvailable ? 'View Release' : 'View on GitHub'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
