import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
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

  it('should show stats on home page for authenticated users', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    // Simulate home page route
    app['currentRoute'].set('/');

    // Simulate authenticated user
    app['authService'].isAuthenticated.set(true);
    fixture.detectChanges();

    // Stats should be visible for logged-in users
    expect(app['shouldShowStats']()).toBe(true);
  });

  it('should hide stats on about page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    // Simulate about page route
    app['currentRoute'].set('/me');
    app['authService'].isAuthenticated.set(true);

    // Stats should be hidden on /me route
    expect(app['shouldShowStats']()).toBe(false);
  });

  it('should hide stats for non-authenticated users', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    // Simulate home page route
    app['currentRoute'].set('/');
    fixture.detectChanges();

    // Stats should be hidden for non-logged-in users
    expect(app['shouldShowStats']()).toBe(false);
  });
});
