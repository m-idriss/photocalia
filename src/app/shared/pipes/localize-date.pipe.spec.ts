import { ChangeDetectorRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocalizeDatePipe } from './localize-date.pipe';
import { LanguageService, SupportedLanguage } from '../../services/language.service';

describe('LocalizeDatePipe', () => {
  let pipe: LocalizeDatePipe;
  const currentLang = signal<SupportedLanguage>('en');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalizeDatePipe,
        { provide: LanguageService, useValue: { currentLang } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: () => undefined } },
      ],
    });

    pipe = TestBed.inject(LocalizeDatePipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('English format (YYYY-MM-DD)', () => {
    beforeEach(() => {
      currentLang.set('en');
    });

    it('should return date in YYYY-MM-DD format', () => {
      const result = pipe.transform('2026-06-12');
      expect(result).toBe('2026-06-12');
    });

    it('should handle various dates', () => {
      expect(pipe.transform('2025-01-01')).toBe('2025-01-01');
      expect(pipe.transform('2026-12-31')).toBe('2026-12-31');
    });
  });

  describe('French format (DD-MM-YYYY)', () => {
    beforeEach(() => {
      currentLang.set('fr');
    });

    it('should convert to DD-MM-YYYY format', () => {
      const result = pipe.transform('2026-06-12');
      expect(result).toBe('12-06-2026');
    });

    it('should handle various dates', () => {
      expect(pipe.transform('2025-01-01')).toBe('01-01-2025');
      expect(pipe.transform('2026-12-31')).toBe('31-12-2026');
    });
  });

  describe('Edge cases', () => {
    it('should return empty string for null', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should return original string for invalid format', () => {
      const invalidDate = 'not-a-date';
      expect(pipe.transform(invalidDate)).toBe(invalidDate);
    });

    it('should handle dates with extra segments', () => {
      const invalidDate = '2026-06-12-extra';
      expect(pipe.transform(invalidDate)).toBe(invalidDate);
    });
  });
});
