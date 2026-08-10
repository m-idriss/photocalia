import { Injectable } from '@angular/core';

const STORAGE_KEY = 'photocalia_installation_id_v1';
const VALID_INSTALLATION_ID = /^[A-Za-z0-9_-]{20,128}$/;

@Injectable({ providedIn: 'root' })
export class InstallationIdentityService {
  private installationId: string | null = null;

  getId(): string {
    if (this.installationId) return this.installationId;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_INSTALLATION_ID.test(stored)) {
        this.installationId = stored;
        return stored;
      }
    } catch {
      // Private browsing and SSR can make storage unavailable.
    }

    this.installationId = this.createId();
    try {
      localStorage.setItem(STORAGE_KEY, this.installationId);
    } catch {
      // The in-memory identifier still keeps requests stable for this session.
    }
    return this.installationId;
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `inst_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 15)}`;
  }
}
