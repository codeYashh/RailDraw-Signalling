import React, { useState } from 'react';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  MapPin,
  Layers,
  FileCheck,
  Check,
  RotateCcw,
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
  const [activeTab, setActiveTab] = useState<'route' | 'trench' | 'stamp'>('route');

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
    coreCount: 6,
    conductorSize: '1.5 sq mm Copper',
    isArmoured: true,
    cableTag: 'MAIN-SIG',
    function: 'Signalling & Interlocking Circuits',
  };

  // Handlers for Route
  const handleUpdateStartNode = (val: string) => {
    onUpdateProject({
      ...project,
      startNode: {
        ...project.startNode,
        id: val.trim() || 'Start',
        name: val.trim() || 'Start Station',
      },
    });
  };

  const handleUpdateEndNode = (val: string) => {
    onUpdateProject({
      ...project,
      endNode: {
        ...project.endNode,
        id: val.trim() || 'End',
        name: val.trim() || 'End Station',
      },
    });
  };

  const handleUpdateTotalLength = (newLenStr: string) => {
    const newLen = parseFloat(newLenStr);
    if (isNaN(newLen) || newLen <= 0) return;

    // Distribute proportionally across existing segments
    if (totalLength > 0 && project.segments.length > 0) {
      const ratio = newLen / totalLength;
      const updatedSegments = project.segments.map((seg, idx) => {
        if (idx === project.segments.length - 1) {
          // Adjust last segment to absorb rounding
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
      // Single segment fallback
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

  const handleUpdateCableConductor = (conductorSize: string) => {
    const updatedCables = (project.cables.length > 0 ? project.cables : [primaryCable]).map(
      (c, idx) => (idx === 0 ? { ...c, conductorSize } : c)
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

  // Handlers for Title Block & Stamp
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
      className={`glass-panel rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="px-4 sm:px-5 py-3 border-b border-line/40 bg-surface-subtle/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-primary" />
          <h2 className="text-xs sm:text-sm font-bold text-ink-primary">
            Edit Details Written Down The Pic
          </h2>
          <span className="text-[11px] text-ink-muted hidden xs:inline">
            (Live changes on drawing)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 min-h-[36px] px-2.5 rounded-xl hover:bg-surface-hover/60 transition-colors"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Category Tabs */}
          <div className="flex items-center gap-2 border-b border-line/40 pb-2.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('route')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'route'
                  ? 'bg-primary text-primary-ink shadow-md shadow-primary/20'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle/80'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>1. Station &amp; Route</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('trench')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'trench'
                  ? 'bg-primary text-primary-ink shadow-md shadow-primary/20'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Trench &amp; Cable Specs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stamp')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'stamp'
                  ? 'bg-primary text-primary-ink shadow-md shadow-primary/20'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle/80'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>3. Title Block &amp; Stamp</span>
            </button>
          </div>

          {/* TAB 1: Station & Route */}
          {activeTab === 'route' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
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
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
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
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
                  Total Route Length (Metres)
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
          )}

          {/* TAB 2: Trench & Cable Specs */}
          {activeTab === 'trench' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
                  Trench Depth
                </label>
                <select
                  value={currentDepth}
                  onChange={(e) => handleUpdateTrenchDepth(parseFloat(e.target.value))}
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                >
                  <option value="1.0">1.0 m (Standard IRSEM)</option>
                  <option value="1.2">1.2 m (Track Crossings)</option>
                  <option value="1.5">1.5 m (Trenchless / HDD)</option>
                  <option value="0.8">0.8 m (Rocky Terrain)</option>
                  <option value="0.5">0.5 m (Surface / Trough)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
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
                  <option value="12">12 Core</option>
                  <option value="18">18 Core</option>
                  <option value="24">24 Core</option>
                  <option value="30">30 Core</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
                  Conductor Material
                </label>
                <select
                  value={primaryCable.conductorSize.includes('Aluminium') ? 'Aluminium' : 'Copper'}
                  onChange={(e) =>
                    handleUpdateCableConductor(
                      e.target.value === 'Aluminium' ? '2.5 sq mm Aluminium' : '1.5 sq mm Copper'
                    )
                  }
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                >
                  <option value="Copper">Copper (Signalling Standard)</option>
                  <option value="Aluminium">Aluminium (Power Feeder)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
                  Protective Layer
                </label>
                <input
                  type="text"
                  value={currentCover}
                  onChange={(e) => handleUpdateCover(e.target.value)}
                  placeholder="e.g. Class-II Brick"
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Title Block & Stamp */}
          {activeTab === 'stamp' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
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

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
                  Approved By
                </label>
                <input
                  type="text"
                  value={project.metadata.approvedBy || 'Sr. DSTE / S&T'}
                  onChange={(e) => handleUpdateMetadata('approvedBy', e.target.value)}
                  placeholder="e.g. DSTE / Sr. DSTE"
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
                  Checked By
                </label>
                <input
                  type="text"
                  value={project.metadata.checkedBy || 'ASTE / S&T'}
                  onChange={(e) => handleUpdateMetadata('checkedBy', e.target.value)}
                  placeholder="e.g. ASTE / S&T"
                  className="w-full min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium glass-input rounded-xl text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};
