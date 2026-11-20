import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  ArrowRight,
  Image as ImageIcon,
  BookmarkPlus,
  FolderOpen,
  Smartphone,
  Download,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DrawingProject } from '../../types/drawing';
import { parseNaturalLanguagePrompt, DimensionProposal } from '../../services/promptParser';
import { ROUTE_PROMPT_EXAMPLES } from '../../constants/uiConstants';
import { Button } from '../ui/Button';
import { DimensionApprovalCard } from '../ui/DimensionApprovalCard';
import { InstallAppModal } from './InstallAppModal';

interface PromptBarProps {
  currentProject: DrawingProject;
  onApplyProject: (project: DrawingProject) => void;
  onDownloadPhoto: () => void;
  onSaveToGallery: () => void;
  onOpenGallery: () => void;
  savedCount: number;
}

export const PromptBar: React.FC<PromptBarProps> = ({
  currentProject,
  onApplyProject,
  onDownloadPhoto,
  onSaveToGallery,
  onOpenGallery,
  savedCount,
}) => {
  const [lang, setLang] = useState<'hi' | 'en'>('en');
  const [promptText, setPromptText] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dimensionProposal, setDimensionProposal] = useState<DimensionProposal | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const handleGenerateRef = useRef<(text?: string) => void>(() => {});
  const speechSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPromptText(transcript);
        setIsListening(false);
        handleGenerateRef.current(transcript);
      };

      recog.onerror = () => {
        setIsListening(false);
        setErrorMsg(
          lang === 'hi'
            ? 'माइक्रोफ़ोन इनपुट विफल रहा। कृपया टेक्स्ट बॉक्स में टाइप करें।'
            : 'Voice input failed. Enter your route specification manually.'
        );
      };

      recog.onend = () => setIsListening(false);
      recognitionRef.current = recog;
    }
  }, [lang]);

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setFeedbackMsg(
            lang === 'hi' ? 'ऐप सफलतापूर्वक इंस्टॉल हो गया।' : 'RailDraw installed successfully.'
          );
        }
        setInstallPrompt(null);
      } catch {
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const toggleVoice = () => {
    if (!speechSupported) {
      setErrorMsg(
        lang === 'hi'
          ? 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया बॉक्स में टाइप करें।'
          : 'Voice recognition is not supported in this browser. Type your route details instead.'
      );
      return;
    }

    setErrorMsg(null);
    const recog = recognitionRef.current;
    if (isListening) {
      recog?.stop();
      setIsListening(false);
    } else {
      try {
        if (recog) {
          recog.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
          recog.start();
          setIsListening(true);
          if (navigator.vibrate) navigator.vibrate(40);
        }
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleGenerate = (customText?: string) => {
    const textToParse = (customText ?? promptText).trim();
    if (!textToParse) {
      setErrorMsg(
        lang === 'hi'
          ? 'कृपया केबल रूट का विवरण दर्ज करें।'
          : 'Enter a cable route specification before generating.'
      );
      return;
    }

    const { project, summary, hindiSummary, error, dimensionProposal: proposal } =
      parseNaturalLanguagePrompt(textToParse, currentProject);

    if (error) {
      setErrorMsg(error);
      setDimensionProposal(null);
      setFeedbackMsg(null);
      return;
    }

    if (proposal) {
      setErrorMsg(null);
      setFeedbackMsg(null);
      setDimensionProposal(proposal);
      return;
    }

    setErrorMsg(null);
    setDimensionProposal(null);
    onApplyProject(project);
    setFeedbackMsg(
      lang === 'hi' ? `ड्राइंग तैयार है: ${hindiSummary}` : `Drawing updated: ${summary}`
    );

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        lang === 'hi' ? 'ड्राइंग तैयार है' : 'Drawing updated'
      );
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    handleGenerateRef.current = handleGenerate;
  });

  const switchLanguage = (nextLang: 'en' | 'hi') => {
    setLang(nextLang);
    setErrorMsg(null);
  };

  return (
    <section
      aria-label="Prompt route generator"
      className="bg-surface-card rounded-md shadow-sm border border-line p-4 space-y-3 mb-4"
    >
      {/* Top Row: Language Switch + Install Links */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line-subtle">
        <div
          className="inline-flex items-center p-0.5 rounded-sm bg-surface-subtle border border-line"
          role="group"
          aria-label="Prompt language"
        >
          <button
            type="button"
            onClick={() => switchLanguage('en')}
            className={`min-h-[36px] px-3 rounded-sm text-xs font-medium transition-colors duration-fast ${
              lang === 'en'
                ? 'bg-primary text-primary-ink'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => switchLanguage('hi')}
            className={`min-h-[36px] px-3 rounded-sm text-xs font-medium transition-colors duration-fast ${
              lang === 'hi'
                ? 'bg-primary text-primary-ink'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            हिंदी
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/raildraw-signalling.apk"
            download="raildraw-signalling.apk"
            className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-medium rounded-sm border border-line bg-surface-card text-ink-primary hover:bg-surface-hover active:bg-surface-active transition-colors duration-fast"
          >
            <Download className="w-4 h-4 text-ink-secondary" />
            <span>{lang === 'hi' ? 'APK डाउनलोड करें' : 'Download APK'}</span>
          </a>

          <Button variant="secondary" size="sm" onClick={handleInstallClick}>
            <Smartphone className="w-4 h-4 text-ink-secondary" />
            <span>{lang === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
          </Button>
        </div>
      </div>

      {/* Specification Textarea */}
      <div>
        <label
          htmlFor="workbench-prompt-input"
          className="block text-xs font-medium text-ink-secondary mb-1.5"
        >
          {lang === 'hi' ? 'केबल रूट विवरण' : 'Cable Route Specification'}
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            id="workbench-prompt-input"
            rows={2}
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              setErrorMsg(null);
              setDimensionProposal(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="Type.."
            className="flex-1 text-sm bg-surface-page border border-line hover:border-line-strong focus:border-primary focus:bg-surface-card rounded-sm p-3 text-ink-primary placeholder:text-ink-muted focus:outline-none resize-none leading-relaxed"
          />

          <Button
            variant={isListening ? 'danger' : 'secondary'}
            onClick={toggleVoice}
            aria-pressed={isListening}
            className="sm:self-stretch shrink-0"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>
              {isListening
                ? lang === 'hi'
                  ? 'सुन रहा हूँ...'
                  : 'Stop'
                : lang === 'hi'
                ? 'बोलकर लिखें'
                : 'Voice'}
            </span>
          </Button>
        </div>
      </div>

      {/* Sample Quick Picks */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        <span className="text-xs font-medium text-ink-muted shrink-0">
          {lang === 'hi' ? 'उदाहरण:' : 'Samples:'}
        </span>
        {ROUTE_PROMPT_EXAMPLES.map((item) => {
          const text = lang === 'hi' ? item.hi : item.en;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPromptText(text);
                handleGenerate(text);
              }}
              className="min-h-[36px] px-3 py-1 bg-surface-subtle hover:bg-surface-hover active:bg-surface-active text-ink-secondary hover:text-ink-primary rounded-sm text-xs font-medium whitespace-nowrap border border-line transition-colors duration-fast"
            >
              {lang === 'hi' ? item.hindiLabel : item.label}
            </button>
          );
        })}
      </div>

      {/* Action Bar: Single Clear Primary Action + Secondary Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onDownloadPhoto}>
            <ImageIcon className="w-4 h-4 text-ink-secondary" />
            <span>{lang === 'hi' ? 'PNG डाउनलोड करें' : 'Download PNG'}</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={onSaveToGallery}>
            <BookmarkPlus className="w-4 h-4 text-ink-secondary" />
            <span>{lang === 'hi' ? 'डिवाइस में सहेजें' : 'Save to Device'}</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={onOpenGallery}>
            <FolderOpen className="w-4 h-4 text-ink-secondary" />
            <span>{lang === 'hi' ? 'सहेजी गई ड्राइंग' : 'Saved Drawings'}</span>
            <span className="ml-0.5 px-1.5 py-0.5 bg-surface-subtle border border-line rounded-sm text-xs font-semibold tabular-nums leading-none">
              {savedCount}
            </span>
          </Button>
        </div>

        <Button
          variant="primary"
          onClick={() => handleGenerate()}
          disabled={!promptText.trim()}
          className="w-full sm:w-auto"
        >
          <span>{lang === 'hi' ? 'ड्राइंग बनाएँ' : 'Generate Drawing'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {dimensionProposal && (
        <DimensionApprovalCard
          proposal={dimensionProposal}
          onApprove={(approvedProject, label) => {
            setDimensionProposal(null);
            setErrorMsg(null);
            onApplyProject(approvedProject);
            setFeedbackMsg(label);
          }}
          onDismiss={() => setDimensionProposal(null)}
        />
      )}

      {errorMsg && (
        <div
          role="alert"
          className="text-xs text-status-error bg-status-error-bg border border-status-error-border px-3 py-2 rounded-sm flex items-center gap-2 font-medium"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {feedbackMsg && !errorMsg && (
        <div
          role="status"
          className="text-xs text-status-success bg-status-success-bg border border-status-success-border px-3 py-2 rounded-sm flex items-center gap-2 font-medium"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        lang={lang}
      />
    </section>
  );
};
