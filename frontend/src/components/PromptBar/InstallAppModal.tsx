import React from 'react';
import { Info } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'hi' | 'en';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const appUrl =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5173/`
      : 'http://127.0.0.1:5173/';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'hi' ? 'फ़ोन पर RailDraw इंस्टॉल करें' : 'Install RailDraw on Android'}
      subtitle={
        lang === 'hi'
          ? 'क्रोम से सीधे होम स्क्रीन पर इंस्टॉल करने के चरण'
          : 'Install as a standalone offline app via Chrome'
      }
      maxWidthClass="max-w-md"
      footer={
        <div className="w-full flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            {lang === 'hi' ? 'बंद करें' : 'Close'}
          </Button>
        </div>
      }
    >
      <div className="p-5 space-y-4 text-sm text-ink-secondary">
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-sm bg-primary text-primary-ink text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink-primary">
                {lang === 'hi'
                  ? 'फ़ोन के Chrome ब्राउज़र में यह पता खोलें:'
                  : 'Open this address in Chrome on your phone:'}
              </p>
              <code className="mt-1.5 block text-xs bg-surface-subtle border border-line px-2.5 py-1.5 rounded-sm text-ink-primary font-mono select-all break-all">
                {appUrl}
              </code>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-sm bg-primary text-primary-ink text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <p className="font-medium text-ink-primary">
              {lang === 'hi'
                ? 'Chrome के ऊपर दाईं ओर मेनू आइकन पर टैप करें।'
                : 'Open the browser menu in the top-right corner of Chrome.'}
            </p>
          </li>

          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-sm bg-primary text-primary-ink text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <p className="font-medium text-ink-primary">
                {lang === 'hi'
                  ? '"Install app" या "Add to Home screen" चुनें।'
                  : 'Select "Install app" or "Add to Home screen".'}
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                {lang === 'hi'
                  ? 'ऐप ऑफ़लाइन उपयोग के लिए होम स्क्रीन पर जुड़ जाएगा।'
                  : 'RailDraw will launch full-screen and work offline.'}
              </p>
            </div>
          </li>
        </ol>

        <div className="p-3 rounded-sm bg-surface-subtle border border-line text-xs text-ink-secondary flex items-start gap-2.5">
          <Info className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            {lang === 'hi'
              ? 'आप सीधे हस्ताक्षरित APK फ़ाइल भी डाउनलोड कर सकते हैं यदि आप इसे ऑफ़लाइन साझा करना चाहते हैं।'
              : 'You can also download the signed APK file directly from the toolbar to distribute offline.'}
          </p>
        </div>
      </div>
    </Modal>
  );
};
