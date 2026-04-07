import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { App } from './app';
import { SeoService } from './services/seo.service';
import { LanguageService } from './services/language.service';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { OfflineBanner } from './components/offline-banner/offline-banner';
import { CookieConsent } from './components/cookie-consent/cookie-consent';

@Component({ selector: 'app-header', standalone: true, template: '' })
class MockHeader {}

@Component({ selector: 'app-footer', standalone: true, template: '' })
class MockFooter {}

@Component({ selector: 'app-offline-banner', standalone: true, template: '' })
class MockOfflineBanner {}

@Component({ selector: 'app-cookie-consent', standalone: true, template: '' })
class MockCookieConsent {}

describe('App', () => {
  beforeEach(async () => {
    TestBed.overrideComponent(App, {
      remove: {
        imports: [Header, Footer, OfflineBanner, CookieConsent],
      },
      add: {
        imports: [MockHeader, MockFooter, MockOfflineBanner, MockCookieConsent],
      },
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: SeoService, useValue: {} },
        { provide: LanguageService, useValue: { translate: (key: string) => key } },
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: false,
            versionUpdates: { subscribe: () => ({}) },
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render header', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });
});
