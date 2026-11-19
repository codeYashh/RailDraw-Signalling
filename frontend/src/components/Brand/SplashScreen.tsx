import React, { useEffect, useState } from 'react';
import { VandeBharatLogo } from './VandeBharatLogo';
import { UI_LIMITS } from '../../constants/uiConstants';

interface SplashScreenProps {
  isDark: boolean;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isDark, onFinish }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsLeaving(true), UI_LIMITS.SPLASH_FADE_MS);
    const doneTimer = setTimeout(onFinish, UI_LIMITS.SPLASH_FINISH_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={[
        isDark ? 'theme-dark' : '',
        'fixed inset-0 z-[100] flex flex-col items-center justify-between py-12 px-6',
        'bg-surface-page text-ink-primary transition-opacity duration-base',
        isLeaving ? 'opacity-0 pointer-events-none' : 'opacity-100',
      ].join(' ')}
    >
      <div className="h-4" />

      <div className="flex flex-col items-center">
        <VandeBharatLogo size={72} />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink-primary">
          RailDraw
        </h1>
        <p className="mt-1 text-xs font-medium text-ink-muted">
          Indian Railways S&amp;T Cable Route CAD
        </p>
      </div>

      <p className="text-xs text-ink-muted">
        Designed by <span className="font-medium text-ink-primary">Yash</span>
      </p>
    </div>
  );
};
