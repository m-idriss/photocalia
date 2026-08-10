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
    const secureRandom = globalThis.crypto;
    if (typeof secureRandom?.randomUUID === 'function') {
      return secureRandom.randomUUID();
    }

    if (typeof secureRandom?.getRandomValues === 'function') {
      const bytes = secureRandom.getRandomValues(new Uint8Array(16));
      const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
      return `inst_${hex}`;
    }

    throw new Error('Secure random generation is unavailable');
  }
}
