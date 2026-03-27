/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { inject as injectVercelAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { environment } from './environments/environment';

const COOKIE_CONSENT_STORAGE_KEY = 'photocalia_cookie_consent';

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }

  const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (!storedConsent) {
    return false;
  }

  try {
    const parsed = JSON.parse(storedConsent) as { analytics?: boolean } | null;
    return !!parsed?.analytics;
  } catch {
    return false;
  }
}

if (environment.production && hasAnalyticsConsent()) {
  injectVercelAnalytics();
  injectSpeedInsights();
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
