import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import * as firebaseAuth from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

const mockAuth = {} as Auth;

function createLogger(): jasmine.SpyObj<LoggerService> {
  return jasmine.createSpyObj('LoggerService', ['info', 'warn', 'error']);
}

function setupTestBed(platformId: string, logger: jasmine.SpyObj<LoggerService>): void {
  TestBed.configureTestingModule({
    providers: [
      { provide: Auth, useValue: mockAuth },
      { provide: LoggerService, useValue: logger },
      { provide: PLATFORM_ID, useValue: platformId },
    ],
  });
}

describe('AuthService', () => {
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    logger = createLogger();

    // Stub firebase functions used during construction
    spyOn(firebaseAuth, 'getRedirectResult').and.resolveTo(null);
    spyOn(firebaseAuth, 'onAuthStateChanged').and.returnValue(jasmine.createSpy('unsubscribe'));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
    it('should be created with Firebase', () => {
      setupTestBed('browser', logger);
      const service = TestBed.inject(AuthService);
      expect(service).toBeTruthy();
    });

    it('should log info when Firebase is not configured', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: LoggerService, useValue: logger }],
        // Auth not provided so it resolves to null
      });
      TestBed.inject(AuthService);
      expect(logger.info).toHaveBeenCalledWith(
        jasmine.stringContaining('without Firebase'),
        'AuthService',
      );
    });

    it('should call getRedirectResult on browser platform', fakeAsync(() => {
      setupTestBed('browser', logger);
      TestBed.inject(AuthService);
      flushMicrotasks();
      expect(firebaseAuth.getRedirectResult).toHaveBeenCalledWith(mockAuth);
    }));

    it('should NOT call getRedirectResult on server platform (SSR guard)', fakeAsync(() => {
      setupTestBed('server', logger);
      TestBed.inject(AuthService);
      flushMicrotasks();
      expect(firebaseAuth.getRedirectResult).not.toHaveBeenCalled();
    }));

    it('should log success when redirect result contains a user', fakeAsync(() => {
      (firebaseAuth.getRedirectResult as jasmine.Spy).and.resolveTo({
        user: { uid: 'test-uid' },
      } as never);
      setupTestBed('browser', logger);
      TestBed.inject(AuthService);
      flushMicrotasks();
      expect(logger.info).toHaveBeenCalledWith('Sign-in via redirect successful', 'AuthService');
    }));

    it('should log error when getRedirectResult rejects', fakeAsync(() => {
      const redirectError = new Error('auth/invalid-credential');
      (firebaseAuth.getRedirectResult as jasmine.Spy).and.rejectWith(redirectError);
      setupTestBed('browser', logger);
      TestBed.inject(AuthService);
      flushMicrotasks();
      expect(logger.error).toHaveBeenCalledWith(
        'Error completing sign-in redirect',
        'AuthService',
        jasmine.objectContaining({ error: redirectError }),
      );
    }));
  });

  describe('isCoarsePointer (touch device detection)', () => {
    it('should return false on a fine-pointer (desktop) device', () => {
      spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
      setupTestBed('browser', logger);
      const service = TestBed.inject(AuthService);
      const result = (service as unknown as { isCoarsePointer: () => boolean }).isCoarsePointer();
      expect(result).toBeFalse();
    });

    it('should return true on a coarse-pointer (touch) device', () => {
      spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
      setupTestBed('browser', logger);
      const service = TestBed.inject(AuthService);
      const result = (service as unknown as { isCoarsePointer: () => boolean }).isCoarsePointer();
      expect(result).toBeTrue();
    });

    it('should return false when running server-side (SSR guard)', () => {
      setupTestBed('server', logger);
      const service = TestBed.inject(AuthService);
      const result = (service as unknown as { isCoarsePointer: () => boolean }).isCoarsePointer();
      expect(result).toBeFalse();
    });
  });

  describe('signInWithGoogle', () => {
    it('should use signInWithPopup on fine-pointer (desktop) devices', async () => {
      spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
      spyOn(firebaseAuth, 'signInWithPopup').and.resolveTo(undefined as never);
      spyOn(firebaseAuth, 'signInWithRedirect').and.resolveTo(undefined as never);
      setupTestBed('browser', logger);
      const service = TestBed.inject(AuthService);

      await service.signInWithGoogle();

      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      expect(firebaseAuth.signInWithRedirect).not.toHaveBeenCalled();
    });

    it('should use signInWithRedirect on coarse-pointer (touch) devices', async () => {
      spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
      spyOn(firebaseAuth, 'signInWithPopup').and.resolveTo(undefined as never);
      spyOn(firebaseAuth, 'signInWithRedirect').and.resolveTo(undefined as never);
      setupTestBed('browser', logger);
      const service = TestBed.inject(AuthService);

      await service.signInWithGoogle();

      expect(firebaseAuth.signInWithRedirect).toHaveBeenCalled();
      expect(firebaseAuth.signInWithPopup).not.toHaveBeenCalled();
    });

    it('should log error with details and rethrow when sign-in fails', async () => {
      const firebaseError = new Error('auth/popup-blocked');
      spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
      spyOn(firebaseAuth, 'signInWithPopup').and.rejectWith(firebaseError);
      setupTestBed('browser', logger);
      const service = TestBed.inject(AuthService);

      await expectAsync(service.signInWithGoogle()).toBeRejectedWithError('Sign-in failed');
      expect(logger.error).toHaveBeenCalledWith(
        'Error signing in with Google',
        'AuthService',
        jasmine.objectContaining({ error: firebaseError }),
      );
    });

    it('should warn and return early when Firebase is not configured', async () => {
      TestBed.configureTestingModule({
        providers: [{ provide: LoggerService, useValue: logger }],
      });
      const service = TestBed.inject(AuthService);

      await service.signInWithGoogle();

      expect(logger.warn).toHaveBeenCalledWith(
        'Firebase not configured - sign in unavailable',
        'AuthService',
      );
    });
  });
});
