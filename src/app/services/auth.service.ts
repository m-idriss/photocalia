import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { LoggerService } from './logger.service';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    __PHOTOCALIA_E2E_AUTH__?: boolean;
  }
}

/**
 * Authenticated user information
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Service for managing Firebase authentication.
 * Provides Google sign-in/sign-out and reactive auth state via signals.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth: Auth | null = inject(Auth, { optional: true });
  private readonly googleProvider = this.auth ? new GoogleAuthProvider() : null;
  private readonly logger = inject(LoggerService);

  // Signal for current user state
  public readonly currentUser = signal<AuthUser | null>(null);
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false); // Default to false when Firebase not available

  constructor() {
    if (
      !environment.production &&
      typeof window !== 'undefined' &&
      window.__PHOTOCALIA_E2E_AUTH__ === true
    ) {
      this.currentUser.set({
        uid: 'e2e-user',
        email: 'e2e@photocalia.invalid',
        displayName: 'PhotoCalia E2E',
        photoURL: null,
      });
      this.isAuthenticated.set(true);
      return;
    }

    // Only initialize auth listener if Firebase is available
    if (!this.auth) {
      this.logger.info(
        'Auth service running without Firebase - authentication features disabled',
        'AuthService',
      );
      return;
    }

    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.currentUser.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        this.isAuthenticated.set(true);
      } else {
        // Clear current user and authentication flag
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      }
      this.isLoading.set(false);
    });
  }

  /**
   * Sign in with Google.
   * Uses the pre-784efd7 popup-only flow.
   * Returns early if Firebase is not available.
   */
  async signInWithGoogle(): Promise<void> {
    if (!this.auth || !this.googleProvider) {
      this.logger.warn('Firebase not configured - sign in unavailable', 'AuthService');
      return;
    }
    try {
      await signInWithPopup(this.auth, this.googleProvider);
    } catch (error) {
      this.logger.error('Error signing in with Google', 'AuthService', { error });
      throw new Error('Sign-in failed', { cause: error });
    }
  }

  /**
   * Sign out the current user
   * Returns early if Firebase is not available
   */
  async signOutUser(): Promise<void> {
    if (!this.auth) {
      this.logger.warn('Firebase not configured - sign out unavailable', 'AuthService');
      return;
    }
    try {
      await signOut(this.auth);
    } catch {
      this.logger.error('Error signing out', 'AuthService');
      throw new Error('Sign-out failed');
    }
  }
}
