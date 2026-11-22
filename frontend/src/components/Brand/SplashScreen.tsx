import React, { useEffect, useState } from 'react';
import { VandeBharatLogo } from './VandeBharatLogo';

interface SplashScreenProps {
  isDark?: boolean;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isDark = false, onFinish }) => {
  const [stage, setStage] = useState<'enter' | 'active' | 'exit'>('enter');

  useEffect(() => {
    // Stage 1: Entrance trigger
    const enterTimer = setTimeout(() => {
      setStage('active');
    }, 50);

    // Stage 2: Smooth Spotify-style exit trigger
    const exitTimer = setTimeout(() => {
      setStage('exit');
    }, 1550);

    // Stage 3: Complete & unmount
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1950);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      role="dialog"
      aria-label="App Launch Splash Screen"
      onClick={onFinish}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between py-10 px-6 select-none cursor-pointer overflow-hidden transition-all duration-500 ease-out ${
        stage === 'exit'
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: isDark
          ? 'radial-gradient(circle at 50% 42%, #121E2E 0%, #0A111A 75%, #05080D 100%)'
          : 'radial-gradient(circle at 50% 42%, #FFFFFF 0%, #F1F5F9 55%, #E2E8F0 100%)',
      }}
    >
      {/* Top Bar with Minimal Skip Action */}
      <div
        className={`w-full max-w-sm flex justify-between items-center text-xs transition-colors duration-300 ${
          isDark ? 'text-white/50' : 'text-slate-500'
        }`}
      >
        <div
          className={`flex items-center gap-1.5 font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-full ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white/70'
              : 'bg-slate-200/80 border border-slate-300/70 text-slate-700 font-medium'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>RDSO S&amp;T CAD</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFinish();
          }}
          className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-medium ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
              : 'bg-slate-200/90 hover:bg-slate-300 text-slate-800 border border-slate-300/70 shadow-xs'
          }`}
        >
          Skip &rarr;
        </button>
      </div>

      {/* Main Center Stage: Pulsing Insignia & Brand */}
      <div className="flex flex-col items-center text-center max-w-sm w-full relative my-auto">
        {/* Soft Ambient Radial Glow (Saffron & Emerald Halo) */}
        <div
          className="absolute -top-12 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-transform duration-1000"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(255,153,51,0.5) 0%, rgba(19,136,8,0.3) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,153,51,0.22) 0%, rgba(19,136,8,0.16) 50%, transparent 70%)',
            opacity: isDark ? 0.35 : 0.45,
            transform: stage === 'active' ? 'scale(1.15)' : 'scale(0.85)',
          }}
        />

        {/* Centered Logo with Spring Pop Scale */}
        <div
          className="relative mb-6 transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform:
              stage === 'enter'
                ? 'scale(0.75) translateY(16px)'
                : stage === 'exit'
                ? 'scale(1.08) translateY(-4px)'
                : 'scale(1.0) translateY(0px)',
            opacity: stage === 'enter' ? 0 : 1,
          }}
        >
          <div
            className={`p-4 rounded-3xl backdrop-blur-xl transition-all duration-300 ${
              isDark
                ? 'bg-white/[0.08] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
                : 'bg-white/95 border border-slate-200/90 shadow-[0_20px_45px_rgba(15,23,42,0.12)]'
            }`}
          >
            <VandeBharatLogo size={88} showFrame={true} />
          </div>

          {/* Glowing Kesari & Green Pulse Accent Beads */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FF9933] shadow-[0_0_12px_#FF9933] animate-pulse" />
          <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-[#138808] shadow-[0_0_12px_#138808]" />
        </div>

        {/* App Title */}
        <div
          className="transition-all duration-700 delay-100 ease-out"
          style={{
            transform: stage === 'enter' ? 'translateY(12px)' : 'translateY(0)',
            opacity: stage === 'enter' ? 0 : 1,
          }}
        >
          <h1
            className={`text-3xl font-extrabold tracking-tight transition-colors duration-300 ${
              isDark
                ? 'text-white drop-shadow-md'
                : 'text-slate-900 drop-shadow-xs'
            }`}
          >
            RailDraw{' '}
            <span
              className={
                isDark
                  ? 'font-light text-sky-300'
                  : 'font-bold text-sky-700'
              }
            >
              Signalling
            </span>
          </h1>

          {/* Hindi + English Subtitle */}
          <p
            className={`mt-1 text-sm tracking-wide transition-colors duration-300 ${
              isDark
                ? 'font-medium text-amber-300/90'
                : 'font-semibold text-amber-800'
            }`}
          >
            भारतीय रेल · Indian Railways S&amp;T CAD
          </p>
        </div>

        {/* Minimalist Audio/Rail Rhythm Bars */}
        <div
          className="mt-6 flex items-center justify-center gap-1.5 transition-all duration-700 delay-200"
          style={{
            opacity: stage === 'enter' ? 0 : 1,
          }}
        >
          <span
            className={`w-1 h-3 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] ${
              isDark ? 'bg-[#FF9933]' : 'bg-[#EA580C]'
            }`}
          />
          <span
            className={`w-1 h-5 rounded-full animate-[bounce_0.8s_ease-in-out_0.15s_infinite] ${
              isDark ? 'bg-white' : 'bg-slate-800'
            }`}
          />
          <span
            className={`w-1 h-7 rounded-full animate-[bounce_0.8s_ease-in-out_0.3s_infinite] ${
              isDark ? 'bg-sky-400' : 'bg-sky-600'
            }`}
          />
          <span
            className={`w-1 h-5 rounded-full animate-[bounce_0.8s_ease-in-out_0.45s_infinite] ${
              isDark ? 'bg-white' : 'bg-slate-800'
            }`}
          />
          <span
            className={`w-1 h-3 rounded-full animate-[bounce_0.8s_ease-in-out_0.6s_infinite] ${
              isDark ? 'bg-[#138808]' : 'bg-[#16A34A]'
            }`}
          />
        </div>

        {/* Sleek Tricolour Accent Line */}
        <div className="mt-4 w-36 h-1 rounded-full overflow-hidden flex shadow-lg shadow-black/20 opacity-85">
          <div className="h-full flex-1 bg-[#FF9933]" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>
      </div>

      {/* Footer Info */}
      <div
        className={`flex flex-col items-center text-center space-y-1 text-xs transition-colors duration-300 ${
          isDark ? 'text-white/40' : 'text-slate-500'
        }`}
      >
        <p className="text-[11px] tracking-wide">
          Designed for{' '}
          <span
            className={
              isDark
                ? 'text-white/70 font-medium'
                : 'text-slate-800 font-semibold'
            }
          >
            Indian Railways S&amp;T Engineers
          </span>
        </p>
      </div>
    </div>
  );
};