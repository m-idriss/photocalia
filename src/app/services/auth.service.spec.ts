import { TestBed } from '@angular/core/testing';
import * as firebaseAuth from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

const mockAuth = {} as Auth;

function createLogger(): jasmine.SpyObj<LoggerService> {
  return jasmine.createSpyObj('LoggerService', ['info', 'warn', 'error']);
}

function setupTestBed(logger: jasmine.SpyObj<LoggerService>): void {
  TestBed.configureTestingModule({
    providers: [
      { provide: Auth, useValue: mockAuth },
      { provide: LoggerService, useValue: logger },
    ],
  });
}

describe('AuthService', () => {
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    logger = createLogger();

    spyOn(firebaseAuth, 'onAuthStateChanged').and.returnValue(jasmine.createSpy('unsubscribe'));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
    it('should be created with Firebase', () => {
      setupTestBed(logger);
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
  });

  describe('signInWithGoogle', () => {
    it('should use signInWithPopup', async () => {
      spyOn(firebaseAuth, 'signInWithPopup').and.resolveTo(undefined as never);
      setupTestBed(logger);
      const service = TestBed.inject(AuthService);

      await service.signInWithGoogle();

      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
    });

    it('should log error with details and rethrow when sign-in fails', async () => {
      const firebaseError = new Error('auth/popup-blocked');
      spyOn(firebaseAuth, 'signInWithPopup').and.rejectWith(firebaseError);
      setupTestBed(logger);
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
