import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';

import { ConverterService } from './converter';

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
 *
 * @example
 * ```typescript
 * constructor(private authService: AuthService) {}
 *
 * async signIn() {
 *   await this.authService.signInWithGoogle();
 * }
 *
 * isUserLoggedIn() {
 *   return this.authService.isAuthenticated();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth: Auth | null = inject(Auth, { optional: true });
  private readonly googleProvider = this.auth ? new GoogleAuthProvider() : null;
  // Optional converter service used to clear quota cache on logout
  private readonly converterService = inject(ConverterService, { optional: true });

  // Signal for current user state
  public readonly currentUser = signal<AuthUser | null>(null);
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false); // Default to false when Firebase not available

  constructor() {
    // Only initialize auth listener if Firebase is available
    if (!this.auth) {
      console.info('Auth service running without Firebase - authentication features disabled');
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
        // Clear quota cache so UI doesn't show stale quota after logout
        try {
          this.converterService?.clearQuotaCache();
        } catch {
          // ignore
        }
      }
      this.isLoading.set(false);
    });
  }

  /**
   * Sign in with Google popup
   * Returns early if Firebase is not available
   */
  async signInWithGoogle(): Promise<void> {
    if (!this.auth || !this.googleProvider) {
      console.warn('Firebase not configured - sign in unavailable');
      return;
    }
    try {
      await signInWithPopup(this.auth, this.googleProvider);
    } catch {
      console.error('Error signing in with Google:');
      throw new Error('Sign-in failed');
    }
  }

  /**
   * Sign out the current user
   * Returns early if Firebase is not available
   */
  async signOutUser(): Promise<void> {
    if (!this.auth) {
      console.warn('Firebase not configured - sign out unavailable');
      return;
    }
    try {
      await signOut(this.auth);
      // Ensure quota cache and any UI state is cleared after sign out
      try {
        this.converterService?.clearQuotaCache();
      } catch {
        // ignore
      }
    } catch {
      console.error('Error signing out:');
      throw new Error('Sign-out failed');
    }
  }
}
