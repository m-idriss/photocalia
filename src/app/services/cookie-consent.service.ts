import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly _openRequested = signal(0);
  readonly openRequested = this._openRequested.asReadonly();

  open(): void {
    this._openRequested.update((v) => v + 1);
  }
}
