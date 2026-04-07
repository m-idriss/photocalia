import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

function createLogger(): jasmine.SpyObj<LoggerService> {
  return jasmine.createSpyObj('LoggerService', ['info', 'warn', 'error']);
}

describe('AuthService', () => {
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    logger = createLogger();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
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

  describe('signOutUser', () => {
    it('should warn and return early when Firebase is not configured', async () => {
      TestBed.configureTestingModule({
        providers: [{ provide: LoggerService, useValue: logger }],
      });
      const service = TestBed.inject(AuthService);

      await service.signOutUser();

      expect(logger.warn).toHaveBeenCalledWith(
        'Firebase not configured - sign out unavailable',
        'AuthService',
      );
    });
  });
});
