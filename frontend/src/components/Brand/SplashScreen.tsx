import React, { useEffect, useState, useCallback, useRef } from 'react';
import { VandeBharatLogo } from './VandeBharatLogo';

interface SplashScreenProps {
  isDark?: boolean;
  onFinish: () => void;
}

type SplashPhase = 'orb' | 'morph-in' | 'settled' | 'morph-out';

export const SplashScreen: React.FC<SplashScreenProps> = ({ isDark = false, onFinish }) => {
  const [phase, setPhase] = useState<SplashPhase>('orb');
  const finishedRef = useRef(false);

  const triggerExit = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('morph-out');
    window.setTimeout(() => {
      onFinish();
    }, 520);
  }, [onFinish]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('morph-in'), 40);
    const t2 = window.setTimeout(() => setPhase('settled'), 540);
    const t3 = window.setTimeout(() => triggerExit(), 1450);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [triggerExit]);

  const isVisible = phase === 'morph-in' || phase === 'settled';
  const isExiting = phase === 'morph-out';

  return (
    <div
      role="dialog"
      aria-label="App Launch Splash Screen"
      onClick={triggerExit}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between py-10 px-6 select-none cursor-pointer overflow-hidden"
      style={{
        background: isDark
          ? 'radial-gradient(circle at 50% 44%, #132238 0%, #09111C 68%, #04080E 100%)'
          : 'radial-gradient(circle at 50% 44%, #FFFFFF 0%, #F1F5F9 60%, #E2E8F0 100%)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.06)' : 'scale(1)',
        filter: isExiting ? 'blur(10px)' : 'blur(0px)',
        transition:
          'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 520ms cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      {/* Top Minimal Pill Bar */}
      <div
        className="w-full max-w-sm flex justify-between items-center text-xs"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 480ms ease-out 120ms, transform 480ms cubic-bezier(0.22, 1, 0.36, 1) 120ms',
        }}
      >
        <div
          className={`flex items-center gap-1.5 font-mono text-[11px] tracking-wider px-2.5 py-1 rounded-full ${
            isDark
              ? 'bg-white/[0.06] border border-white/10 text-white/75'
              : 'bg-slate-200/80 border border-slate-300/70 text-slate-700 font-medium'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>RDSO S&amp;T CAD</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerExit();
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white/75 hover:text-white'
              : 'bg-slate-200/90 hover:bg-slate-300 text-slate-800 border border-slate-300/70'
          }`}
        >
          Skip &rarr;
        </button>
      </div>

      {/* Center Stage: Logo-Only Liquid Morph */}
      <div className="flex flex-col items-center text-center max-w-sm w-full relative my-auto">
        {/* Ambient Aurora Halo */}
        <div
          className="absolute -top-14 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(56,189,248,0.34) 0%, rgba(249,115,22,0.20) 45%, transparent 72%)'
              : 'radial-gradient(circle, rgba(56,189,248,0.26) 0%, rgba(249,115,22,0.16) 45%, transparent 72%)',
            transform:
              phase === 'orb'
                ? 'scale(0.45)'
                : phase === 'settled'
                ? 'scale(1.12)'
                : phase === 'morph-out'
                ? 'scale(1.8)'
                : 'scale(0.95)',
            opacity: phase === 'orb' ? 0 : phase === 'morph-out' ? 0 : 0.9,
            transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease-out',
          }}
        />

        {/* Expanding Signal Ripple Ring */}
        <div
          className="absolute w-32 h-32 rounded-full pointer-events-none"
          style={{
            border: isDark ? '1.5px solid rgba(56,189,248,0.35)' : '1.5px solid rgba(14,116,144,0.28)',
            transform: phase === 'orb' ? 'scale(0.5)' : 'scale(1.85)',
            opacity: phase === 'morph-in' ? 0.75 : 0,
            transition: 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1), opacity 850ms ease-out',
          }}
        />

        {/* Morphing Logo Container (Circle Orb -> Squircle Insignia -> Smooth Zoom Dissolve) */}
        <div
          className="relative mb-7"
          style={{
            transform:
              phase === 'orb'
                ? 'scale(0.42)'
                : phase === 'morph-out'
                ? 'scale(1.32)'
                : 'scale(1)',
            opacity: phase === 'orb' ? 0.15 : phase === 'morph-out' ? 0 : 1,
            filter: phase === 'orb' ? 'blur(12px)' : 'blur(0px)',
            transition:
              'transform 680ms cubic-bezier(0.22, 1, 0.36, 1), opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 560ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div
            className={`relative p-3.5 overflow-hidden backdrop-blur-2xl ${
              isDark
                ? 'bg-white/[0.07] border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.65)]'
                : 'bg-white/95 border border-slate-200/90 shadow-[0_22px_50px_rgba(15,23,42,0.12)]'
            }`}
            style={{
              borderRadius: phase === 'orb' ? '999px' : '30px',
              transition: 'border-radius 680ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Silky Diagonal Liquid Sheen */}
            <div
              className="pointer-events-none absolute inset-0 -translate-x-full"
              style={{
                background:
                  'linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.28) 50%, transparent 75%)',
                transform: phase === 'settled' || phase === 'morph-out' ? 'translateX(130%)' : 'translateX(-130%)',
                transition: 'transform 750ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />

            <VandeBharatLogo size={92} showFrame={true} isAnimated={true} />
          </div>
        </div>

        {/* Smooth Blur-to-Sharp Brand Typography */}
        <div
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
            opacity: isVisible ? 1 : 0,
            filter: isVisible ? 'blur(0px)' : 'blur(6px)',
            transition:
              'transform 600ms cubic-bezier(0.22, 1, 0.36, 1) 140ms, opacity 520ms ease-out 140ms, filter 560ms ease-out 140ms',
          }}
        >
          <h1
            className={`text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            RailDraw{' '}
            <span className={isDark ? 'font-light text-sky-300' : 'font-bold text-sky-700'}>
              Signalling
            </span>
          </h1>

          <p
            className={`mt-1.5 text-sm tracking-wide ${
              isDark ? 'font-medium text-amber-300/90' : 'font-semibold text-amber-800'
            }`}
          >
            भारतीय रेल · Indian Railways S&amp;T CAD
          </p>
        </div>

        {/* Sleek Smooth Morph Progress Hairline (replaces old-school bouncing bars) */}
        <div
          className={`mt-6 w-36 h-[3px] rounded-full overflow-hidden ${
            isDark ? 'bg-white/10' : 'bg-slate-300/70'
          }`}
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 400ms ease-out 220ms',
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #F97316 0%, #38BDF8 50%, #16A34A 100%)',
              width: phase === 'orb' ? '12%' : phase === 'morph-in' ? '68%' : '100%',
              transition: 'width 1050ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div
        className={`flex flex-col items-center text-center text-xs ${
          isDark ? 'text-white/45' : 'text-slate-500'
        }`}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 500ms ease-out 220ms',
        }}
      >
        <p className="text-[11px] tracking-wide">
          Designed for{' '}
          <span className={isDark ? 'text-white/75 font-medium' : 'text-slate-800 font-semibold'}>
            Indian Railways S&amp;T Engineers
          </span>
        </p>
      </div>
    </div>
  );
};
