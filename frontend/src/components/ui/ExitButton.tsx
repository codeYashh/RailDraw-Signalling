import React, { useRef } from 'react';
import { LogOut, Power } from 'lucide-react';
import { closeApplication } from '../../services/androidBridge';

interface ExitButtonProps {
  className?: string;
  variant?: 'compact' | 'normal';
}

export const ExitButton: React.FC<ExitButtonProps> = ({
  className = '',
  variant = 'normal',
}) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (!touchStartRef.current) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;

    if (e.changedTouches.length > 0) {
      const endTouch = e.changedTouches[0];
      const dx = endTouch.clientX - start.x;
      const dy = endTouch.clientY - start.y;
      const dist = Math.hypot(dx, dy);

      // Swipe detected (moved more than 15px across/down/up)
      if (dist > 15) {
        e.preventDefault();
        e.stopPropagation();
        closeApplication();
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    closeApplication();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Exit and close application"
      title="Exit app (tap or swipe)"
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold text-xs transition-all duration-fast select-none cursor-pointer backdrop-blur-md active:scale-95 ${
        variant === 'compact'
          ? 'min-h-[38px] px-3 py-1 text-status-error bg-status-error-bg/40 hover:bg-status-error-bg/75 border border-status-error-border/60 shadow-xs'
          : 'min-h-[40px] px-3.5 py-1.5 text-status-error bg-status-error-bg/50 hover:bg-status-error-bg/90 border border-status-error-border shadow-xs'
      } ${className}`}
    >
      <Power className="w-4 h-4 shrink-0 text-status-error" />
      <span>Exit</span>
    </button>
  );
};
