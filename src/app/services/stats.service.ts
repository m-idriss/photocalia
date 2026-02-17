import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, catchError, timeout } from 'rxjs/operators';

import { environment } from '../../environments/environment';

/**
 * Timeout for API calls in milliseconds.
 * Ensures components don't hang indefinitely waiting for API responses.
 */
const API_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Statistics data interface
 */
export interface Statistics {
  fileCount: number;
  eventCount: number;
  message?: string;
}

/**
 * Service for fetching platform statistics (file and event counts).
 * Uses caching with shareReplay to prevent duplicate API calls.
 *
 * @example
 * ```typescript
 * constructor(private statsService: StatsService) {}
 *
 * ngOnInit() {
 *   this.statsService.getStatistics().subscribe(stats => {
 *     console.log(`Files: ${stats.fileCount}, Events: ${stats.eventCount}`);
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private readonly http = inject(HttpClient);

  private readonly endpoint = `${environment.apiUrl}/statistics`;
  private statistics$?: Observable<Statistics>;

  /**
   * Get platform statistics (file count and event count).
   * Caches the result to prevent duplicate API calls.
   * Includes timeout to prevent hanging in restrictive network environments.
   *
   * @returns Observable of statistics data (returns default values on timeout/error)
   */
  getStatistics(): Observable<Statistics> {
    this.statistics$ ??= this.http.get<Statistics>(this.endpoint).pipe(
      timeout(API_TIMEOUT_MS),
      catchError((err) => {
        console.warn('Statistics API call failed or timed out:', err.message || err);
        return of({ fileCount: 0, eventCount: 0, message: 'Statistics unavailable' });
      }),
      shareReplay(1),
    );
    return this.statistics$;
  }

  /**
   * Clear cached statistics to force a refresh on next request.
   */
  refreshStatistics(): void {
    this.statistics$ = undefined;
  }
}
