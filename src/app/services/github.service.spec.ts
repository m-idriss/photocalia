import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { GithubService, GithubRelease } from './github.service';

describe('GithubService', () => {
  let service: GithubService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GithubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLatestRelease', () => {
    it('should fetch latest release from GitHub API', (done) => {
      const mockRelease: GithubRelease = {
        tag_name: 'v4.3.0',
        html_url: 'https://github.com/m-idriss/photocalia/releases/tag/v4.3.0',
        name: 'Release 4.3.0',
        published_at: '2025-01-01T00:00:00Z',
      };

      service.getLatestRelease().subscribe({
        next: (release) => {
          expect(release).toEqual(mockRelease);
          expect(release.tag_name).toBe('v4.3.0');
          done();
        },
      });

      const req = httpMock.expectOne(
        'https://api.github.com/repos/m-idriss/photocalia/releases/latest',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockRelease);
    });

    it('should return empty object on error', (done) => {
      service.getLatestRelease().subscribe({
        next: (release) => {
          expect(release).toEqual({} as GithubRelease);
          done();
        },
      });

      const req = httpMock.expectOne(
        'https://api.github.com/repos/m-idriss/photocalia/releases/latest',
      );
      req.error(new ProgressEvent('error'));
    });

    it('should share results with shareReplay for same observable', (done) => {
      const mockRelease: GithubRelease = {
        tag_name: 'v4.3.0',
        html_url: 'https://github.com/m-idriss/photocalia/releases/tag/v4.3.0',
      };

      let count = 0;

      // Same observable instance shared via shareReplay
      const release$ = service.getLatestRelease();

      release$.subscribe({
        next: () => {
          count++;
          if (count === 2) done();
        },
      });

      release$.subscribe({
        next: () => {
          count++;
          if (count === 2) done();
        },
      });

      // Only one request should be made for the same observable
      const req = httpMock.expectOne(
        'https://api.github.com/repos/m-idriss/photocalia/releases/latest',
      );
      req.flush(mockRelease);
    });
  });
});
