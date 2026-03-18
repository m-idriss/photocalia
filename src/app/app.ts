import { Component, signal, OnInit, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';

import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Stats } from './components/stats/stats';
import { OfflineBanner } from './components/offline-banner/offline-banner';
import { PWA_CONFIG } from './constants/pwa.constants';
import { AuthService } from './services/auth.service';
import { SeoService } from './services/seo.service';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, Stats, OfflineBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly seoService = inject(SeoService);
  private readonly languageService = inject(LanguageService);

  protected readonly title = signal('Photocalia');
  protected readonly currentRoute = signal<string>('');
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  // Show stats only on home page for non-logged users
  protected readonly shouldShowStats = computed(
    () => this.currentRoute() === '/' && !this.authService.isAuthenticated(),
  );

  ngOnInit(): void {
    // Track current route
    this.currentRoute.set(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });

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
