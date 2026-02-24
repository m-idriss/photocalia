import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    // Reset body classes
    document.body.className = '';

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light theme', () => {
    expect(service.getCurrentTheme()).toBe('light');
  });

  it('should default to small font size', () => {
    expect(service.getCurrentFontSize()).toBe('small');
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const result = service.toggleTheme();
      expect(result).toBe('dark');
      expect(service.getCurrentTheme()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      service.toggleTheme(); // light -> dark
      const result = service.toggleTheme(); // dark -> light
      expect(result).toBe('light');
      expect(service.getCurrentTheme()).toBe('light');
    });

    it('should persist theme to localStorage', () => {
      service.toggleTheme();
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should apply theme class to body', () => {
      service.toggleTheme();
      expect(document.body.classList.contains('dark-theme')).toBe(true);
    });
  });

  describe('cycleFontSize', () => {
    it('should cycle through font sizes', () => {
      // Default is 'small', cycling: normal -> large -> small
      const first = service.cycleFontSize();
      // small is index 2, next is (2+1) % 3 = 0 = 'normal'
      expect(first).toBe('normal');
    });

    it('should persist font size to localStorage', () => {
      service.cycleFontSize();
      expect(localStorage.getItem('fontSize')).toBeTruthy();
    });
  });

  describe('display names', () => {
    it('should return display name for light theme', () => {
      expect(service.getThemeDisplayName('light')).toBe('Light Theme');
    });

    it('should return display name for dark theme', () => {
      expect(service.getThemeDisplayName('dark')).toBe('Dark Theme');
    });

    it('should return key for unknown theme', () => {
      expect(service.getThemeDisplayName('unknown')).toBe('unknown');
    });

    it('should return display name for font sizes', () => {
      expect(service.getFontSizeDisplayName('normal')).toBe('Normal');
      expect(service.getFontSizeDisplayName('large')).toBe('Large');
      expect(service.getFontSizeDisplayName('small')).toBe('Small');
    });
  });

  describe('theme migration', () => {
    it('should migrate white theme to light', () => {
      localStorage.setItem('theme', 'white');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(ThemeService);
      expect(newService.getCurrentTheme()).toBe('light');
    });

    it('should migrate glass theme to light', () => {
      localStorage.setItem('theme', 'glass');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(ThemeService);
      expect(newService.getCurrentTheme()).toBe('light');
    });
  });
});
