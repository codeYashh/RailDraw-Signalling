import React from 'react';
import { AlertTriangle, Check, Edit3 } from 'lucide-react';
import { DimensionProposal } from '../../services/promptParser';
import { DrawingProject } from '../../types/drawing';
import { Button } from './Button';

interface DimensionApprovalCardProps {
  proposal: DimensionProposal;
  onApprove: (approvedProject: DrawingProject, label: string) => void;
  onDismiss: () => void;
}

export const DimensionApprovalCard: React.FC<DimensionApprovalCardProps> = ({
  proposal,
  onApprove,
  onDismiss,
}) => {
  return (
    <div
      role="region"
      aria-label="Dimension reconciliation approval"
      className="rounded-md border border-status-warning-border bg-surface-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-status-warning-bg border-b border-status-warning-border flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-ink-primary">
            Dimensions Do Not Match — Approval Required
          </h3>
          <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
            {proposal.issueSummary}
          </p>
        </div>
      </div>

      {/* Proposed Reconciled Options */}
      <div className="p-4 space-y-3">
        {/* Option A: Auto-matched to stated total */}
        <div className="p-3 rounded-sm border border-primary-border bg-primary-subtle/50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-primary">
              Recommended Auto-Match ({proposal.specifiedTotal} m)
            </span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            {proposal.adjustedExplanation}
          </p>
          <div className="text-xs font-mono text-ink-primary bg-surface-card border border-line rounded-sm px-2.5 py-1.5">
            {proposal.adjustedSegmentsSummary} = {proposal.specifiedTotal} m
          </div>
        </div>

        {/* Option B: Keep exact segments, update total */}
        <div className="p-3 rounded-sm border border-line bg-surface-subtle space-y-1.5">
          <span className="text-xs font-semibold text-ink-primary">
            Alternative: Use Segment Sum ({proposal.segmentsSum} m)
          </span>
          <p className="text-xs text-ink-secondary leading-relaxed">
            {proposal.sumMatchedExplanation}
          </p>
          <div className="text-xs font-mono text-ink-secondary bg-surface-card border border-line rounded-sm px-2.5 py-1.5">
            {proposal.sumMatchedSegmentsSummary} = {proposal.segmentsSum} m
          </div>
        </div>

        {/* Approval Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <Edit3 className="w-4 h-4" />
            <span>Edit Manually</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                onApprove(
                  proposal.sumMatchedProject,
                  `Approved ${proposal.segmentsSum} m (segment sum)`
                )
              }
            >
              <span>Use {proposal.segmentsSum} m Total</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                onApprove(
                  proposal.adjustedProject,
                  `Approved auto-matched ${proposal.specifiedTotal} m route`
                )
              }
            >
              <Check className="w-4 h-4" />
              <span>Approve &amp; Generate ({proposal.specifiedTotal} m)</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
