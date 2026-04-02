import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const startTime = Date.now();

  // Skip logging requests to /api/log to avoid infinite loops
  if (req.url.includes('/api/log')) {
    return next(req);
  }

  return next(req).pipe(
    tap((event) => {
      if (event.type !== 0) {
        const duration = Date.now() - startTime;
        const status = (event as { status?: number }).status ?? '';
        logger.info(`${req.method} ${req.url} ${status} ${duration}ms`, 'HttpClient');
      }
    }),
    catchError((error) => {
      const duration = Date.now() - startTime;
      logger.error(`${req.method} ${req.url} ${error.status ?? 0} ${duration}ms`, 'HttpClient', {
        statusText: error.statusText,
        message: error.message,
      });
      return throwError(() => error);
    }),
  );
};
