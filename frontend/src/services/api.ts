import { DrawingProject, SymbolManifest, SymbolItem } from '../types/drawing';
import { SAMPLE_PROJECT_REFERENCE } from '../constants/railwayData';
import { STORAGE_KEYS, UI_LIMITS } from '../constants/uiConstants';
import bundledSymbolManifest from '../constants/symbolManifest.json';
import { generateClientDxf } from './dxfClient';

const IS_FILE_PROTOCOL = typeof window !== 'undefined' && window.location.protocol === 'file:';
const API_BASE_URL =
  typeof window !== 'undefined' && !IS_FILE_PROTOCOL
    ? `${window.location.protocol}//${window.location.hostname}:8000/api`
    : 'http://localhost:8000/api';

class ApiService {
  private isServerOnline = false;

  async checkServerHealth(): Promise<boolean> {
    if (IS_FILE_PROTOCOL) {
      this.isServerOnline = false;
      return false;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        signal: AbortSignal.timeout(UI_LIMITS.HEALTH_CHECK_TIMEOUT_MS),
      });
      this.isServerOnline = res.ok;
      return this.isServerOnline;
    } catch {
      this.isServerOnline = false;
      return false;
    }
  }

  isOnline(): boolean {
    return this.isServerOnline;
  }

  async getProjects(): Promise<DrawingProject[]> {
    if (await this.checkServerHealth()) {
      try {
        const res = await fetch(`${API_BASE_URL}/projects`);
        if (res.ok) {
          const remoteProjects = await res.json();
          if (remoteProjects && remoteProjects.length > 0) {
            return remoteProjects;
          }
        }
      } catch {
        // Fall through to local storage when server is unreachable
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // Reset corrupted local storage below
      }
    }
    const defaultList = [SAMPLE_PROJECT_REFERENCE];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(defaultList));
    return defaultList;
  }

  async saveProject(project: DrawingProject): Promise<DrawingProject> {
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    if (await this.checkServerHealth()) {
      try {
        const res = await fetch(`${API_BASE_URL}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        if (res.ok) {
          const saved = await res.json();
          this.syncToLocalStorage(saved);
          return saved;
        }
      } catch {
        // Persist locally if backend request fails
      }
    }

    this.syncToLocalStorage(updated);
    return updated;
  }

  private syncToLocalStorage(project: DrawingProject) {
    const local = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const list: DrawingProject[] = local ? JSON.parse(local) : [];
    const index = list.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      list[index] = project;
    } else {
      list.unshift(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
  }

  async deleteProject(id: string): Promise<boolean> {
    if (await this.checkServerHealth()) {
      try {
        await fetch(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
      } catch {
        // Continue to remove locally
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (local) {
      const list: DrawingProject[] = JSON.parse(local);
      const filtered = list.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    }
    return true;
  }

  async getSymbolManifest(): Promise<SymbolManifest> {
    if (await this.checkServerHealth()) {
      try {
        const res = await fetch(`${API_BASE_URL}/symbols`);
        if (res.ok) return await res.json();
      } catch {
        // Fall through to static or bundled manifest
      }
    }

    if (IS_FILE_PROTOCOL) {
      return bundledSymbolManifest as unknown as SymbolManifest;
    }

    try {
      const res = await fetch('./symbols/manifest.json');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fall through to bundled manifest
    }
    return bundledSymbolManifest as unknown as SymbolManifest;
  }

  async verifySymbol(symbolId: string, verifiedBy: string, notes: string): Promise<boolean> {
    const payload = {
      status: 'VERIFIED',
      verifiedBy,
      date: new Date().toLocaleDateString('en-GB'),
      notes,
    };

    if (await this.checkServerHealth()) {
      try {
        const res = await fetch(`${API_BASE_URL}/symbols/${symbolId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) return true;
      } catch {
        // Fall through to session cache update
      }
    }

    const cached = sessionStorage.getItem(STORAGE_KEYS.CACHED_MANIFEST);
    if (cached) {
      const manifest: SymbolManifest = JSON.parse(cached);
      const sym = manifest.symbols.find((s) => s.id === symbolId);
      if (sym) {
        sym.verificationStatus = 'VERIFIED';
        sym.verifiedBy = verifiedBy;
        sym.verificationDate = payload.date;
        sym.verificationNotes = notes;
        sessionStorage.setItem(STORAGE_KEYS.CACHED_MANIFEST, JSON.stringify(manifest));
      }
    }
    return true;
  }

  async addCustomSymbol(symbol: Partial<SymbolItem> & { svgContent: string }): Promise<SymbolItem> {
    if (await this.checkServerHealth()) {
      try {
        const res = await fetch(`${API_BASE_URL}/symbols`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(symbol),
        });
        if (res.ok) {
          const data = await res.json();
          return data.symbol;
        }
      } catch {
        // Fall through to local in-memory object
      }
    }

    return {
      id: symbol.id || `custom_${Date.now()}`,
      name: symbol.name || 'Custom Symbol',
      category: symbol.category || 'Custom',
      description: symbol.description || '',
      sourceReference: symbol.sourceReference || 'User Provided',
      defaultSize: symbol.defaultSize || { width: 32, height: 32 },
      anchorPoint: symbol.anchorPoint || { x: 16, y: 16 },
      version: '1.0.0',
      verificationStatus: 'NEEDS VERIFICATION',
      tags: symbol.tags || [],
      svgFile: `${symbol.id}.svg`,
      svgContent: symbol.svgContent,
    };
  }

  async exportDxf(project: DrawingProject): Promise<Blob> {
    if (await this.checkServerHealth()) {
      try {
        const res = await fetch(`${API_BASE_URL}/export/dxf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project),
        });
        if (res.ok) {
          return await res.blob();
        }
      } catch {
        // Fall back to client-side DXF generator
      }
    }

    const dxfString = generateClientDxf(project);
    return new Blob([dxfString], { type: 'application/dxf;charset=utf-8' });
  }
}

export const api = new ApiService();
