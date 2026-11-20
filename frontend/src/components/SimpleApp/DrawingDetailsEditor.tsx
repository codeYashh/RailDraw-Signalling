import React, { useState } from 'react';
import {
  Pencil,
  ChevronDown,
  ChevronUp,
  MapPin,
  Layers,
  FileCheck,
  Sparkles,
  Info,
  Check,
  FileText,
} from 'lucide-react';
import { DrawingProject } from '../../types/drawing';

interface DrawingDetailsEditorProps {
  project: DrawingProject;
  onUpdateProject: (updated: DrawingProject) => void;
  className?: string;
}

export const DrawingDetailsEditor: React.FC<DrawingDetailsEditorProps> = ({
  project,
  onUpdateProject,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Compute total length from segments
  const totalLength = project.segments.reduce(
    (acc, s) => acc + (Number(s.length) || 0),
    0
  );

  // Find primary depth and cover from first trenching segment
  const primarySegment =
    project.segments.find((s) => s.layingMethod === 'Normal Trenching') ||
    project.segments[0];

  const currentDepth = primarySegment?.depth ?? 1.0;
  const currentCover = primarySegment?.coverType || 'Class-II Brick with sand bedding';

  // Primary cable
  const primaryCable = project.cables[0] || {
    id: 'C-01',
    cableType: 'Signalling' as const,
    count: 1,
    coreCount: 12,
    conductorSize: '1.5 sq mm Copper',
    isArmoured: true,
    cableTag: 'MAIN-SIG',
    function: 'Signalling & Interlocking Circuits',
  };

  // User notes text derived from customNotes or empty string
  const customNotesText = (project.settings?.customNotes || []).join('\n');

  // Handle free-text notes update
  const handleUpdateNotes = (text: string) => {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    onUpdateProject({
      ...project,
      settings: {
        ...project.settings,
        customNotes: lines,
      },
    });
  };

  const handleAppendQuickNote = (phrase: string) => {
    const currentNotes = project.settings?.customNotes || [];
    if (!currentNotes.includes(phrase)) {
      onUpdateProject({
        ...project,
        settings: {
          ...project.settings,
          customNotes: [...currentNotes, phrase],
        },
      });
    }
  };

  // Handlers for Route
  const handleUpdateStartNode = (val: string) => {
    const name = val || 'Start';
    onUpdateProject({
      ...project,
      startNode: {
        ...project.startNode,
        id: name,
        name: name,
      },
    });
  };

  const handleUpdateEndNode = (val: string) => {
    const name = val || 'End';
    onUpdateProject({
      ...project,
      endNode: {
        ...project.endNode,
        id: name,
        name: name,
      },
    });
  };

  const handleUpdateTotalLength = (newLenStr: string) => {
    const newLen = parseFloat(newLenStr);
    if (isNaN(newLen) || newLen <= 0) return;

    if (totalLength > 0 && project.segments.length > 0) {
      const ratio = newLen / totalLength;
      const updatedSegments = project.segments.map((seg, idx) => {
        if (idx === project.segments.length - 1) {
          const sumPrior = project.segments
            .slice(0, -1)
            .reduce((acc, s) => acc + Math.round(s.length * ratio * 10) / 10, 0);
          return {
            ...seg,
            length: Math.max(1, Math.round((newLen - sumPrior) * 10) / 10),
          };
        }
        return {
          ...seg,
          length: Math.max(1, Math.round(seg.length * ratio * 10) / 10),
        };
      });

      onUpdateProject({
        ...project,
        segments: updatedSegments,
        endNode: {
          ...project.endNode,
          chainageKm: (project.startNode.chainageKm || 0) + newLen / 1000,
        },
      });
    } else {
      onUpdateProject({
        ...project,
        segments: [
          {
            id: 'seg-1',
            length: newLen,
            layingMethod: 'Normal Trenching',
            depth: currentDepth,
            coverType: currentCover,
          },
        ],
      });
    }
  };

  // Handlers for Trench & Cable
  const handleUpdateTrenchDepth = (depthVal: number) => {
    const updatedSegments = project.segments.map((s) => ({
      ...s,
      depth: depthVal,
    }));
    onUpdateProject({
      ...project,
      segments: updatedSegments,
    });
  };

  const handleUpdateCableCores = (cores: number) => {
    const updatedCables = (project.cables.length > 0 ? project.cables : [primaryCable]).map(
      (c, idx) => (idx === 0 ? { ...c, coreCount: cores } : c)
    );
    onUpdateProject({
      ...project,
      cables: updatedCables,
    });
  };

  const handleUpdateCover = (cover: string) => {
    const updatedSegments = project.segments.map((s) => ({
      ...s,
      coverType: cover,
    }));
    onUpdateProject({
      ...project,
      segments: updatedSegments,
    });
  };

  // Handlers for Title Block
  const handleUpdateMetadata = (key: keyof typeof project.metadata, value: string) => {
    onUpdateProject({
      ...project,
      metadata: {
        ...project.metadata,
        [key]: value,
      },
    });
  };

  return (
    <div
      className={`glass-panel rounded-2xl sm:rounded-3xl shadow-lg border border-line/60 overflow-hidden transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="px-4 sm:px-5 py-3 border-b border-line/40 bg-surface-subtle/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Pencil className="w-4 h-4 text-primary" />
          <h2 className="text-xs sm:text-sm font-bold text-ink-primary">
            Details Written Down The Pic
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live drawing sync
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 min-h-[36px] px-2.5 rounded-xl hover:bg-surface-hover/60 transition-colors"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide Details' : 'Edit Details'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* SECTION 1: FREELY WRITE NOTES / DESCRIPTION IN DETAILS BOX */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-subtle/60 border border-line/60 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="drawing-notes-textarea"
                className="text-xs font-bold text-ink-primary flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Write Notes &amp; Description (Shows live on drawing):</span>
              </label>
              <span className="text-[11px] text-ink-muted">
                1 note per line
              </span>
            </div>

            <textarea
              id="drawing-notes-textarea"
              rows={3}
              value={customNotesText}
              onChange={(e) => handleUpdateNotes(e.target.value)}
              placeholder="Write anything here... e.g.&#10;Cable laid 2.5m from track centre&#10;All track crossings in 150mm NP2 RCC pipe&#10;RDSO/SPN/TC/72/2007 compliant armoured cable"
              className="w-full glass-input rounded-xl p-3 text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all resize-none font-medium"
            />

            {/* Quick helper suggestion chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-ink-muted">Quick add:</span>
              <button
                type="button"
                onClick={() => handleAppendQuickNote('Cable route offset: 2.5m from track centre')}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-line text-ink-secondary hover:text-ink-primary transition-all font-medium"
              >
                + 2.5m track offset
              </button>
              <button
                type="button"
                onClick={() => handleAppendQuickNote('Track crossings in 150mm RCC NP2 pipe')}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-line text-ink-secondary hover:text-ink-primary transition-all font-medium"
              >
                + RCC track crossing
              </button>
              <button
                type="button"
                onClick={() => handleAppendQuickNote('Cable Route Markers installed every 50m')}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-line text-ink-secondary hover:text-ink-primary transition-all font-medium"
              >
                + Markers every 50m
              </button>
              <button
                type="button"
                onClick={() => handleAppendQuickNote('Work to be executed under S&T supervision')}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-line text-ink-secondary hover:text-ink-primary transition-all font-medium"
              >
                + S&T supervision
              </button>
            </div>
          </div>

          {/* SECTION 2: ROUTE STATIONS & LENGTH */}
          <div>
            <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Route &amp; Stations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  From (Start Station / Point)
                </label>
                <input
                  type="text"
                  value={project.startNode.id}
                  onChange={(e) => handleUpdateStartNode(e.target.value)}
                  placeholder="e.g. Signal S12"
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  To (End Station / Point)
                </label>
                <input
                  type="text"
                  value={project.endNode.id}
                  onChange={(e) => handleUpdateEndNode(e.target.value)}
                  placeholder="e.g. Point Machine P4"
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Total Route Length (m)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step="1"
                    value={totalLength}
                    onChange={(e) => handleUpdateTotalLength(e.target.value)}
                    className="w-full min-h-[40px] px-3.5 py-1.5 pr-8 text-xs sm:text-sm font-bold glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-ink-muted">
                    m
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: CABLE & TRENCH SPECIFICATIONS */}
          <div>
            <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Cable &amp; Trench Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Cable Cores
                </label>
                <select
                  value={primaryCable.coreCount}
                  onChange={(e) => handleUpdateCableCores(parseInt(e.target.value, 10))}
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                >
                  <option value="2">2 Core</option>
                  <option value="4">4 Core</option>
                  <option value="6">6 Core</option>
                  <option value="8">8 Core</option>
                  <option value="12">12 Core (Standard Signalling)</option>
                  <option value="18">18 Core</option>
                  <option value="24">24 Core</option>
                  <option value="30">30 Core</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Trench Depth
                </label>
                <select
                  value={currentDepth}
                  onChange={(e) => handleUpdateTrenchDepth(parseFloat(e.target.value))}
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                >
                  <option value="1.0">1.0 m (Standard Normal Trenching)</option>
                  <option value="1.2">1.2 m (Track Crossings)</option>
                  <option value="1.5">1.5 m (Trenchless / HDD)</option>
                  <option value="0.8">0.8 m (Rocky Ground)</option>
                  <option value="0.5">0.5 m (Surface / Trough)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Protective Layer
                </label>
                <input
                  type="text"
                  value={currentCover}
                  onChange={(e) => handleUpdateCover(e.target.value)}
                  placeholder="e.g. Class-II Brick with sand"
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DRAWN & APPROVED BY */}
          <div>
            <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-primary" />
              <span>Title Block &amp; Signatures</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Drawn By
                </label>
                <input
                  type="text"
                  value={project.metadata.preparedBy || 'SSE / SIG / DESIGN'}
                  onChange={(e) => handleUpdateMetadata('preparedBy', e.target.value)}
                  placeholder="e.g. SSE / SIG / DESIGN"
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Approved By
                </label>
                <input
                  type="text"
                  value={project.metadata.approvedBy || 'Sr. DSTE / S&T'}
                  onChange={(e) => handleUpdateMetadata('approvedBy', e.target.value)}
                  placeholder="e.g. Sr. DSTE / S&T"
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Railway Zone / Division
                </label>
                <input
                  type="text"
                  value={project.metadata.railwayZone || 'Northern Railway'}
                  onChange={(e) => handleUpdateMetadata('railwayZone', e.target.value)}
                  placeholder="e.g. Northern Railway"
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
