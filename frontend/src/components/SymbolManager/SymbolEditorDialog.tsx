import React, { useState } from 'react';
import { SymbolItem } from '../../types/drawing';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField, inputBaseClass, inputErrorClass } from '../ui/FormField';

export interface CustomSymbolPayload {
  id: string;
  name: string;
  category: string;
  description: string;
  sourceReference: string;
  svgContent: string;
}

interface SymbolEditorDialogProps {
  isOpen: boolean;
  isReplacing: boolean;
  initialSymbol?: SymbolItem | null;
  onClose: () => void;
  onSave: (payload: CustomSymbolPayload) => Promise<void>;
}

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect x="4" y="4" width="24" height="24" rx="2" fill="#f8fafc" stroke="#0f2942" stroke-width="2"/>
  <circle cx="16" cy="16" r="6" fill="#b91c1c"/>
</svg>`;

const SYMBOL_CATEGORIES = [
  'Signals',
  'Points & Machines',
  'Track Circuits & Axle Counters',
  'Level Crossings',
  'Location Boxes & Housing',
  'Cable Markers & Joints',
  'Civil & Track Infrastructure',
  'Custom',
];

export const SymbolEditorDialog: React.FC<SymbolEditorDialogProps> = ({
  isOpen,
  isReplacing,
  initialSymbol,
  onClose,
  onSave,
}) => {
  const [id, setId] = useState(() =>
    isReplacing && initialSymbol ? initialSymbol.id : `custom_sym_${Date.now()}`
  );
  const [name, setName] = useState(() => (isReplacing && initialSymbol ? initialSymbol.name : ''));
  const [category, setCategory] = useState(() =>
    isReplacing && initialSymbol ? initialSymbol.category : 'Signals'
  );
  const [description, setDescription] = useState(() =>
    isReplacing && initialSymbol ? initialSymbol.description : ''
  );
  const [sourceReference, setSourceReference] = useState(() =>
    isReplacing && initialSymbol ? initialSymbol.sourceReference : 'RDSO / IRSEM Standard'
  );
  const [svgContent, setSvgContent] = useState(() =>
    isReplacing && initialSymbol?.svgContent ? initialSymbol.svgContent : DEFAULT_SVG
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !svgContent.trim()) {
      setError('Symbol ID, Display Name, and valid SVG markup are required.');
      return;
    }
    if (!svgContent.trim().startsWith('<svg')) {
      setError('SVG markup must start with an <svg> root element.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        id: id.trim(),
        name: name.trim(),
        category,
        description: description.trim(),
        sourceReference: sourceReference.trim() || 'RDSO Standard Drawing',
        svgContent: svgContent.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReplacing ? `Replace Symbol: ${name || id}` : 'Add Custom S&T Symbol'}
      subtitle="Provide RDSO reference details and clean inline SVG vector markup."
      maxWidthClass="max-w-lg"
      footer={
        <div className="w-full flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={isSaving}
            type="submit"
            form="symbol-editor-form"
          >
            {isReplacing ? 'Save Replacement' : 'Add to Library'}
          </Button>
        </div>
      }
    >
      <form id="symbol-editor-form" onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div
            role="alert"
            className="px-3 py-2 rounded-sm border border-status-error-border bg-status-error-bg text-status-error text-xs font-medium"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Symbol ID" htmlFor="sym-id" required>
            <input
              id="sym-id"
              type="text"
              disabled={isReplacing}
              value={id}
              onChange={(e) => setId(e.target.value)}
              className={`${inputBaseClass} font-mono`}
            />
          </FormField>

          <FormField label="Category" htmlFor="sym-cat" required>
            <select
              id="sym-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputBaseClass}
            >
              {SYMBOL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Display Name" htmlFor="sym-name" required>
          <input
            id="sym-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 4-Aspect Main Signal"
            className={`${inputBaseClass} ${!name.trim() && error ? inputErrorClass : ''}`}
          />
        </FormField>

        <FormField label="Official Source Reference" htmlFor="sym-source">
          <input
            id="sym-source"
            type="text"
            value={sourceReference}
            onChange={(e) => setSourceReference(e.target.value)}
            placeholder="e.g. IRSEM Part II / RDSO SD-10025"
            className={inputBaseClass}
          />
        </FormField>

        <FormField label="Description" htmlFor="sym-desc">
          <input
            id="sym-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief engineering usage note"
            className={inputBaseClass}
          />
        </FormField>

        <FormField
          label="SVG Vector Markup"
          htmlFor="sym-svg"
          required
          hint="Paste <svg>...</svg>"
        >
          <textarea
            id="sym-svg"
            rows={6}
            value={svgContent}
            onChange={(e) => setSvgContent(e.target.value)}
            className={`${inputBaseClass} font-mono text-xs min-h-[120px] leading-relaxed`}
          />
        </FormField>
      </form>
    </Modal>
  );
};
