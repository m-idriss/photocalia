import { Component, signal, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';

import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { OfflineBanner } from './components/offline-banner/offline-banner';
import { CookieConsent } from './components/cookie-consent/cookie-consent';
import { Breadcrumb } from './components/breadcrumb/breadcrumb';
import { BackToTop } from './components/back-to-top/back-to-top';
import { PWA_CONFIG } from './constants/pwa.constants';
import { SeoService } from './services/seo.service';
import { LanguageService } from './services/language.service';

const deliberateCiFailure = true;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Breadcrumb, Footer, BackToTop, OfflineBanner, CookieConsent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate);
  private readonly seoService = inject(SeoService);
  private readonly languageService = inject(LanguageService);

  protected readonly title = signal('PhotoCalia');
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  ngOnInit(): void {
    // Check for service worker updates
    if (isPlatformBrowser(this.platformId) && this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          if (confirm(this.languageService.translate('pwa.update') || PWA_CONFIG.UPDATE_MESSAGE)) {
            window.location.reload();
          }
        });
    }

    // Handle PWA install prompt
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Store the event so it can be triggered later
        this.deferredPrompt = e;
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
      });
    }
  }
}
