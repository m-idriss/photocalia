import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Header } from './header';
import { AuthService } from '../../services/auth.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
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
