import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Auth } from '@angular/fire/auth';

import { ConverterService, FileData, QuotaStatusResponse } from './converter';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { InstallationIdentityService } from './installation-identity.service';

describe('ConverterService', () => {
  let service: ConverterService;
  let httpMock: HttpTestingController;
  let mockAuthService: { currentUser: ReturnType<typeof signal> };

  function configure(authValue?: Partial<Auth>): void {
    mockAuthService = { currentUser: signal(null) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        ...(authValue ? [{ provide: Auth, useValue: authValue }] : []),
      ],
    });

    service = TestBed.inject(ConverterService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    localStorage.clear();
    configure();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
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
    const existingId = 'anon_test_12345';
    localStorage.setItem('photocalia_anonymous_id', existingId);

    TestBed.resetTestingModule();
    configure();
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
    expect(req.request.body.files).toEqual([{ dataUrl: 'data:image/png;base64,test' }]);
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(req.request.headers.get('X-Installation-ID')).toMatch(/^[A-Za-z0-9_-]{20,128}$/);
  });

  it('should use a new idempotency key for each conversion', () => {
    const testFiles: FileData[] = [
      { dataUrl: 'data:image/png;base64,test', name: 'test.png', type: 'image/png' },
    ];

    service.convertToIcs(testFiles).subscribe();
    service.convertToIcs(testFiles).subscribe();

    const requests = httpMock.match(`${environment.apiUrl}/converter`);
    expect(requests.length).toBe(2);
    expect(requests[0].request.headers.get('Idempotency-Key')).not.toBe(
      requests[1].request.headers.get('Idempotency-Key'),
    );
  });

  it('should reuse the idempotency key when the same conversion request is retried', () => {
    const testFiles: FileData[] = [
      { dataUrl: 'data:image/png;base64,test', name: 'test.png', type: 'image/png' },
    ];
    const conversionRequest = service.convertToIcs(testFiles);

    conversionRequest.subscribe();
    conversionRequest.subscribe();

    const requests = httpMock.match(`${environment.apiUrl}/converter`);
    expect(requests.length).toBe(2);
    expect(requests[0].request.headers.get('Idempotency-Key')).toBe(
      requests[1].request.headers.get('Idempotency-Key'),
    );
  });

  it('maps simple remaining/limit shape to normalized response', fakeAsync(() => {
    const mock = { remaining: 5, limit: 20 };
    let response: QuotaStatusResponse | undefined;

    service.getQuotaStatus().subscribe((res) => {
      response = res;
    });

    flushMicrotasks();
    const req = httpMock.expectOne((r) => r.url.includes('/converter/quota-status'));
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Installation-ID')).toMatch(/^[A-Za-z0-9_-]{20,128}$/);
    req.flush(mock);
    flushMicrotasks();

    expect(response?.success).toBeTrue();
    expect(response?.quota.remaining).toBe(5);
    expect(response?.quota.limit).toBe(20);
  }));

  it('includes Authorization header when token available', fakeAsync(() => {
    TestBed.resetTestingModule();
    configure({
      currentUser: { getIdToken: () => Promise.resolve('fake-token') } as Auth['currentUser'],
    });

    service.getQuotaStatus().subscribe();

    flushMicrotasks();
    const req = httpMock.expectOne((r) => r.url.includes('/converter/quota-status'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush({ remaining: 1, limit: 10 });
    flushMicrotasks();
  }));

  it('returns cached value on HTTP error', fakeAsync(() => {
    const cached: QuotaStatusResponse = {
      success: true,
      enabled: true,
      quota: { usageCount: 2, limit: 10, remaining: 8, plan: 'FREE' },
    };
    const installationId = TestBed.inject(InstallationIdentityService).getId();
    const userId = service.getUserId();
    localStorage.setItem(
      'photocalia_quota_cache_v2',
      JSON.stringify({ ts: Date.now(), userId, installationId, data: cached }),
    );
    let response: QuotaStatusResponse | undefined;

    service.getQuotaStatus().subscribe((res) => {
      response = res;
    });

    flushMicrotasks();
    const req = httpMock.expectOne((r) => r.url.includes('/converter/quota-status'));
    req.flush('Server error', { status: 500, statusText: 'Server Error' });
    flushMicrotasks();

    expect(response).toEqual(cached);
  }));
});
