import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap, catchError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth, { optional: true });

  if (!auth?.currentUser) {
    return next(req);
  }

  return from(auth.currentUser.getIdToken()).pipe(
    switchMap((token) => {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(authReq);
    }),
    catchError(() => next(req)),
  );
};
