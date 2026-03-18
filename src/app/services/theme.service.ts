import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

/**
 * Theme configuration interface defining all theme-related options
 */
export interface ThemeConfig {
  THEME_MODES: string[];
  DEFAULT_THEME: string;
  FONT_SIZES: string[];
  DEFAULT_FONT_SIZE: string;
  THEME_DISPLAY_NAMES: Record<string, string>;
  FONT_SIZE_DISPLAY_NAMES: Record<string, string>;
}

/**
 * Service for managing application theme and font size preferences.
 * Persists settings to localStorage and applies them to the DOM.
 *
 * @example
 * ```typescript
 * constructor(private themeService: ThemeService) {}
 *
 * // Toggle between light and dark themes
 * this.themeService.toggleTheme();
 *
 * // Get current theme
 * const theme = this.themeService.getCurrentTheme();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);

  private readonly config: ThemeConfig = {
    THEME_MODES: ['light', 'dark'],
    DEFAULT_THEME: 'light',
    FONT_SIZES: ['normal', 'large', 'small'],
    DEFAULT_FONT_SIZE: 'small',
    THEME_DISPLAY_NAMES: {
      light: 'Light Theme',
      dark: 'Dark Theme',
    },
    FONT_SIZE_DISPLAY_NAMES: {
      normal: 'Normal',
      large: 'Large',
      small: 'Small',
    },
  };

  private currentTheme: string;
  private currentFontSize: string;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    // Initialize from localStorage or use defaults
    // Migrate old theme values to new ones
    let savedTheme = this.isBrowser
      ? localStorage.getItem('theme') || this.config.DEFAULT_THEME
      : this.config.DEFAULT_THEME;

    // Map old theme values to new ones
    if (savedTheme === 'white' || savedTheme === 'glass') {
      savedTheme = 'light';
    }

    this.currentTheme = savedTheme;
    this.currentFontSize = this.isBrowser
      ? localStorage.getItem('fontSize') || this.config.DEFAULT_FONT_SIZE
      : this.config.DEFAULT_FONT_SIZE;

    // Apply initial theme (only in browser)
    if (this.isBrowser) {
      this.applyTheme(this.currentTheme);
      this.applyFontSize(this.currentFontSize);
    }
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  getCurrentFontSize(): string {
    return this.currentFontSize;
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): string {
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
    return nextTheme;
  }

  cycleFontSize(): string {
    const currentIndex = this.config.FONT_SIZES.indexOf(this.currentFontSize);
    const nextIndex = (currentIndex + 1) % this.config.FONT_SIZES.length;
    const nextFontSize = this.config.FONT_SIZES[nextIndex];

    this.setFontSize(nextFontSize);
    return nextFontSize;
  }

  private setTheme(theme: string): void {
    this.currentTheme = theme;
    if (this.isBrowser) {
      localStorage.setItem('theme', theme);
    }
    this.applyTheme(theme);
  }

  private setFontSize(fontSize: string): void {
    this.currentFontSize = fontSize;
    if (this.isBrowser) {
      localStorage.setItem('fontSize', fontSize);
    }
    this.applyFontSize(fontSize);
  }

  private applyTheme(theme: string): void {
    if (!this.isBrowser) return;

    const body = this.doc.body;
    const bgElement = this.doc.querySelector('.bg') as HTMLElement;

    // Remove all existing theme and background classes
    body.classList.remove('light-theme', 'dark-theme', 'white-theme', 'glass-theme');
    body.classList.remove('bg-black', 'bg-white');

    // Add new theme class
    body.classList.add(`${theme}-theme`);

    // Apply background based on theme
    const backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
    const bgClass = theme === 'dark' ? 'bg-black' : 'bg-white';

    body.classList.add(bgClass);

    // Update background element if it exists
    if (bgElement) {
      bgElement.innerHTML = '';
      bgElement.style.background = backgroundColor;
    }

    // Update meta theme color
    this.updateThemeColor(backgroundColor);
  }

  private applyFontSize(fontSize: string): void {
    if (!this.isBrowser) return;

    const body = this.doc.body;

    // Remove existing font size classes
    this.config.FONT_SIZES.forEach((size) => {
      body.classList.remove(`font-${size}`);
    });

    // Add new font size class
    body.classList.add(`font-${fontSize}`);
  }

  private updateThemeColor(color: string): void {
    if (!this.isBrowser) return;

    let themeColorMeta = this.doc.querySelector('#theme-color-meta') as HTMLMetaElement;
    if (!themeColorMeta) {
      // Create the meta element if it doesn't exist
      themeColorMeta = this.doc.createElement('meta');
      themeColorMeta.name = 'theme-color';
      themeColorMeta.id = 'theme-color-meta';
      this.doc.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = color;
    this.doc.body.style.setProperty('--body-bg', color);
  }

  getThemeDisplayName(theme: string): string {
    return this.config.THEME_DISPLAY_NAMES[theme] || theme;
  }

  getFontSizeDisplayName(fontSize: string): string {
    return this.config.FONT_SIZE_DISPLAY_NAMES[fontSize] || fontSize;
  }
}
