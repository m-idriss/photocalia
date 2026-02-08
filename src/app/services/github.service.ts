import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, catchError, timeout } from 'rxjs/operators';

/**
 * Timeout for API calls in milliseconds.
 * Ensures components don't hang indefinitely waiting for API responses.
 */
const API_TIMEOUT_MS = 10000; // 10 seconds

/**
 * GitHub release interface
 */
export interface GithubRelease {
  tag_name: string;
  html_url: string;
  name?: string;
  published_at?: string;
}

/**
 * Service for fetching GitHub release data.
 * Uses caching with shareReplay to prevent duplicate API calls.
 */
@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private readonly http = inject(HttpClient);

  /**
   * Get latest release from GitHub repository.
   * Fetches directly from GitHub API for version display in footer.
   * Includes timeout to prevent hanging in restrictive network environments.
   *
   * @returns Observable of GitHub release data (returns empty object on timeout/error)
   */
  getLatestRelease(): Observable<GithubRelease> {
    const url = 'https://api.github.com/repos/m-idriss/photocalia/releases/latest';
    return this.http.get<GithubRelease>(url).pipe(
      timeout(API_TIMEOUT_MS),
      catchError((err) => {
        console.warn('Release API call failed or timed out:', err.message || err);
        return of({} as GithubRelease);
      }),
      shareReplay(1),
    );
  }
}
