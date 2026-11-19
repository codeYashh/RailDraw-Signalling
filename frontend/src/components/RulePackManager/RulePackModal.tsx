import React, { useState } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import rulePackJson from '../../standards/irsem_rules.json';
import { downloadFile } from '../../services/pdfExport';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface RulePackModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

type RuleTab = 'depth' | 'pipes' | 'notes' | 'json';

export const RulePackModal: React.FC<RulePackModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
}) => {
  const [rules, setRules] = useState(rulePackJson);
  const [activeTab, setActiveTab] = useState<RuleTab>('depth');
  const [jsonText, setJsonText] = useState(JSON.stringify(rules, null, 2));
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const handleExportRules = () => {
    downloadFile(JSON.stringify(rules, null, 2), 'IRSEM_S&T_Rule_Pack.json', 'application/json');
    setNotice({ tone: 'success', message: 'Exported IRSEM rule pack JSON.' });
  };

  const handleImportRules = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!parsed.depthRules || !parsed.layingMethodConstraints) {
          setNotice({ tone: 'error', message: 'Rule pack JSON is missing required sections.' });
          return;
        }
        setRules(parsed);
        setJsonText(JSON.stringify(parsed, null, 2));
        setNotice({ tone: 'success', message: 'Rule pack imported successfully.' });
      } catch {
        setNotice({ tone: 'error', message: 'Could not parse JSON rule pack file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.depthRules || !parsed.layingMethodConstraints) {
        setNotice({ tone: 'error', message: 'JSON must include depthRules and layingMethodConstraints.' });
        return;
      }
      setRules(parsed);
      setNotice({ tone: 'success', message: 'Updated active rule pack from JSON.' });
    } catch {
      setNotice({ tone: 'error', message: 'Invalid JSON syntax. Fix errors before applying.' });
    }
  };

  const tabs: { id: RuleTab; label: string }[] = [
    { id: 'depth', label: 'Burial Depths' },
    { id: 'pipes', label: 'Pipe Encasement' },
    { id: 'notes', label: 'Standard Notes' },
    { id: 'json', label: 'Raw JSON' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="IRSEM Standards Rule Pack"
      subtitle="Indian Railways Signal Engineering Manual Chapter 15 burial depths, pipe rules, and drawing notes."
      maxWidthClass="max-w-4xl"
      headerActions={
        <Button variant="secondary" size="sm" onClick={handleExportRules}>
          <Download className="w-4 h-4" />
          <span>Export JSON</span>
        </Button>
      }
      footer={
        <>
          <span className="text-xs text-ink-muted">
            {rules.name} ({rules.code})
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      {/* Tabs */}
      <div className="px-5 py-2.5 bg-surface-subtle border-b border-line flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setNotice(null);
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap border transition-colors duration-fast ${
                active
                  ? 'bg-surface-card text-ink-primary border-line shadow-sm'
                  : 'bg-transparent text-ink-secondary border-transparent hover:text-ink-primary hover:bg-surface-hover'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {notice && (
          <div
            role={notice.tone === 'error' ? 'alert' : 'status'}
            className={`px-3 py-2.5 rounded-sm border text-xs font-medium flex items-center gap-2 ${
              notice.tone === 'error'
                ? 'bg-status-error-bg border-status-error-border text-status-error'
                : 'bg-status-success-bg border-status-success-border text-status-success'
            }`}
          >
            {notice.tone === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
        )}

        {activeTab === 'depth' && (
          <div className="space-y-3">
            <p className="text-xs text-ink-secondary">
              Minimum permissible burial depths stipulated in IRSEM Chapter 15 and Railway Board
              policy letters.
            </p>
            <div className="border border-line rounded-md overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-line text-ink-muted">
                    <th className="py-2.5 px-3 font-medium">Laying Method</th>
                    <th className="py-2.5 px-3 font-medium">Specification</th>
                    <th className="py-2.5 px-3 font-medium">Reference</th>
                    <th className="py-2.5 px-3 font-medium text-right">Min Depth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle bg-surface-card">
                  {rules.depthRules.map((rule, i) => (
                    <tr key={i}>
                      <td className="py-3 px-3 font-semibold text-ink-primary whitespace-nowrap">
                        {rule.method}
                      </td>
                      <td className="py-3 px-3 text-ink-secondary leading-relaxed">
                        {rule.description}
                      </td>
                      <td className="py-3 px-3 text-ink-muted whitespace-nowrap">
                        {rule.reference}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <StatusBadge tone="primary">{rule.minDepth} m</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pipes' && (
          <div className="space-y-3">
            <p className="text-xs text-ink-secondary">
              Mandatory protective casing requirements under railway tracks, culverts, and roadways.
            </p>
            <div className="border border-line rounded-md divide-y divide-line-subtle bg-surface-card overflow-hidden">
              {Object.entries(rules.layingMethodConstraints).map(([method, constraint]) => (
                <div key={method} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink-primary">{method}</span>
                    <StatusBadge tone="error">Pipe Mandatory</StatusBadge>
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">{constraint.message}</p>
                  <p className="text-xs text-ink-muted">
                    Approved casings:{' '}
                    <span className="font-medium text-ink-primary">
                      {constraint.allowedPipes.join(', ')}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="border border-line rounded-md bg-surface-card overflow-hidden">
              <div className="px-4 py-2.5 bg-surface-subtle border-b border-line text-xs font-semibold text-ink-primary">
                English Standard Notes
              </div>
              <ol className="p-4 space-y-2 text-xs text-ink-secondary leading-relaxed">
                {rules.defaultNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ol>
            </section>

            <section className="border border-line rounded-md bg-surface-card overflow-hidden">
              <div className="px-4 py-2.5 bg-surface-subtle border-b border-line text-xs font-semibold text-ink-primary">
                Hindi Standard Notes (हिंदी)
              </div>
              <ol className="p-4 space-y-2 text-xs text-ink-secondary leading-relaxed">
                {rules.defaultNotesHindi.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ol>
            </section>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-ink-secondary">
                {isAdmin
                  ? 'Edit or import JSON to update standards for Railway Board correction slips.'
                  : 'Read-only preview. Switch to Admin role to modify rule JSON.'}
              </span>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <label className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-medium bg-surface-card hover:bg-surface-hover text-ink-primary rounded-sm border border-line cursor-pointer transition-colors duration-fast">
                    <Upload className="w-4 h-4 text-ink-secondary" />
                    <span>Import JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportRules}
                      className="hidden"
                    />
                  </label>
                  <Button variant="primary" size="sm" onClick={handleApplyJson}>
                    Apply JSON
                  </Button>
                </div>
              )}
            </div>
            <textarea
              rows={16}
              readOnly={!isAdmin}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full font-mono text-xs p-3.5 border border-line rounded-sm bg-surface-subtle text-ink-primary focus:border-primary focus:outline-none leading-relaxed"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
