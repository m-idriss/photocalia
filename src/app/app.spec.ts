import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { SeoService } from './services/seo.service';
import { LanguageService } from './services/language.service';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Stats } from './components/stats/stats';
import { OfflineBanner } from './components/offline-banner/offline-banner';
import { CookieConsent } from './components/cookie-consent/cookie-consent';

@Component({ selector: 'app-header', standalone: true, template: '' })
class MockHeader {}

@Component({ selector: 'app-footer', standalone: true, template: '' })
class MockFooter {}

@Component({ selector: 'app-stats', standalone: true, template: '' })
class MockStats {}

@Component({ selector: 'app-offline-banner', standalone: true, template: '' })
class MockOfflineBanner {}

@Component({ selector: 'app-cookie-consent', standalone: true, template: '' })
class MockCookieConsent {}

function createAuthServiceStub(): Pick<
  AuthService,
  'isAuthenticated' | 'currentUser' | 'isLoading'
> {
  return {
    isAuthenticated: signal(false),
    currentUser: signal(null),
    isLoading: signal(false),
  };
}

describe('App', () => {
  const authServiceStub = createAuthServiceStub();

  beforeEach(async () => {
    TestBed.overrideComponent(App, {
      remove: {
        imports: [Header, Footer, Stats, OfflineBanner, CookieConsent],
      },
      add: {
        imports: [MockHeader, MockFooter, MockStats, MockOfflineBanner, MockCookieConsent],
      },
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
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

  it('should show stats on the home page for non-authenticated users', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app['currentRoute'].set('/');

    authServiceStub.isAuthenticated.set(false);

    expect(app['shouldShowStats']()).toBe(true);
  });

  it('should hide stats on the home page for authenticated users', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app['currentRoute'].set('/');
    authServiceStub.isAuthenticated.set(true);

    expect(app['shouldShowStats']()).toBe(false);
  });

  it('should hide stats on non-home routes even for non-authenticated users', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app['currentRoute'].set('/me');
    authServiceStub.isAuthenticated.set(false);

    expect(app['shouldShowStats']()).toBe(false);
  });
});
