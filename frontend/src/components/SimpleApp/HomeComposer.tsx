import React, { useEffect, useRef } from 'react';
import { Menu, Sun, Moon, Mic, MicOff, ArrowRight, AlertCircle, Globe, Radio } from 'lucide-react';
import { ROUTE_PROMPT_EXAMPLES, UI_LIMITS } from '../../constants/uiConstants';
import { DimensionProposal } from '../../services/promptParser';
import { DrawingProject } from '../../types/drawing';
import { VandeBharatLogo } from '../Brand/VandeBharatLogo';
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
  voiceLang: 'hi-IN' | 'en-IN';
  onChangeVoiceLang: (lang: 'hi-IN' | 'en-IN') => void;
  onGenerate: () => void;
  errorMessage: string | null;
  dimensionProposal: DimensionProposal | null;
  onApproveDimensionProposal: (approvedProject: DrawingProject, label: string) => void;
  onDismissDimensionProposal: () => void;
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
  voiceLang,
  onChangeVoiceLang,
  onGenerate,
  errorMessage,
  dimensionProposal,
  onApproveDimensionProposal,
  onDismissDimensionProposal,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasPrompt = promptText.trim().length > 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, UI_LIMITS.MAX_COMPOSER_HEIGHT_PX)}px`;
  }, [promptText]);

  const isHindi = voiceLang === 'hi-IN';

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-page text-ink-primary">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 px-4 py-2 flex items-center justify-between border-b border-line bg-surface-card">
        <button
          type="button"
          onClick={onOpenHistory}
          className="relative min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover active:bg-surface-active transition-colors duration-fast"
          aria-label="Open saved drawings"
          title="Saved drawings"
        >
          <Menu className="w-5 h-5" />
          {historyCount > 0 && (
            <span
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent-solid"
              aria-hidden="true"
            />
          )}
        </button>

        <div className="flex items-center gap-2">
          <VandeBharatLogo size={28} />
          <span className="text-sm font-semibold tracking-tight text-ink-primary">
            RailDraw
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleTheme}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover active:bg-surface-active transition-colors duration-fast"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Drafting Workspace */}
      <main className="flex-1 flex flex-col justify-center w-full max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            Indian Railways S&amp;T — IRSEM Part II
          </p>
          <h1 className="mt-1 text-2xl sm:text-[28px] font-bold tracking-tight text-ink-primary leading-tight">
            Signalling Cable Route Plan
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-ink-secondary leading-relaxed">
            {isHindi
              ? 'सिग्नल, पॉइंट मशीन, पटरी, ब्रिज, कल्वर्ट और केबल ट्रफ का नक्शा हिंदी में बोलकर या लिखकर बनाएं।'
              : 'Draft cable routes along railway tracks with real-world bridges, culverts, and troughs in Hindi or English.'}
          </p>
        </div>

        {/* Route Specification Composer */}
        <section
          aria-label="Route specification input"
          className="bg-surface-card border border-line rounded-md shadow-sm overflow-hidden"
        >
          {/* Language Selector Strip */}
          <div className="px-4 py-2 bg-surface-subtle border-b border-line flex items-center justify-between text-xs">
            <span className="font-medium text-ink-secondary flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Voice &amp; Prompt Language:</span>
            </span>

            <div className="inline-flex rounded-sm p-0.5 bg-surface-card border border-line text-xs">
              <button
                type="button"
                onClick={() => onChangeVoiceLang('hi-IN')}
                className={`px-2.5 py-1 rounded-xs font-bold transition-colors ${
                  voiceLang === 'hi-IN'
                    ? 'bg-primary text-primary-ink shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => onChangeVoiceLang('en-IN')}
                className={`px-2.5 py-1 rounded-xs font-bold transition-colors ${
                  voiceLang === 'en-IN'
                    ? 'bg-primary text-primary-ink shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="p-4">
            <label
              htmlFor="route-prompt-input"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              {isHindi ? 'रूट का विवरण (बोलें या लिखें)' : 'Route Specification (Speak or Type)'}
            </label>
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
              className="w-full bg-surface-page border border-line rounded-sm p-3 text-sm text-ink-primary placeholder:text-ink-muted resize-none leading-relaxed focus:border-primary focus:bg-surface-card focus:outline-none"
            />

            {/* Listening Indicator */}
            {isListening && (
              <div className="mt-2.5 px-3 py-2 rounded-sm bg-status-error-bg/70 border border-status-error-border text-status-error text-xs font-semibold flex items-center gap-2 animate-pulse">
                <Radio className="w-4 h-4 shrink-0 animate-spin" />
                <span>
                  {isHindi
                    ? 'सुन रहे हैं... हिंदी में बोलिए: "सिग्नल S12 से पॉइंट मशीन P4 तक 800 मीटर केबल रूट..."'
                    : 'Listening... speak route details in English or Hindi...'}
                </span>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="mt-3 px-3 py-2.5 rounded-sm border border-status-error-border bg-status-error-bg text-status-error text-xs font-medium flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-line-subtle bg-surface-subtle flex flex-wrap items-center justify-between gap-2">
            <Button
              variant={isListening ? 'danger' : 'secondary'}
              size="sm"
              onClick={onToggleMic}
              aria-pressed={isListening}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? (isHindi ? 'रोकें (Stop)' : 'Stop') : (isHindi ? 'बोलकर बताएं (Mic)' : 'Voice Input')}</span>
            </Button>

            <Button
              variant="primary"
              onClick={onGenerate}
              disabled={!hasPrompt}
            >
              <span>{isHindi ? 'नक्शा बनाएं' : 'Generate Drawing'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Dimension Reconciliation Approval Card */}
        {dimensionProposal && (
          <div className="mt-4">
            <DimensionApprovalCard
              proposal={dimensionProposal}
              onApprove={onApproveDimensionProposal}
              onDismiss={onDismissDimensionProposal}
            />
          </div>
        )}

        {/* Quick Reference Examples */}
        <section className="mt-5" aria-label="Sample route specifications">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              {isHindi ? 'उदाहरण (क्लिक करके जांचें)' : 'Sample Specifications'}
            </h2>
            <span className="text-[11px] text-primary font-semibold">1-Click Insert</span>
          </div>

          <div className="divide-y divide-line-subtle border border-line rounded-md bg-surface-card overflow-hidden">
            {ROUTE_PROMPT_EXAMPLES.map((example) => {
              const textToUse = isHindi ? example.hi : example.en;
              const titleToUse = isHindi ? example.hindiLabel : example.label;
              return (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => onPromptChange(textToUse)}
                  className="w-full min-h-[48px] px-3.5 py-2.5 text-left hover:bg-surface-subtle active:bg-surface-active transition-colors duration-fast flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-ink-primary flex items-center gap-1.5">
                      <span>{titleToUse}</span>
                    </div>
                    <div className="text-xs text-ink-muted truncate mt-0.5">{textToUse}</div>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0 bg-primary-subtle px-2 py-0.5 rounded-sm">
                    {isHindi ? 'उपयोग करें' : 'Use'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="px-4 py-3 border-t border-line-subtle text-center">
        <p className="text-xs text-ink-muted">
          Offline-ready Indian Railways S&amp;T Drafting Tool · Designed by{' '}
          <span className="font-medium text-ink-primary">Yash</span>
        </p>
      </footer>
    </div>
  );
};

