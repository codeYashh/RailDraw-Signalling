import React from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { LocationNode, SymbolItem } from '../../types/drawing';
import { Button } from '../ui/Button';
import { FormField, inputBaseClass, inputErrorClass } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';

interface Step2NodesProps {
  startNode: LocationNode;
  endNode: LocationNode;
  intermediateNodes: LocationNode[];
  symbols: Record<string, SymbolItem>;
  onUpdateStartNode: (node: Partial<LocationNode>) => void;
  onUpdateEndNode: (node: Partial<LocationNode>) => void;
  onUpdateIntermediateNodes: (nodes: LocationNode[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step2Nodes: React.FC<Step2NodesProps> = ({
  startNode,
  endNode,
  intermediateNodes,
  symbols,
  onUpdateStartNode,
  onUpdateEndNode,
  onUpdateIntermediateNodes,
  onPrev,
  onNext,
}) => {
  const symbolList = Object.values(symbols);
  const startIdError = !startNode.id.trim() ? 'Start node ID is required.' : undefined;
  const endIdError = !endNode.id.trim() ? 'End node ID is required.' : undefined;

  const addIntermediateNode = () => {
    const nextIdx = intermediateNodes.length + 1;
    const newNode: LocationNode = {
      id: `INT-${nextIdx}`,
      name: `Intermediate Location ${nextIdx}`,
      type: 'location_box_single',
      chainageKm: startNode.chainageKm ?? 18,
      chainageM: (startNode.chainageM ?? 0) + nextIdx * 100,
      remarks: 'Trackside junction box',
    };
    onUpdateIntermediateNodes([...intermediateNodes, newNode]);
  };

  const removeIntermediateNode = (idx: number) => {
    onUpdateIntermediateNodes(intermediateNodes.filter((_, i) => i !== idx));
  };

  const updateIntermediateNode = (idx: number, patch: Partial<LocationNode>) => {
    onUpdateIntermediateNodes(
      intermediateNodes.map((n, i) => (i === idx ? { ...n, ...patch } : n))
    );
  };

  const renderEndpointSection = (
    role: 'Start' | 'End',
    node: LocationNode,
    onUpdate: (patch: Partial<LocationNode>) => void,
    idError?: string
  ) => (
    <section className="p-4 rounded-md border border-line bg-surface-card space-y-4">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-line-subtle">
        <div className="flex items-center gap-2">
          <StatusBadge tone={role === 'Start' ? 'primary' : 'neutral'}>
            {role === 'Start' ? 'Origin' : 'Terminus'}
          </StatusBadge>
          <h3 className="text-sm font-semibold text-ink-primary">
            {role === 'Start' ? 'Start Location' : 'End Location'}
          </h3>
        </div>
        <span className="text-xs font-mono font-medium text-ink-muted">
          {node.id || 'Unassigned'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
        <FormField
          label="Node ID"
          required
          error={idError}
          className="sm:col-span-2"
        >
          <input
            type="text"
            value={node.id}
            onChange={(e) => onUpdate({ id: e.target.value })}
            placeholder={role === 'Start' ? 'L1' : 'L12'}
            className={`${inputBaseClass} font-mono font-medium ${
              idError ? inputErrorClass : ''
            }`}
          />
        </FormField>

        <FormField label="Location Name" className="sm:col-span-4">
          <input
            type="text"
            value={node.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder={role === 'Start' ? 'Location Box L1' : 'Location Box L12'}
            className={inputBaseClass}
          />
        </FormField>

        <FormField label="CAD Symbol" className="sm:col-span-3">
          <select
            value={node.type}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className={inputBaseClass}
          >
            {symbolList.map((sym) => (
              <option key={sym.id} value={sym.id}>
                {sym.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Chainage (Km)" className="sm:col-span-1">
          <input
            type="number"
            value={node.chainageKm ?? 0}
            onChange={(e) => onUpdate({ chainageKm: parseFloat(e.target.value) || 0 })}
            className={`${inputBaseClass} tabular-nums`}
          />
        </FormField>

        <FormField label="Metres" className="sm:col-span-2">
          <input
            type="number"
            value={node.chainageM ?? 0}
            onChange={(e) => onUpdate({ chainageM: parseFloat(e.target.value) || 0 })}
            className={`${inputBaseClass} tabular-nums`}
          />
        </FormField>

        <FormField label="Equipment / Remarks" className="sm:col-span-6">
          <input
            type="text"
            value={node.remarks ?? ''}
            onChange={(e) => onUpdate({ remarks: e.target.value })}
            placeholder="e.g. Apparatus case for Signal S2 and Point Machine 101"
            className={inputBaseClass}
          />
        </FormField>
      </div>
    </section>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-line">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            Route Locations &amp; Apparatus Cases
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Set terminating location boxes and any intermediate junction points along the route.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={addIntermediateNode}>
          <Plus className="w-4 h-4" />
          <span>Add Intermediate Point</span>
        </Button>
      </div>

      {renderEndpointSection('Start', startNode, onUpdateStartNode, startIdError)}

      {/* Intermediate Points Table / List */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Intermediate Points ({intermediateNodes.length})
          </h3>
        </div>

        {intermediateNodes.length === 0 ? (
          <div className="px-4 py-4 rounded-md border border-dashed border-line bg-surface-subtle/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-ink-muted">
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>No intermediate locations added. Direct run from origin to terminus.</span>
            </div>
            <Button variant="ghost" size="sm" onClick={addIntermediateNode}>
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </div>
        ) : (
          <div className="border border-line rounded-md divide-y divide-line-subtle bg-surface-card">
            {intermediateNodes.map((intNode, idx) => (
              <div key={idx} className="p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink-secondary">
                    Intermediate Point #{idx + 1}
                  </span>
                  <Button
                    variant="ghost"
                    iconOnly
                    onClick={() => removeIntermediateNode(idx)}
                    aria-label={`Remove intermediate point ${idx + 1}`}
                    title="Remove point"
                  >
                    <Trash2 className="w-4 h-4 text-ink-muted hover:text-status-error" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <FormField label="Node ID">
                    <input
                      type="text"
                      value={intNode.id}
                      onChange={(e) => updateIntermediateNode(idx, { id: e.target.value })}
                      className={`${inputBaseClass} font-mono font-medium`}
                    />
                  </FormField>
                  <FormField label="Name" className="sm:col-span-2">
                    <input
                      type="text"
                      value={intNode.name}
                      onChange={(e) => updateIntermediateNode(idx, { name: e.target.value })}
                      className={inputBaseClass}
                    />
                  </FormField>
                  <FormField label="Symbol">
                    <select
                      value={intNode.type}
                      onChange={(e) => updateIntermediateNode(idx, { type: e.target.value })}
                      className={inputBaseClass}
                    >
                      {symbolList.map((sym) => (
                        <option key={sym.id} value={sym.id}>
                          {sym.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {renderEndpointSection('End', endNode, onUpdateEndNode, endIdError)}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-line-subtle">
        <Button variant="secondary" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        <Button variant="primary" onClick={onNext}>
          <span>Next: Route Segments</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
