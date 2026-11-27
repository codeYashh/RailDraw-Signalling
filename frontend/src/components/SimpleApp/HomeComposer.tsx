import React, { useEffect, useRef } from 'react';
import { Menu, Sun, Moon, Mic, MicOff, ArrowRight, AlertCircle, Radio, Sparkles } from 'lucide-react';
import { UI_LIMITS } from '../../constants/uiConstants';
import { DimensionProposal } from '../../services/promptParser';
import { DrawingProject } from '../../types/drawing';
import { Button } from '../ui/Button';
import { DimensionApprovalCard } from '../ui/DimensionApprovalCard';

interface HomeComposerProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  promptText: string;
  onPromptChange: (value: string) => void;
  isListening: boolean;
  onToggleMic: () => void;
  onGenerate: () => void;
  errorMessage: string | null;
  dimensionProposal: DimensionProposal | null;
  onApproveDimensionProposal: (approvedProject: DrawingProject, label: string) => void;
  onDismissDimensionProposal: () => void;
  onOpenUpdates?: () => void;
  isUpdateAvailable?: boolean;
}

export const HomeComposer: React.FC<HomeComposerProps> = ({
  isDark,
  onToggleTheme,
  onOpenHistory,
  historyCount,
  promptText,
  onPromptChange,
  isListening,
  onToggleMic,
  onGenerate,
  errorMessage,
  dimensionProposal,
  onApproveDimensionProposal,
  onDismissDimensionProposal,
  onOpenUpdates,
  isUpdateAvailable,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasPrompt = promptText.trim().length > 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, UI_LIMITS.MAX_COMPOSER_HEIGHT_PX)}px`;
  }, [promptText]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-page text-ink-primary relative overflow-hidden">
      {/* Ambient Liquid Glow Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[580px] h-[360px] bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-3xl rounded-full opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-[-10%] w-[420px] h-[320px] bg-gradient-to-tl from-accent/15 via-primary/10 to-transparent blur-3xl rounded-full opacity-50"
      />

      {/* Top Controls Bar with Frosted Glass Header */}
      <header className="glass-header sticky top-0 z-20 px-3 sm:px-5 py-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={onOpenHistory}
          className="relative liquid-glass-icon-btn min-h-[42px] min-w-[42px]"
          aria-label="Open saved drawings"
          title="Saved drawings"
        >
          <Menu className="w-5 h-5" />
          {historyCount > 0 && (
            <span
              className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-accent-solid ring-2 ring-white dark:ring-gray-900"
              aria-hidden="true"
            />
          )}
        </button>

        <div className="flex items-center justify-center">
          <span className="text-lg font-extrabold tracking-tight text-ink-primary select-none">
            RailDraw
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenUpdates && (
            <button
              type="button"
              onClick={onOpenUpdates}
              className="relative liquid-glass-secondary px-3.5 py-1.5 inline-flex items-center gap-1.5 text-xs font-bold"
              title="Check for software updates"
              aria-label="Check for software updates"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden xs:inline">Updates</span>
              {isUpdateAvailable && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            className="liquid-glass-icon-btn min-h-[40px] min-w-[40px]"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
          </button>
        </div>
      </header>

      {/* Main Drafting Workspace - Centered with Liquid Glass Styling */}
      <main className="flex-1 flex flex-col justify-center w-full max-w-xl mx-auto px-4 pt-16 pb-4 sm:pt-20 sm:pb-6 relative z-10">
        {/* Let's Create - Centered in Bigger Fonts with No Emojis */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-[2.625rem] leading-[1.1] sm:text-5xl md:text-6xl font-black tracking-tight text-ink-primary">
            Let's Create
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-ink-muted font-medium">
            Speak or type to generate signalling cable route plans
          </p>
        </div>

        {/* Prompt Giving Area - Liquid Glass Card with Soft Rounded Corners */}
        <section
          aria-label="Route specification prompt"
          className="mt-2 sm:mt-4 glass-panel rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 border border-line/60"
        >
          <div className="p-4 sm:p-5">
            <textarea
              id="route-prompt-input"
              ref={textareaRef}
              rows={3}
              value={promptText}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onGenerate();
                }
              }}
              placeholder="Type.."
              aria-invalid={Boolean(errorMessage)}
              className="w-full glass-input rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-ink-primary placeholder:text-ink-muted resize-none leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
            />

            {/* Listening Indicator with Rounded Pulse */}
            {isListening && (
              <div className="mt-3 px-4 py-2.5 rounded-full bg-status-error-bg/80 border border-status-error-border text-status-error text-xs font-semibold flex items-center gap-2 animate-pulse backdrop-blur-md">
                <Radio className="w-4 h-4 shrink-0 animate-spin" />
                <span>Listening... speak route details in English or Hindi...</span>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="mt-3 px-4 py-2.5 rounded-2xl border border-status-error-border bg-status-error-bg/90 text-status-error text-xs font-medium flex items-start gap-2 backdrop-blur-md"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="px-5 py-3.5 border-t border-line/50 bg-surface-subtle/50 backdrop-blur-md flex items-center justify-between gap-3">
            <Button
              variant={isListening ? 'danger' : 'secondary'}
              size="sm"
              onClick={onToggleMic}
              aria-pressed={isListening}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-primary" />}
              <span>{isListening ? 'Stop' : 'Voice'}</span>
            </Button>

            <Button
              variant="primary"
              onClick={onGenerate}
              disabled={!hasPrompt}
              className="shadow-md"
            >
              <span>Generate</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Dimension Reconciliation Approval Card with Rounded Glass Effect */}
        {dimensionProposal && (
          <div className="mt-4">
            <DimensionApprovalCard
              proposal={dimensionProposal}
              onApprove={onApproveDimensionProposal}
              onDismiss={onDismissDimensionProposal}
            />
          </div>
        )}
      </main>

      <footer className="px-4 py-3.5 border-t border-line/40 text-center relative z-10 flex flex-col items-center justify-center">
        <p className="text-xs sm:text-sm font-semibold text-ink-primary tracking-wide">
          Designed and Crafted by Yash
        </p>
        <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5">
          Offline Indian Railways S&amp;T Drafting Tool
        </p>
      </footer>
    </div>
  );
};
