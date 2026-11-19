import React, { useState } from 'react';
import { SymbolItem } from '../../types/drawing';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField, inputBaseClass, inputErrorClass } from '../ui/FormField';

interface SymbolVerifyDialogProps {
  symbol: SymbolItem | null;
  onClose: () => void;
  onConfirm: (verifierName: string, notes: string) => Promise<void>;
}

export const SymbolVerifyDialog: React.FC<SymbolVerifyDialogProps> = ({
  symbol,
  onClose,
  onConfirm,
}) => {
  const [verifierName, setVerifierName] = useState('SSE (Drawing) / Signal');
  const [notes, setNotes] = useState(
    'Verified against official RDSO standard drawing / IRSEM Part II'
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!symbol) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifierName.trim()) {
      setError('Enter the verifying officer name or designation.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onConfirm(verifierName.trim(), notes.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(symbol)}
      onClose={onClose}
      title="Verify Symbol Against Standard"
      subtitle={`Certifying "${symbol.name}" against RDSO / IRSEM Part II conventions.`}
      maxWidthClass="max-w-md"
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
            form="verify-symbol-form"
          >
            Confirm Verification
          </Button>
        </div>
      }
    >
      <form id="verify-symbol-form" onSubmit={handleSubmit} className="p-5 space-y-4">
        <FormField
          label="Verifying Officer (Name / Designation)"
          htmlFor="verifier-name"
          required
          error={error ?? undefined}
        >
          <input
            id="verifier-name"
            type="text"
            value={verifierName}
            onChange={(e) => {
              setVerifierName(e.target.value);
              setError(null);
            }}
            className={`${inputBaseClass} ${error ? inputErrorClass : ''}`}
          />
        </FormField>

        <FormField label="RDSO Drawing / Standard Reference Notes" htmlFor="verify-notes">
          <textarea
            id="verify-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputBaseClass} min-h-[84px] resize-none`}
          />
        </FormField>
      </form>
    </Modal>
  );
};
