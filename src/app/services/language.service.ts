import { Injectable, signal, inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export type SupportedLanguage = 'en' | 'fr';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const STORAGE_KEY = 'photocalia-lang';
const FR_PREFIX = '/fr';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly translations = signal<Record<string, string>>({});
  readonly currentLang = signal<SupportedLanguage>(this.getInitialLanguage());

  readonly languages = SUPPORTED_LANGUAGES;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    this.loadLanguage(this.currentLang());
  }

  translate(key: string): string {
    return this.translations()[key] ?? key;
  }

  /**
   * Switch language and navigate to the equivalent path in the new language.
   */
  setLanguage(lang: SupportedLanguage): void {
    if (lang === this.currentLang()) return;
    this.currentLang.set(lang);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, lang);
    }
    this.loadLanguage(lang);

    // Navigate to the equivalent route in the target language
    const currentPath = this.router.url.split('?')[0].split('#')[0];
    const strippedPath = this.stripLangPrefix(currentPath);
    const newPath =
      lang === DEFAULT_LANGUAGE ? strippedPath || '/' : `${FR_PREFIX}${strippedPath || '/'}`;

    // Replace trailing slash for non-root paths
    const finalPath = newPath === `${FR_PREFIX}/` ? FR_PREFIX : newPath;
    this.router.navigateByUrl(finalPath);
  }

  /**
   * Returns the localized version of a route path based on current language.
   *
   * @example
   *   localizeRoute('/privacy') → '/privacy' (en) or '/fr/privacy' (fr)
   *   localizeRoute('/') → '/' (en) or '/fr' (fr)
   */
  localizeRoute(path: string): string {
    if (this.currentLang() === DEFAULT_LANGUAGE) {
      return path;
    }
    // For root path
    if (path === '/' || path === '') {
      return FR_PREFIX;
    }
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${FR_PREFIX}${normalizedPath}`;
  }

  /**
   * Get the route path without language prefix.
   */
  private stripLangPrefix(path: string): string {
    if (path === FR_PREFIX || path === `${FR_PREFIX}/`) {
      return '/';
    }
    if (path.startsWith(`${FR_PREFIX}/`)) {
      return path.slice(FR_PREFIX.length);
    }
    return path;
  }

  private loadLanguage(lang: SupportedLanguage): void {
    this.http.get<Record<string, string>>(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.translations.set(data);
          this.document.documentElement.lang = lang;
        });
      },
      error: (err) => {
        console.error(`[LanguageService] Failed to load language "${lang}":`, err);
      },
    });
  }

  private getInitialLanguage(): SupportedLanguage {
    if (!this.isBrowser) {
      // During SSR, detect language from the router URL or default to English.
      // The URL path is available via the injected DOCUMENT or router initial URL.
      const url = this.document.location?.pathname ?? '';
      if (url === FR_PREFIX || url.startsWith(`${FR_PREFIX}/`)) {
        return 'fr';
      }
      return DEFAULT_LANGUAGE;
    }

    // 1. URL path prefix (/fr/...)
    const path = window.location.pathname;
    if (path === FR_PREFIX || path.startsWith(`${FR_PREFIX}/`)) {
      localStorage.setItem(STORAGE_KEY, 'fr');
      return 'fr';
    }

    // 2. URL query param (?lang=fr) — backward compatibility, will redirect
    const urlParam = new URLSearchParams(window.location.search).get(
      'lang',
    ) as SupportedLanguage | null;
    if (urlParam && SUPPORTED_LANGUAGES.some((l) => l.code === urlParam)) {
      localStorage.setItem(STORAGE_KEY, urlParam);
      return urlParam;
    }

    // 3. LocalStorage preference
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      return stored;
    }

    // 4. Browser language
    const browser = navigator.language?.slice(0, 2) as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.some((l) => l.code === browser)) {
      return browser;
    }

    return DEFAULT_LANGUAGE;
  }
}
