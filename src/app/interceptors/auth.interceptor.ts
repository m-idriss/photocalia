import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { catchError, from, of, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth, { optional: true });

  if (!auth?.currentUser) {
    return next(req);
  }

  return from(auth.currentUser.getIdToken()).pipe(
    // Only recover from token retrieval failures. HTTP errors returned by `next`
    // must reach the caller unchanged and must never replay a conversion request.
    catchError(() => of(null)),
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
    ),
  );
};
