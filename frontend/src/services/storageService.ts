import { DrawingProject } from '../types/drawing';
import { STORAGE_KEYS, UI_LIMITS } from '../constants/uiConstants';

export interface SavedDrawingRecord {
  id: string;
  title: string;
  totalLength: number;
  dateStr: string;
  thumbnailUrl: string;
  promptText?: string;
  project: DrawingProject;
}

export function getSavedDrawings(): SavedDrawingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_DRAWINGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDrawingRecord(
  project: DrawingProject,
  thumbnailUrl: string,
  promptText?: string
): SavedDrawingRecord {
  const records = getSavedDrawings();
  const totalLength = project.segments.reduce((a, b) => a + (Number(b.length) || 0), 0);

  const newRecord: SavedDrawingRecord = {
    id: `drg_${Date.now()}`,
    title: `${project.startNode.id} to ${project.endNode.id} (${totalLength}m)`,
    totalLength,
    dateStr: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    thumbnailUrl,
    promptText: promptText || '',
    project,
  };

  records.unshift(newRecord);
  while (records.length > UI_LIMITS.MAX_SAVED_DRAWINGS) records.pop();

  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_DRAWINGS, JSON.stringify(records));
  } catch {
    while (records.length > 5) {
      records.pop();
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_DRAWINGS, JSON.stringify(records));
        break;
      } catch {
        // Keep trimming oldest entries until quota permits
      }
    }
  }
  return newRecord;
}

export function updateRecordThumbnail(id: string, thumbnailUrl: string): SavedDrawingRecord[] {
  const records = getSavedDrawings();
  const idx = records.findIndex((r) => r.id === id);
  if (idx >= 0) {
    records[idx] = { ...records[idx], thumbnailUrl };
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_DRAWINGS, JSON.stringify(records));
    } catch {
      // Ignore quota errors during background thumbnail refresh
    }
  }
  return records;
}

export function deleteSavedRecord(id: string): SavedDrawingRecord[] {
  const records = getSavedDrawings().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.SAVED_DRAWINGS, JSON.stringify(records));
  return records;
}
