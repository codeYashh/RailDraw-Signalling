import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Sliders, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { DrawingProject, LayingMethod, RouteSegment, CableDetail } from '../../types/drawing';
import { Button } from '../ui/Button';

interface DrawingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DrawingProject;
  onSave: (updatedProject: DrawingProject) => void;
  initialTab?: 'route' | 'segments' | 'cable' | 'titleBlock';
}

const LAYING_METHODS: LayingMethod[] = [
  'Along Bridge',
  'Culvert crossing',
  'Cable Trough',
  'Normal Trenching',
  'Track crossing',
  'Road crossing',
  'GI Pipe',
  'RCC Pipe',
  'HDPE Pipe',
  'Trenchless-HDD',
  'Cable Tray',
];

const NODE_TYPES = [
  { value: 'cls_4aspect', label: 'Color Light Signal (4-Aspect)' },
  { value: 'cls_3aspect', label: 'Color Light Signal (3-Aspect)' },
  { value: 'point_machine', label: 'Point Machine' },
  { value: 'signal_cabin', label: 'Signal Cabin / Relay Hut' },
  { value: 'location_box_single', label: 'Location Box (Apparatus Case)' },
  { value: 'lc_gate', label: 'Level Crossing Gate' },
];

export const DrawingInfoModal: React.FC<DrawingInfoModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
  initialTab = 'route',
}) => {
  const [activeTab, setActiveTab] = useState<'route' | 'segments' | 'cable' | 'titleBlock'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Form State - Always declared unconditionally
  const [startId, setStartId] = useState(project.startNode.id);
  const [startType, setStartType] = useState(project.startNode.type || 'cls_4aspect');
  const [endId, setEndId] = useState(project.endNode.id);
  const [endType, setEndType] = useState(project.endNode.type || 'point_machine');

  const [segments, setSegments] = useState<RouteSegment[]>(() =>
    JSON.parse(JSON.stringify(project.segments))
  );

  const initialCable = project.cables?.[0] || {
    id: 'cab-1',
    cableType: 'Signalling',
    count: 3,
    coreCount: 4,
    conductorSize: '1.5 sq mm',
    isArmoured: true,
    cableTag: 'SIG',
    function: 'Signalling',
  };

  const [cableCount, setCableCount] = useState<number>(initialCable.count || 3);
  const [cableCore, setCableCore] = useState<number>(initialCable.coreCount || 4);
  const [cableType, setCableType] = useState<CableDetail['cableType']>(
    (initialCable.cableType as any) || 'Signalling'
  );
  const [conductorSize, setConductorSize] = useState<string>(
    initialCable.conductorSize || '1.5 sq mm Armoured Railway Cable'
  );

  const [trenchDepth, setTrenchDepth] = useState<number>(
    project.segments.find((s) => s.depth > 0)?.depth ?? 1.0
  );
  const [protectionCover, setProtectionCover] = useState<string>(
    project.segments[0]?.coverType || 'Perforated GI Cable Tray'
  );

  // Metadata / Title block
  const [railwayZone, setRailwayZone] = useState(project.metadata.railwayZone || 'INDIAN RAILWAYS');
  const [division, setDivision] = useState(project.metadata.division || 'S&T Division');
  const [drawingNumber, setDrawingNumber] = useState(
    project.metadata.drawingNumber || 'IR/S&T/SIGNAL-POINTM/2026/21'
  );
  const [revision, setRevision] = useState(project.metadata.revision || 'R0');
  const [date, setDate] = useState(project.metadata.date || '18-11-2026');
  const [drawnBy, setDrawnBy] = useState(project.metadata.preparedByDesig || 'SSE / SIG / DESIGN');
  const [checkedBy, setCheckedBy] = useState(project.metadata.checkedByDesig || 'ASTE / S&T');
  const [approvedBy, setApprovedBy] = useState(project.metadata.approvedByDesig || 'DSTE / SR. DSTE');

  const [note1, setNote1] = useState(
    project.settings.customNotes?.[0] || 'Cable Route Markers (C.M.) installed every 50 m & track bends.'
  );
  const [note2, setNote2] = useState(
    project.settings.customNotes?.[1] || 'Minimum bending radius of cable shall not be less than 15D.'
  );

  // Re-sync form state when modal opens or project updates
  React.useEffect(() => {
    if (!isOpen) return;
    setStartId(project.startNode.id);
    setStartType(project.startNode.type || 'cls_4aspect');
    setEndId(project.endNode.id);
    setEndType(project.endNode.type || 'point_machine');
    setSegments(JSON.parse(JSON.stringify(project.segments)));

    const cab = project.cables?.[0] || {
      id: 'cab-1',
      cableType: 'Signalling',
      count: 3,
      coreCount: 4,
      conductorSize: '1.5 sq mm Armoured Railway Cable',
      isArmoured: true,
      cableTag: 'SIG',
      function: 'Signalling',
    };
    setCableCount(cab.count || 3);
    setCableCore(cab.coreCount || 4);
    setCableType((cab.cableType as any) || 'Signalling');
    setConductorSize(cab.conductorSize || '1.5 sq mm Armoured Railway Cable');
    setTrenchDepth(project.segments.find((s) => s.depth > 0)?.depth ?? 1.0);
    setProtectionCover(project.segments[0]?.coverType || 'Perforated GI Cable Tray');

    setRailwayZone(project.metadata.railwayZone || 'INDIAN RAILWAYS');
    setDivision(project.metadata.division || 'S&T Division');
    setDrawingNumber(project.metadata.drawingNumber || 'IR/S&T/SIGNAL-POINTM/2026/21');
    setRevision(project.metadata.revision || 'R0');
    setDate(project.metadata.date || '18-11-2026');
    setDrawnBy(project.metadata.preparedByDesig || 'SSE / SIG / DESIGN');
    setCheckedBy(project.metadata.checkedByDesig || 'ASTE / S&T');
    setApprovedBy(project.metadata.approvedByDesig || 'DSTE / SR. DSTE');
    setNote1(project.settings.customNotes?.[0] || 'Cable Route Markers (C.M.) installed every 50 m & track bends.');
    setNote2(project.settings.customNotes?.[1] || 'Minimum bending radius of cable shall not be less than 15D.');
  }, [isOpen, project]);

  // Segment helpers
  const handleSegmentChange = (index: number, field: keyof RouteSegment, value: any) => {
    setSegments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddSegment = () => {
    const newSeg: RouteSegment = {
      id: `seg-${Date.now()}-${segments.length + 1}`,
      length: 100,
      layingMethod: 'Cable Trough',
      depth: 0.6,
      coverType: 'Precast RCC Cable Trough',
      remarks: 'Added segment',
    };
    setSegments((prev) => [...prev, newSeg]);
  };

  const handleDeleteSegment = (index: number) => {
    if (segments.length <= 1) return;
    setSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const totalLength = segments.reduce((sum, s) => sum + (Number(s.length) || 0), 0);

  const handleSave = () => {
    const updatedProject: DrawingProject = {
      ...project,
      startNode: {
        ...project.startNode,
        id: startId.trim().toUpperCase(),
        name: startId.trim().toUpperCase(),
        type: startType,
      },
      endNode: {
        ...project.endNode,
        id: endId.trim().toUpperCase(),
        name: endId.trim().toUpperCase(),
        type: endType,
      },
      segments: segments.map((s, idx) => ({
        ...s,
        length: Math.max(1, Number(s.length) || 10),
        remarks: `Segment ${idx + 1} (${s.layingMethod})`,
      })),
      cables: [
        {
          ...initialCable,
          count: cableCount,
          coreCount: cableCore,
          cableType,
          conductorSize,
        },
      ],
      metadata: {
        ...project.metadata,
        railwayZone,
        division,
        drawingNumber,
        revision,
        date,
        preparedByDesig: drawnBy,
        checkedByDesig: checkedBy,
        approvedByDesig: approvedBy,
      },
      settings: {
        ...project.settings,
        customNotes: [note1, note2],
      },
      name: `${startId} to ${endId} (${totalLength}m)`,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-surface-card border border-line rounded-lg shadow-xl flex flex-col overflow-hidden text-ink-primary"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-line flex items-center justify-between bg-surface-subtle">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-ink-primary flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <span>Edit Drawing Information &amp; Specs</span>
            </h2>
            <p className="text-xs text-ink-muted">
              Modify written text, segment lengths, cables, and engineering block details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-hover active:bg-surface-active"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line bg-surface-page px-4 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('route')}
            className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'route'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            1. Route &amp; Endpoints
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('segments')}
            className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'segments'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <span>2. Segments ({segments.length})</span>
            <span className="px-1.5 py-0.2 bg-primary-subtle text-primary rounded-full text-[10px]">
              {totalLength}m
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cable')}
            className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'cable'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            3. Cable &amp; Trench (Detail A)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('titleBlock')}
            className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'titleBlock'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            4. Signatures &amp; Notes
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: ROUTE & ENDPOINTS */}
          {activeTab === 'route' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 border border-line rounded-md bg-surface-subtle">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                    Start Location (Start Node)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        Start Name / Tag
                      </label>
                      <input
                        type="text"
                        value={startId}
                        onChange={(e) => setStartId(e.target.value)}
                        placeholder="e.g. SIGNAL NO. S12"
                        className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        Equipment Type
                      </label>
                      <select
                        value={startType}
                        onChange={(e) => setStartType(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary focus:border-primary focus:outline-none"
                      >
                        {NODE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 border border-line rounded-md bg-surface-subtle">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">
                    End Location (End Node)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        End Name / Tag
                      </label>
                      <input
                        type="text"
                        value={endId}
                        onChange={(e) => setEndId(e.target.value)}
                        placeholder="e.g. POINT MACHINE P4"
                        className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        Equipment Type
                      </label>
                      <select
                        value={endType}
                        onChange={(e) => setEndType(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary focus:border-primary focus:outline-none"
                      >
                        {NODE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-surface-subtle border border-line rounded-md text-xs text-ink-secondary flex items-center justify-between">
                <span>Total Calculated Cable Route Length:</span>
                <span className="font-extrabold text-sm text-primary tabular-nums">
                  {totalLength} Metres
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: ROUTE SEGMENTS */}
          {activeTab === 'segments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-secondary">
                  Specify lengths and laying methods along the railway track.
                </span>
                <Button variant="secondary" size="sm" onClick={handleAddSegment}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Segment</span>
                </Button>
              </div>

              <div className="space-y-2">
                {segments.map((seg, idx) => (
                  <div
                    key={seg.id || idx}
                    className="p-3 border border-line rounded-md bg-surface-subtle flex flex-wrap items-center gap-2 justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-ink text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <select
                          value={seg.layingMethod}
                          onChange={(e) =>
                            handleSegmentChange(idx, 'layingMethod', e.target.value as LayingMethod)
                          }
                          className="px-2.5 py-1 text-xs font-semibold bg-surface-card border border-line rounded-sm text-ink-primary focus:border-primary"
                        >
                          {LAYING_METHODS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={seg.length}
                            onChange={(e) =>
                              handleSegmentChange(idx, 'length', Math.max(1, parseFloat(e.target.value) || 0))
                            }
                            className="w-20 px-2 py-1 text-xs font-bold text-center bg-surface-card border border-line rounded-sm text-ink-primary"
                          />
                          <span className="text-xs text-ink-secondary font-medium">metres</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-1 text-xs text-ink-secondary">
                        <span>Depth:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={seg.depth}
                          onChange={(e) =>
                            handleSegmentChange(idx, 'depth', parseFloat(e.target.value) || 0)
                          }
                          className="w-14 px-1.5 py-1 text-xs bg-surface-card border border-line rounded-sm text-center"
                        />
                        <span>m</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSegment(idx)}
                        disabled={segments.length <= 1}
                        className="p-1.5 text-status-error hover:bg-status-error-bg rounded-sm disabled:opacity-30"
                        title="Delete segment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-surface-subtle border border-line rounded-md flex items-center justify-between text-xs">
                <span className="font-medium text-ink-secondary">Overall Route Sum:</span>
                <span className="font-extrabold text-sm text-primary tabular-nums">
                  {totalLength} Metres
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: CABLE & DETAIL 'A' CROSS-SECTION */}
          {activeTab === 'cable' && (
            <div className="space-y-4">
              <div className="p-3.5 border border-line rounded-md bg-surface-subtle space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Detail 'A' — Cable Specifications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Cable Count (Nos.)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={cableCount}
                      onChange={(e) => setCableCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Cores Per Cable
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="48"
                      value={cableCore}
                      onChange={(e) => setCableCore(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Cable Type
                    </label>
                    <select
                      value={cableType}
                      onChange={(e) => setCableType(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                    >
                      <option value="Signalling">Signalling</option>
                      <option value="Power">Power</option>
                      <option value="Telecom">Telecom (Quad)</option>
                      <option value="Optical Fibre">Optical Fibre (OFC)</option>
                      <option value="Axle Counter">Axle Counter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Conductor &amp; Armour
                    </label>
                    <input
                      type="text"
                      value={conductorSize}
                      onChange={(e) => setConductorSize(e.target.value)}
                      placeholder="e.g. 1.5 sq mm Armoured Railway Cable"
                      className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 border border-line rounded-md bg-surface-subtle space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-primary">
                  Trench Cross-Section Standards
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Standard Trench Depth (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={trenchDepth}
                      onChange={(e) => setTrenchDepth(parseFloat(e.target.value) || 1.0)}
                      className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Protection / Tray Standard
                    </label>
                    <input
                      type="text"
                      value={protectionCover}
                      onChange={(e) => setProtectionCover(e.target.value)}
                      placeholder="e.g. Perforated GI Cable Tray"
                      className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TITLE BLOCK & SIGNATURES */}
          {activeTab === 'titleBlock' && (
            <div className="space-y-4">
              <div className="p-3.5 border border-line rounded-md bg-surface-subtle space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Indian Railways Engineering Title Block
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Railway Zone
                    </label>
                    <input
                      type="text"
                      value={railwayZone}
                      onChange={(e) => setRailwayZone(e.target.value)}
                      placeholder="e.g. INDIAN RAILWAYS"
                      className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Division
                    </label>
                    <input
                      type="text"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      placeholder="e.g. S&T Division"
                      className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Drawing Number
                    </label>
                    <input
                      type="text"
                      value={drawingNumber}
                      onChange={(e) => setDrawingNumber(e.target.value)}
                      placeholder="e.g. IR/S&T/SIGNAL-POINTM/2026/21"
                      className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        Revision
                      </label>
                      <input
                        type="text"
                        value={revision}
                        onChange={(e) => setRevision(e.target.value)}
                        placeholder="R0"
                        className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="18-11-2026"
                        className="w-full px-3 py-1.5 text-sm bg-surface-card border border-line rounded-sm text-ink-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 border border-line rounded-md bg-surface-subtle space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-primary">
                  Engineering Authorities (Bottom Stamp)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Drawn By
                    </label>
                    <input
                      type="text"
                      value={drawnBy}
                      onChange={(e) => setDrawnBy(e.target.value)}
                      placeholder="SSE / SIG / DESIGN"
                      className="w-full px-3 py-1.5 text-xs bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Checked By
                    </label>
                    <input
                      type="text"
                      value={checkedBy}
                      onChange={(e) => setCheckedBy(e.target.value)}
                      placeholder="ASTE / S&T"
                      className="w-full px-3 py-1.5 text-xs bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Approved By
                    </label>
                    <input
                      type="text"
                      value={approvedBy}
                      onChange={(e) => setApprovedBy(e.target.value)}
                      placeholder="DSTE / SR. DSTE"
                      className="w-full px-3 py-1.5 text-xs bg-surface-card border border-line rounded-sm text-ink-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 border border-line rounded-md bg-surface-subtle space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-primary">
                  General Notes
                </h3>
                <input
                  type="text"
                  value={note1}
                  onChange={(e) => setNote1(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-card border border-line rounded-sm text-ink-primary"
                />
                <input
                  type="text"
                  value={note2}
                  onChange={(e) => setNote2(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-card border border-line rounded-sm text-ink-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-3 border-t border-line flex items-center justify-between bg-surface-subtle">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4" />
            <span>Apply &amp; Update Drawing</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
