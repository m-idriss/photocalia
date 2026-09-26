import { Injectable } from '@angular/core';

interface ConversionDraft {
  userId: string;
  files: File[];
  savedAt: number;
}

/** Local-only, short-lived handoff while the user visits pricing and Stripe. */
@Injectable({ providedIn: 'root' })
export class ConversionDraftService {
  private async database(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('photocalia-checkout-draft', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('drafts');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async save(userId: string, files: File[]): Promise<void> {
    if (typeof indexedDB === 'undefined') return;
    const db = await this.database();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite');
        tx.objectStore('drafts').put({ userId, files, savedAt: Date.now() }, 'checkout');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }

  async take(userId: string): Promise<File[]> {
    if (typeof indexedDB === 'undefined') return [];
    const db = await this.database();
    try {
      return await new Promise<File[]>((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite');
        const store = tx.objectStore('drafts');
        const request = store.get('checkout');
        let files: File[] = [];
        request.onsuccess = () => {
          const draft = request.result as ConversionDraft | undefined;
          if (draft?.userId === userId && Date.now() - draft.savedAt < 60 * 60 * 1000) {
            files = draft.files;
          }
          store.delete('checkout');
        };
        tx.oncomplete = () => resolve(files);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }
}
