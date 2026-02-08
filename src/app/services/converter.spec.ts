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

    const req = httpMock.expectOne(`${environment.apiUrl}?target=converter`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.userId).toBeTruthy();
    expect(req.request.body.userId).toContain('anon_');
    expect(req.request.body.files).toEqual(testFiles);
  });
});
