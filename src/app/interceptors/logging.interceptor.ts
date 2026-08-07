import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const startTime = Date.now();

  // Skip logging requests to /api/log to avoid infinite loops
  if (req.url.includes('/api/log')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error) => {
      const duration = Date.now() - startTime;
      logger.error(
        `${req.method} ${safeRequestPath(req.url)} ${error.status ?? 0} ${duration}ms`,
        'HttpClient',
        {
          statusText: error.statusText,
          message: error.message,
        },
      );
      return throwError(() => error);
    }),
  );
};

/** Strip query strings and fragments so identifiers never enter browser logs. */
export function safeRequestPath(rawUrl: string): string {
  try {
    return new URL(rawUrl, 'https://www.photocalia.com').pathname;
  } catch {
    return rawUrl.split(/[?#]/, 1)[0];
  }
}
