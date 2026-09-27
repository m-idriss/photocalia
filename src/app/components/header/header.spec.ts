import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Header } from './header';
import { AuthService } from '../../services/auth.service';

@Component({ template: '' })
class EmptyPage {}

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([{ path: '**', component: EmptyPage }])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render logo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo')).toBeTruthy();
  });

  it('should render navigation menu', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navMenu = compiled.querySelector('.nav-menu');
    expect(navMenu).toBeTruthy();
  });

  it('updates reciprocal language links after client navigation without query strings', async () => {
    await TestBed.inject(Router).navigateByUrl('/fr/pdf-to-calendar?source=test#intro');
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('a[hreflang="en"]')?.getAttribute('href')).toBe('/pdf-to-calendar');
    expect(page.querySelector('a[hreflang="fr"]')?.getAttribute('href')).toBe(
      '/fr/pdf-to-calendar',
    );
  });

  it('preserves converter state with client navigation while allowing modified clicks', () => {
    const setLanguage = spyOn(component, 'setLanguage');
    const plain = new MouseEvent('click', { cancelable: true });
    component.onLanguageClick(plain, 'fr');
    expect(plain.defaultPrevented).toBeTrue();
    expect(setLanguage).toHaveBeenCalledOnceWith('fr');
    setLanguage.calls.reset();
    const modified = new MouseEvent('click', { cancelable: true, metaKey: true });
    component.onLanguageClick(modified, 'fr');
    expect(modified.defaultPrevented).toBeFalse();
    expect(setLanguage).not.toHaveBeenCalled();
  });

  describe('avatar fallback', () => {
    let authService: AuthService;

    beforeEach(() => {
      authService = TestBed.inject(AuthService);
    });

    it('shouldShowAvatarImage returns true when user has a photoURL', () => {
      authService.currentUser.set({
        uid: '1',
        displayName: 'Jane Doe',
        email: 'jane@example.com',
        photoURL: 'https://example.com/photo.jpg',
      });
      expect(component['shouldShowAvatarImage']()).toBeTrue();
    });

    it('shouldShowAvatarImage returns false when user has no photoURL', () => {
      authService.currentUser.set({
        uid: '1',
        displayName: 'Jane Doe',
        email: 'jane@example.com',
        photoURL: null,
      });
      expect(component['shouldShowAvatarImage']()).toBeFalse();
    });

    it('shouldShowAvatarImage returns false after onAvatarError()', () => {
      authService.currentUser.set({
        uid: '1',
        displayName: 'Jane Doe',
        email: 'jane@example.com',
        photoURL: 'https://example.com/photo.jpg',
      });
      component['onAvatarError']();
      expect(component['shouldShowAvatarImage']()).toBeFalse();
    });

    it('userInitials returns initials from displayName', () => {
      authService.currentUser.set({
        uid: '1',
        displayName: 'Jane Doe',
        email: null,
        photoURL: null,
      });
      expect(component['userInitials']()).toBe('JD');
    });

    it('userInitials returns initials from email when displayName is absent', () => {
      authService.currentUser.set({
        uid: '1',
        displayName: null,
        email: 'jane@example.com',
        photoURL: null,
      });
      expect(component['userInitials']()).toBe('JE');
    });

    it('userInitials returns U when no user is set', () => {
      authService.currentUser.set(null);
      expect(component['userInitials']()).toBe('U');
    });

    it('renders initials fallback after avatar image error', () => {
      authService.isAuthenticated.set(true);
      authService.currentUser.set({
        uid: '1',
        displayName: 'Jane Doe',
        email: 'jane@example.com',
        photoURL: 'https://example.com/photo.jpg',
      });
      fixture.detectChanges();

      component['onAvatarError']();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const fallback = compiled.querySelector('.user-avatar-fallback');
      expect(fallback).toBeTruthy();
      expect(fallback?.textContent?.trim()).toBe('JD');
    });
  });
});
