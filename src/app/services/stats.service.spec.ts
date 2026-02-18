import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { StatsService, Statistics } from './stats.service';
import { environment } from '../../environments/environment';

describe('StatsService', () => {
  let service: StatsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), StatsService],
    });
    service = TestBed.inject(StatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStatistics', () => {
    it('should fetch statistics from API', (done) => {
      const mockStats: Statistics = {
        fileCount: 1500,
        eventCount: 3000,
      };

      service.getStatistics().subscribe({
        next: (stats) => {
          expect(stats).toEqual(mockStats);
          expect(stats.fileCount).toBe(1500);
          expect(stats.eventCount).toBe(3000);
          done();
        },
        error: () => fail('Should not error'),
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/converter/statistics`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('should return default values on API error', (done) => {
      service.getStatistics().subscribe({
        next: (stats) => {
          expect(stats.fileCount).toBe(0);
          expect(stats.eventCount).toBe(0);
          expect(stats.message).toBe('Statistics unavailable');
          done();
        },
        error: () => fail('Should not error'),
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/converter/statistics`);
      req.error(new ProgressEvent('error'));
    });

    it('should cache results (shareReplay)', (done) => {
      const mockStats: Statistics = {
        fileCount: 100,
        eventCount: 200,
      };

      let emissionCount = 0;
      const expectedEmissions = 2;

      const checkComplete = () => {
        emissionCount++;
        if (emissionCount === expectedEmissions) {
          done();
        }
      };

      // First subscription
      service.getStatistics().subscribe({
        next: (stats) => {
          expect(stats).toEqual(mockStats);
          checkComplete();
        },
      });

      // Second subscription (should use cache, not make new request)
      service.getStatistics().subscribe({
        next: (stats) => {
          expect(stats).toEqual(mockStats);
          checkComplete();
        },
      });

      // Only one HTTP request should be made
      const req = httpMock.expectOne(`${environment.apiUrl}/converter/statistics`);
      req.flush(mockStats);
    });
  });

  describe('refreshStatistics', () => {
    it('should clear cache and allow new request', (done) => {
      const mockStats: Statistics = {
        fileCount: 100,
        eventCount: 200,
      };

      // First request
      service.getStatistics().subscribe({
        next: (stats) => {
          expect(stats).toEqual(mockStats);
        },
      });
      let req = httpMock.expectOne(`${environment.apiUrl}/converter/statistics`);
      req.flush(mockStats);

      // Clear cache
      service.refreshStatistics();

      // Second request should make a new HTTP call
      service.getStatistics().subscribe({
        next: (stats) => {
          expect(stats).toEqual(mockStats);
          done();
        },
      });
      req = httpMock.expectOne(`${environment.apiUrl}/converter/statistics`);
      req.flush(mockStats);
    });
  });
});
