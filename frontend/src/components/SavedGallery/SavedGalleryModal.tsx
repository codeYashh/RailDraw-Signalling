import React from 'react';
import { Trash2, Download, Image as ImageIcon } from 'lucide-react';
import { SavedDrawingRecord, deleteSavedRecord } from '../../services/storageService';
import { DrawingProject } from '../../types/drawing';
import { triggerDataUrlDownload, sanitizeFilenameSegment } from '../../services/canvasExport';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface SavedGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedList: SavedDrawingRecord[];
  onSelectDrawing: (project: DrawingProject) => void;
  onRefreshList: () => void;
}

export const SavedGalleryModal: React.FC<SavedGalleryModalProps> = ({
  isOpen,
  onClose,
  savedList,
  onSelectDrawing,
  onRefreshList,
}) => {
  const handleDelete = (id: string) => {
    deleteSavedRecord(id);
    onRefreshList();
  };

  const handleDownloadPhoto = (rec: SavedDrawingRecord) => {
    if (!rec.thumbnailUrl) return;
    triggerDataUrlDownload(rec.thumbnailUrl, `${sanitizeFilenameSegment(rec.title)}.png`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved Drawings"
      subtitle="Locally stored cable route drawings on this device."
      maxWidthClass="max-w-2xl"
      footer={
        <>
          <span className="text-xs text-ink-muted tabular-nums">
            {savedList.length} {savedList.length === 1 ? 'drawing' : 'drawings'} stored
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="p-4">
        {savedList.length === 0 ? (
          <EmptyState
            icon={<ImageIcon className="w-5 h-5" />}
            title="No saved drawings yet"
            description="Generate a cable route drawing and select Save to Device to store it here."
          />
        ) : (
          <ul className="divide-y divide-line border border-line rounded-md bg-surface-card overflow-hidden">
            {savedList.map((rec) => (
              <li
                key={rec.id}
                className="flex items-center gap-3 p-3 hover:bg-surface-subtle transition-colors duration-fast"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectDrawing(rec.project);
                    onClose();
                  }}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left min-h-[44px]"
                >
                  <div className="w-20 h-14 bg-white rounded-sm border border-line overflow-hidden flex items-center justify-center shrink-0">
                    {rec.thumbnailUrl ? (
                      <img
                        src={rec.thumbnailUrl}
                        alt={rec.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-ink-muted" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink-primary truncate">
                        {rec.title}
                      </span>
                      <span className="text-xs font-mono font-medium text-ink-secondary bg-surface-subtle border border-line px-1.5 py-0.5 rounded-sm shrink-0 tabular-nums">
                        {rec.totalLength} m
                      </span>
                    </div>
                    {rec.promptText && (
                      <p className="text-xs text-ink-muted truncate mt-0.5">{rec.promptText}</p>
                    )}
                    <p className="text-xs text-ink-muted mt-0.5 tabular-nums">{rec.dateStr}</p>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    iconOnly
                    disabled={!rec.thumbnailUrl}
                    onClick={() => handleDownloadPhoto(rec)}
                    aria-label={`Download ${rec.title}`}
                    title="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    iconOnly
                    onClick={() => handleDelete(rec.id)}
                    aria-label={`Delete ${rec.title}`}
                    title="Delete drawing"
                  >
                    <Trash2 className="w-4 h-4 text-ink-muted hover:text-status-error" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};
