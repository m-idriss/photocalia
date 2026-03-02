import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

export type SupportedLanguage = 'en' | 'fr';

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const STORAGE_KEY = 'photocalia-lang';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  private readonly translations = signal<Record<string, string>>({});
  readonly currentLang = signal<SupportedLanguage>(this.getInitialLanguage());

  readonly languages = SUPPORTED_LANGUAGES;

  constructor() {
    this.loadLanguage(this.currentLang());
  }

  translate(key: string): string {
    return this.translations()[key] ?? key;
  }

  setLanguage(lang: SupportedLanguage): void {
    if (lang === this.currentLang()) return;
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    this.loadLanguage(lang);
  }

  private loadLanguage(lang: SupportedLanguage): void {
    this.http.get<Record<string, string>>(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations.set(data);
        this.document.documentElement.lang = lang;
      },
      error: (err) => {
        console.error(`[LanguageService] Failed to load language "${lang}":`, err);
      },
    });
  }

  private getInitialLanguage(): SupportedLanguage {
    // 1. URL query param (?lang=fr)
    const urlParam = new URLSearchParams(window.location.search).get('lang') as SupportedLanguage | null;
    if (urlParam && SUPPORTED_LANGUAGES.some((l) => l.code === urlParam)) {
      localStorage.setItem(STORAGE_KEY, urlParam);
      return urlParam;
    }
    // 2. LocalStorage preference
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      return stored;
    }
    // 3. Browser language
    const browser = navigator.language?.slice(0, 2) as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.some((l) => l.code === browser)) {
      return browser;
    }
    return 'en';
  }
}
