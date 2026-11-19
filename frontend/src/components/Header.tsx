import React from 'react';
import {
  ShieldCheck,
  BookOpen,
  Layers,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { UserRole, DrawingProject } from '../types/drawing';
import { SAMPLE_PROJECT_REFERENCE, SAMPLE_PROJECT_YARD } from '../constants/railwayData';
import { VandeBharatLogo } from './Brand/VandeBharatLogo';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLoadPreset: (project: DrawingProject) => void;
  onOpenSymbolManager: () => void;
  onOpenRulePack: () => void;
  onSwitchToSimple?: () => void;
  isBackendOnline: boolean;
  isCheckingHealth: boolean;
  onRetryHealth: () => void;
  unverifiedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onLoadPreset,
  onOpenSymbolManager,
  onOpenRulePack,
  onSwitchToSimple,
  isBackendOnline,
  isCheckingHealth,
  onRetryHealth,
  unverifiedCount,
}) => {
  return (
    <header className="bg-chrome-bar text-chrome-ink border-b border-chrome-border sticky top-0 z-40">
      <div className="max-w-[1680px] mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <VandeBharatLogo size={36} className="shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-chrome-ink truncate">
                RailDraw Workbench
              </h1>
              <span className="text-xs font-medium text-chrome-muted border border-white/15 px-2 py-0.5 rounded-sm">
                IRSEM S&amp;T
              </span>
            </div>
            <p className="text-xs text-chrome-muted truncate hidden sm:block">
              Indian Railways Signalling Cable Route Drafting
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="hidden xl:flex items-center gap-1.5 border border-white/15 rounded-sm p-1">
          <span className="text-xs font-medium text-chrome-muted px-2">Samples:</span>
          <button
            type="button"
            onClick={() => onLoadPreset(SAMPLE_PROJECT_REFERENCE)}
            className="min-h-[36px] px-2.5 text-xs font-medium text-chrome-ink hover:bg-white/10 active:bg-white/15 rounded-sm transition-colors duration-fast"
            title="L1 to L12 (500 m: 20 m HDD, 50 m GI pipe, 430 m normal trenching)"
          >
            L1–L12 (500 m)
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset(SAMPLE_PROJECT_YARD)}
            className="min-h-[36px] px-2.5 text-xs font-medium text-chrome-ink hover:bg-white/10 active:bg-white/15 rounded-sm transition-colors duration-fast"
            title="Station Relay Hut to LC Gate 34 (1200 m)"
          >
            Yard to LC-34 (1200 m)
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSwitchToSimple && (
            <button
              type="button"
              onClick={onSwitchToSimple}
              className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-medium text-chrome-ink hover:bg-white/10 active:bg-white/15 rounded-sm border border-white/15 transition-colors duration-fast"
              title="Switch to mobile quick drafter"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Quick Mode</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSymbolManager}
            className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-medium text-chrome-ink hover:bg-white/10 active:bg-white/15 rounded-sm border border-white/15 transition-colors duration-fast"
          >
            <Layers className="w-4 h-4" />
            <span>Symbols</span>
            {unverifiedCount > 0 && (
              <span className="ml-0.5 text-xs font-semibold bg-accent-solid text-white px-1.5 py-0.5 rounded-sm tabular-nums leading-none">
                {unverifiedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenRulePack}
            className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-medium text-chrome-ink hover:bg-white/10 active:bg-white/15 rounded-sm border border-white/15 transition-colors duration-fast"
          >
            <BookOpen className="w-4 h-4" />
            <span>IRSEM Rules</span>
          </button>

          <label className="min-h-[44px] px-2.5 inline-flex items-center gap-1.5 rounded-sm border border-white/15 bg-white/5">
            <ShieldCheck className="w-4 h-4 text-chrome-muted shrink-0" aria-hidden="true" />
            <span className="sr-only">User role</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs font-medium text-chrome-ink focus:outline-none cursor-pointer min-h-[36px]"
            >
              <option value="Admin" className="bg-chrome-bar text-chrome-ink">
                Admin
              </option>
              <option value="Engineer" className="bg-chrome-bar text-chrome-ink">
                Engineer
              </option>
              <option value="Reviewer" className="bg-chrome-bar text-chrome-ink">
                Reviewer
              </option>
            </select>
          </label>

          <button
            type="button"
            onClick={onRetryHealth}
            disabled={isCheckingHealth}
            className="min-h-[44px] px-2.5 inline-flex items-center gap-1.5 text-xs rounded-sm border border-white/15 bg-white/5 hover:bg-white/10 text-chrome-ink disabled:opacity-50 transition-colors duration-fast"
            title={
              isBackendOnline
                ? 'Connected to local Python DXF server (click to recheck)'
                : 'Offline client CAD mode (click to retry local DXF server)'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendOnline ? 'bg-status-success' : 'bg-accent-solid'
              }`}
              aria-hidden="true"
            />
            <span className="font-medium">
              {isBackendOnline ? 'DXF Server' : 'Offline CAD'}
            </span>
            {!isBackendOnline && (
              <RefreshCw
                className={`w-3.5 h-3.5 text-chrome-muted ${isCheckingHealth ? 'animate-spin' : ''}`}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
