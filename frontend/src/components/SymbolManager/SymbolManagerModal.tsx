import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Plus,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { SymbolItem, UserRole } from '../../types/drawing';
import { api } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { SymbolVerifyDialog } from './SymbolVerifyDialog';
import { SymbolEditorDialog, CustomSymbolPayload } from './SymbolEditorDialog';

interface SymbolManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbols: Record<string, SymbolItem>;
  isLoadingSymbols?: boolean;
  currentRole: UserRole;
  onSymbolUpdated: (updated: SymbolItem) => void;
}

export const SymbolManagerModal: React.FC<SymbolManagerModalProps> = ({
  isOpen,
  onClose,
  symbols,
  isLoadingSymbols = false,
  currentRole,
  onSymbolUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'NEEDS VERIFICATION'>(
    'ALL'
  );
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolItem | null>(null);
  const [verifyingSymbol, setVerifyingSymbol] = useState<SymbolItem | null>(null);
  const [editorState, setEditorState] = useState<{
    open: boolean;
    replacing: boolean;
    target: SymbolItem | null;
  }>({ open: false, replacing: false, target: null });
  const [feedback, setFeedback] = useState<string | null>(null);

  const symbolList = Object.values(symbols);
  const categories = ['ALL', ...Array.from(new Set(symbolList.map((s) => s.category)))];

  const filteredSymbols = symbolList.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.sourceReference.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || s.verificationStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const verifiedCount = symbolList.filter((s) => s.verificationStatus === 'VERIFIED').length;
  const needsVerificationCount = symbolList.length - verifiedCount;

  const handleConfirmVerify = async (verifierName: string, notes: string) => {
    if (!verifyingSymbol) return;
    const success = await api.verifySymbol(verifyingSymbol.id, verifierName, notes);
    if (success) {
      const updated: SymbolItem = {
        ...verifyingSymbol,
        verificationStatus: 'VERIFIED',
        verifiedBy: verifierName,
        verificationDate: new Date().toLocaleDateString('en-GB'),
        verificationNotes: notes,
      };
      onSymbolUpdated(updated);
      setSelectedSymbol(updated);
      setVerifyingSymbol(null);
      setFeedback(`Verified "${updated.name}".`);
    }
  };

  const handleSaveCustomSymbol = async (payload: CustomSymbolPayload) => {
    const newSymbol: SymbolItem = {
      id: payload.id,
      name: payload.name,
      category: payload.category,
      description: payload.description,
      sourceReference: payload.sourceReference,
      defaultSize: { width: 32, height: 32 },
      anchorPoint: { x: 16, y: 32 },
      version: '1.0.1',
      verificationStatus: currentRole === 'Admin' ? 'VERIFIED' : 'NEEDS VERIFICATION',
      verifiedBy: currentRole === 'Admin' ? 'Admin Engineer' : undefined,
      verificationDate:
        currentRole === 'Admin' ? new Date().toLocaleDateString('en-GB') : undefined,
      verificationNotes: editorState.replacing
        ? 'Replaced via Symbol Library'
        : 'Added via Symbol Library',
      tags: [payload.category.toLowerCase(), 'custom'],
      svgFile: `${payload.id}.svg`,
      svgContent: payload.svgContent,
    };

    await api.addCustomSymbol({ ...newSymbol, svgContent: payload.svgContent });
    onSymbolUpdated(newSymbol);
    setSelectedSymbol(newSymbol);
    setEditorState({ open: false, replacing: false, target: null });
    setFeedback(
      editorState.replacing
        ? `Replaced SVG for "${newSymbol.name}".`
        : `Added "${newSymbol.name}" to symbol library.`
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setStatusFilter('ALL');
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="S&T Symbol Library"
        subtitle="RDSO and IRSEM Part II vector symbols with verification tracking."
        maxWidthClass="max-w-6xl"
        headerActions={
          currentRole === 'Admin' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setEditorState({ open: true, replacing: false, target: null })}
            >
              <Plus className="w-4 h-4" />
              <span>Add Symbol</span>
            </Button>
          ) : undefined
        }
      >
        {/* Filter Bar */}
        <div className="px-5 py-3 bg-surface-subtle border-b border-line space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge tone="success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="tabular-nums">{verifiedCount} Verified</span>
              </StatusBadge>
              <StatusBadge tone="warning">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="tabular-nums">{needsVerificationCount} Pending</span>
              </StatusBadge>
              {feedback && (
                <span className="text-xs font-medium text-status-success">{feedback}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial justify-end">
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <Search
                  className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, ID, or RDSO ref..."
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs bg-surface-card border border-line rounded-sm text-ink-primary placeholder:text-ink-muted focus:border-primary focus:outline-none"
                />
              </div>

              <div
                className="inline-flex items-center p-0.5 rounded-sm bg-surface-card border border-line"
                role="group"
                aria-label="Verification status filter"
              >
                {(
                  [
                    { key: 'ALL', label: 'All' },
                    { key: 'VERIFIED', label: 'Verified' },
                    { key: 'NEEDS VERIFICATION', label: 'Pending' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={`min-h-[36px] px-2.5 rounded-sm text-xs font-medium transition-colors duration-fast ${
                      statusFilter === key
                        ? 'bg-primary text-primary-ink'
                        : 'text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[36px] px-3 py-1 rounded-sm text-xs font-medium whitespace-nowrap border transition-colors duration-fast ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-ink border-primary'
                    : 'bg-surface-card text-ink-secondary border-line hover:bg-surface-hover'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Split View: Symbol List + Inspector */}
        <div className="flex flex-col lg:flex-row min-h-[460px] max-h-[65vh]">
          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingSymbols ? (
              <div className="space-y-2.5">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredSymbols.length === 0 ? (
              <EmptyState
                icon={<Search className="w-5 h-5" />}
                title="No matching symbols"
                description="No symbols match your current search and filter criteria."
                action={
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                }
              />
            ) : (
              <div className="border border-line rounded-md overflow-hidden bg-surface-card">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-subtle border-b border-line text-ink-muted">
                      <th className="py-2.5 px-3 font-medium w-14">Symbol</th>
                      <th className="py-2.5 px-3 font-medium">Name &amp; Reference</th>
                      <th className="py-2.5 px-3 font-medium hidden sm:table-cell">Category</th>
                      <th className="py-2.5 px-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-subtle">
                    {filteredSymbols.map((sym) => {
                      const isSelected = selectedSymbol?.id === sym.id;
                      const isVerified = sym.verificationStatus === 'VERIFIED';
                      return (
                        <tr
                          key={sym.id}
                          onClick={() => setSelectedSymbol(sym)}
                          className={`cursor-pointer transition-colors duration-fast ${
                            isSelected ? 'bg-primary-subtle' : 'hover:bg-surface-subtle'
                          }`}
                        >
                          <td className="py-2 px-3">
                            <div className="w-10 h-10 bg-white rounded-sm border border-line flex items-center justify-center p-1">
                              <img
                                src={`./symbols/${sym.svgFile}`}
                                alt={sym.name}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-ink-primary">{sym.name}</div>
                            <div className="text-ink-muted mt-0.5">{sym.sourceReference}</div>
                          </td>
                          <td className="py-2 px-3 text-ink-secondary hidden sm:table-cell">
                            {sym.category}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <StatusBadge tone={isVerified ? 'success' : 'warning'}>
                              {isVerified ? 'Verified' : 'Pending'}
                            </StatusBadge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Inspector Panel */}
          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-line bg-surface-subtle p-4 overflow-y-auto flex flex-col justify-between gap-4">
            {selectedSymbol ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-line">
                    <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Symbol Details
                    </h3>
                    <StatusBadge
                      tone={
                        selectedSymbol.verificationStatus === 'VERIFIED' ? 'success' : 'warning'
                      }
                    >
                      {selectedSymbol.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending'}
                    </StatusBadge>
                  </div>

                  <div className="w-full h-32 bg-white rounded-md border border-line flex items-center justify-center p-4">
                    <img
                      src={`./symbols/${selectedSymbol.svgFile}`}
                      alt={selectedSymbol.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <dl className="space-y-2.5 text-xs">
                    <div>
                      <dt className="text-ink-muted">Name</dt>
                      <dd className="font-semibold text-ink-primary mt-0.5">
                        {selectedSymbol.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Symbol ID</dt>
                      <dd className="font-mono text-ink-secondary mt-0.5">{selectedSymbol.id}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Category</dt>
                      <dd className="text-ink-primary mt-0.5">{selectedSymbol.category}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Standard Reference</dt>
                      <dd className="text-ink-primary font-medium mt-0.5">
                        {selectedSymbol.sourceReference}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Description</dt>
                      <dd className="text-ink-secondary leading-relaxed mt-0.5">
                        {selectedSymbol.description}
                      </dd>
                    </div>
                  </dl>

                  {selectedSymbol.verifiedBy && (
                    <div className="p-3 rounded-sm bg-status-success-bg border border-status-success-border text-xs space-y-1">
                      <div className="font-semibold text-status-success">
                        Verified by {selectedSymbol.verifiedBy}
                      </div>
                      <div className="text-ink-secondary">
                        Date: {selectedSymbol.verificationDate}
                      </div>
                      {selectedSymbol.verificationNotes && (
                        <div className="text-ink-secondary">{selectedSymbol.verificationNotes}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-line">
                  {currentRole === 'Admin' ? (
                    <>
                      {selectedSymbol.verificationStatus !== 'VERIFIED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => setVerifyingSymbol(selectedSymbol)}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify Symbol</span>
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          setEditorState({
                            open: true,
                            replacing: true,
                            target: selectedSymbol,
                          })
                        }
                      >
                        <Upload className="w-4 h-4" />
                        <span>Replace SVG</span>
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-ink-muted text-center">
                      Switch to Admin role to verify or replace symbols.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-ink-muted">
                <Layers className="w-8 h-8 mb-2 stroke-[1.5]" />
                <p className="text-xs max-w-[200px]">
                  Select a symbol from the table to inspect its standard reference or verify it.
                </p>
              </div>
            )}
          </aside>
        </div>
      </Modal>

      <SymbolVerifyDialog
        symbol={verifyingSymbol}
        onClose={() => setVerifyingSymbol(null)}
        onConfirm={handleConfirmVerify}
      />

      <SymbolEditorDialog
        key={`${editorState.open}-${editorState.replacing}-${editorState.target?.id ?? 'new'}`}
        isOpen={editorState.open}
        isReplacing={editorState.replacing}
        initialSymbol={editorState.target}
        onClose={() => setEditorState({ open: false, replacing: false, target: null })}
        onSave={handleSaveCustomSymbol}
      />
    </>
  );
};
