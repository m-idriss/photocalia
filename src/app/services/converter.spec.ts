import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { ConverterService, FileData } from './converter';
import { environment } from '../../environments/environment';

describe('ConverterService', () => {
  let service: ConverterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ConverterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate and store userId on initialization', () => {
    // Access private userId through type assertion
    const userId = (service as unknown as { userId: string }).userId;
    expect(userId).toBeTruthy();
    expect(userId).toContain('anon_');

    // Check localStorage was updated with correct key
    const storedId = localStorage.getItem('photocalia_anonymous_id');
    expect(storedId).toBe(userId);
  });

  it('should reuse existing userId from localStorage', () => {
    // Clear existing service and set a userId in localStorage with correct key
    const existingId = 'anon_test_12345';
    localStorage.setItem('photocalia_anonymous_id', existingId);

    // Create new TestBed configuration with fresh service
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const newService = TestBed.inject(ConverterService);
    const userId = (newService as unknown as { userId: string }).userId;

    expect(userId).toBe(existingId);
  });

  it('should include userId in conversion requests', () => {
    const testFiles: FileData[] = [
      { dataUrl: 'data:image/png;base64,test', name: 'test.png', type: 'image/png' },
    ];

    service.convertToIcs(testFiles).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/converter`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.userId).toBeTruthy();
    expect(req.request.body.userId).toContain('anon_');
    expect(req.request.body.files).toEqual(testFiles);
  });

  it('maps simple remaining/limit shape to normalized response', (done) => {
    const mock = { remaining: 5, limit: 20 };

    service.getQuotaStatus().subscribe((res: any) => {
      expect(res.success).toBeTrue();
      expect(res.quota.remaining).toBe(5);
      expect(res.quota.limit).toBe(20);
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('/converter/quota-status'));
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('includes Authorization header when token available', (done) => {
    // Provide a fake auth object on the service with currentUser.getIdToken
    (service as any).auth = { currentUser: { getIdToken: () => Promise.resolve('fake-token') } };

    service.getQuotaStatus().subscribe(() => done());

    const req = httpMock.expectOne((r) => r.url.includes('/converter/quota-status'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush({ remaining: 1, limit: 10 });
  });

  it('returns cached value on HTTP error', (done) => {
    // Prime cache
    const cached = {
      success: true,
      enabled: true,
      quota: { usageCount: 2, limit: 10, remaining: 8, plan: 'FREE' },
    };
    localStorage.setItem('photocalia_quota_cache_v1', JSON.stringify({ ts: Date.now(), data: cached }));

    service.getQuotaStatus().subscribe((res) => {
      expect(res).toEqual(cached);
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('/converter/quota-status'));
    req.flush('Server error', { status: 500, statusText: 'Server Error' });
  });
});
