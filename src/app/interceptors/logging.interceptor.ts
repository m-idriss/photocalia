import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { tap, catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformServer(platformId)) {
    return next(req);
  }

  const logger = inject(LoggerService);
  const startTime = Date.now();

  return next(req).pipe(
    tap((event) => {
      if (event.type !== 0) {
        const duration = Date.now() - startTime;
        logger.info(`${req.method} ${req.url} ${(event as { status?: number }).status ?? ''} ${duration}ms`, 'HttpClient');
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
