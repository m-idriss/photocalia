import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { LoggerService } from './logger.service';

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
   * Sign in with Google popup
   * Returns early if Firebase is not available
   */
  async signInWithGoogle(): Promise<void> {
    if (!this.auth || !this.googleProvider) {
      this.logger.warn('Firebase not configured - sign in unavailable', 'AuthService');
      return;
    }
    try {
      await signInWithPopup(this.auth, this.googleProvider);
    } catch {
      // Popup may be blocked (e.g. mobile Safari) — fall back to redirect
      try {
        await signInWithRedirect(this.auth, this.googleProvider);
      } catch {
        this.logger.error('Error signing in with Google', 'AuthService');
        throw new Error('Sign-in failed');
      }
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
