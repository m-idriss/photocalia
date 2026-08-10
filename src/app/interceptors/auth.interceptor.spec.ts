import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { firstValueFrom, of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const request = new HttpRequest('POST', '/api/convert', {});

  function configure(getIdToken: () => Promise<string>): void {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Auth,
          useValue: { currentUser: { getIdToken } },
        },
      ],
    });
  }

  it('forwards an authenticated HTTP failure without replaying the request', async () => {
    configure(() => Promise.resolve('firebase-token'));
    const backendError = new HttpErrorResponse({
      status: 422,
      error: { errorCode: 'PROCESSING_ERROR' },
    });
    const next = jasmine.createSpy('next').and.returnValue(throwError(() => backendError));

    await expectAsync(
      firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, next))),
    ).toBeRejectedWith(backendError);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.calls.mostRecent().args[0].headers.get('Authorization')).toBe(
      'Bearer firebase-token',
    );
  });

  it('sends one unauthenticated request when token retrieval fails', async () => {
    configure(() => Promise.reject(new Error('token unavailable')));
    const next = jasmine.createSpy('next').and.returnValue(of(new HttpResponse({ status: 200 })));

    await firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, next)));

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.calls.mostRecent().args[0].headers.has('Authorization')).toBeFalse();
  });
});
