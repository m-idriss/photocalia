import {
  Component,
  signal,
  OnInit,
  PLATFORM_ID,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';

const CONSENT_KEY = 'photocalia_cookie_consent';

export interface CookieConsentData {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  timestamp: number;
}

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [TranslatePipe, RouterLink, LocalizeRoutePipe],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieConsent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  readonly visible = signal(false);
  readonly showDetails = signal(false);
  readonly analyticsEnabled = signal(true);
  readonly preferencesEnabled = signal(true);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = this.getStoredConsent();
      if (!stored) {
        // Small delay so it doesn't flash on page load
        setTimeout(() => this.visible.set(true), 1000);
      }
    }
  }

  acceptAll(): void {
    this.saveConsent({ essential: true, analytics: true, preferences: true });
  }

  acceptSelected(): void {
    this.saveConsent({
      essential: true,
      analytics: this.analyticsEnabled(),
      preferences: this.preferencesEnabled(),
    });
  }

  rejectAll(): void {
    this.saveConsent({ essential: true, analytics: false, preferences: false });
  }

  toggleDetails(): void {
    this.showDetails.set(!this.showDetails());
  }

  toggleAnalytics(): void {
    this.analyticsEnabled.set(!this.analyticsEnabled());
  }

  togglePreferences(): void {
    this.preferencesEnabled.set(!this.preferencesEnabled());
  }

  private saveConsent(consent: Omit<CookieConsentData, 'timestamp'>): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const data: CookieConsentData = { ...consent, timestamp: Date.now() };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
      } catch {
        // localStorage unavailable (private mode, etc.)
      }
    }
    this.visible.set(false);
  }

  private getStoredConsent(): CookieConsentData | null {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as CookieConsentData;
    } catch {
      return null;
    }
  }
}
