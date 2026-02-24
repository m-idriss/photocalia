import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no messages', () => {
    expect(service.successMessage()).toBeNull();
    expect(service.errorMessage()).toBeNull();
  });

  describe('showSuccess', () => {
    it('should set success message', () => {
      service.showSuccess('Operation completed');
      expect(service.successMessage()).toBe('Operation completed');
    });
  });

  describe('showError', () => {
    it('should set error message', () => {
      service.showError('Something went wrong');
      expect(service.errorMessage()).toBe('Something went wrong');
    });
  });

  describe('clearSuccess', () => {
    it('should clear success message', () => {
      service.showSuccess('Test');
      service.clearSuccess();
      expect(service.successMessage()).toBeNull();
    });

    it('should not affect error message', () => {
      service.showError('Error');
      service.showSuccess('Success');
      service.clearSuccess();
      expect(service.errorMessage()).toBe('Error');
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      service.showError('Test');
      service.clearError();
      expect(service.errorMessage()).toBeNull();
    });

    it('should not affect success message', () => {
      service.showSuccess('Success');
      service.showError('Error');
      service.clearError();
      expect(service.successMessage()).toBe('Success');
    });
  });

  describe('clearAll', () => {
    it('should clear both messages', () => {
      service.showSuccess('Success');
      service.showError('Error');
      service.clearAll();
      expect(service.successMessage()).toBeNull();
      expect(service.errorMessage()).toBeNull();
    });
  });
});
