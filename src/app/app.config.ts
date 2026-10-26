import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';

import { authPreviewPort } from './utils/auth-preview.utils';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authInterceptor } from './interceptors/auth.interceptor';
import { loggingInterceptor } from './interceptors/logging.interceptor';
import { GlobalErrorHandler } from './services/global-error-handler';

/**
 * Check if Firebase configuration is valid.
 * Prevents app crashes in CI/test environments with placeholder credentials.
 */
function hasValidFirebaseConfig(): boolean {
  const config = environment.firebase;
  return !!(
    config.apiKey &&
    config.projectId &&
    config.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    config.apiKey !== ''
  );
}

/**
 * Get Firebase providers only if configuration is valid.
 * This prevents the app from crashing during screenshot workflows or CI builds
 * where Firebase credentials may not be available.
 */
function getFirebaseProviders() {
  if (hasValidFirebaseConfig()) {
    try {
      return [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => {
          const auth = getAuth();
          const previewPort = authPreviewPort(environment);
          if (previewPort !== null && typeof window !== 'undefined') {
            // The preview proxy forwards only these local auth endpoints to the emulator.
            // Keeping requests same-origin preserves the production CSP unchanged.
            connectAuthEmulator(auth, window.location.origin, {
              disableWarnings: true,
            });
          }
          return auth;
        }),
      ];
    } catch (error) {
      console.warn('Firebase initialization failed, continuing without Firebase:', error);
      return [];
    }
  } else {
    console.info('Firebase not configured, running without authentication features');
    return [];
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    ...(environment.production ? [provideClientHydration(withEventReplay())] : []),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, loggingInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAnimationsAsync(),
    ...getFirebaseProviders(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
