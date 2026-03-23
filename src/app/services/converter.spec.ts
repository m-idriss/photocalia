import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Auth } from '@angular/fire/auth';

import { ConverterService, FileData, QuotaStatusResponse } from './converter';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

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
    expect(req.request.body.files).toEqual(testFiles);
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
    const cached = {
      success: true,
      enabled: true,
      quota: { usageCount: 2, limit: 10, remaining: 8, plan: 'FREE' },
    };
    localStorage.setItem(
      'photocalia_quota_cache_v1',
      JSON.stringify({ ts: Date.now(), data: cached }),
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
