import { TestBed } from '@angular/core/testing';
import { InstallationIdentityService } from './installation-identity.service';

describe('InstallationIdentityService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('persists one opaque identifier across service instances', () => {
    const first = TestBed.inject(InstallationIdentityService).getId();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const second = TestBed.inject(InstallationIdentityService).getId();

    expect(first).toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9_-]{20,128}$/);
  });

  it('replaces an invalid stored identifier', () => {
    localStorage.setItem('photocalia_installation_id_v1', 'invalid');

    const identifier = TestBed.inject(InstallationIdentityService).getId();

    expect(identifier).not.toBe('invalid');
    expect(identifier.length).toBeGreaterThanOrEqual(20);
  });
});
