import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

/**
 * Authentication guard to protect routes that require user authentication.
 * Redirects to home page if user is not authenticated.
 *
 * @example
 * ```typescript
 * // In app.routes.ts
 * {
 *   path: 'me',
 *   component: About,
 *   canActivate: [authGuard]
 * }
 * ```
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to home page if not authenticated
  const logger = inject(LoggerService);
  logger.info('Access denied: User not authenticated. Redirecting to home.', 'AuthGuard');
  return router.createUrlTree(['/']);
};
