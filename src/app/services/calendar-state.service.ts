import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CalendarEvent } from '../models';

const STORAGE_KEY = 'photocalia_conversion_state_v1';

interface PersistedState {
  events: CalendarEvent[];
  icsContent: string | null;
  calendarVisible: boolean;
  timestamp: number;
}

/**
 * Service to manage calendar view state globally
 * This allows the calendar view to be rendered at app level while being controlled from converter
 * Persists conversion results to sessionStorage so they survive page refreshes
 */
@Injectable({
  providedIn: 'root',
})
export class CalendarStateService {
  private readonly platformId = inject(PLATFORM_ID);

  // Calendar visibility state
  readonly isVisible = signal(false);

  // Calendar events
  readonly events = signal<CalendarEvent[]>([]);

  // ICS content
  readonly icsContent = signal<string | null>(null);

  // Whether user has confirmed extraction accuracy
  readonly extractionConfirmed = signal(false);

  // Export request counter — consumers use effect() to react to changes
  readonly exportRequestCount = signal(0);

  // Navigate-to-date request — calendar view reacts to changes
  readonly navigateToDate = signal<Date | null>(null);

  constructor() {
    this.restoreState();
  }

  /**
   * Show the calendar view with given events
   */
  showCalendar(events: CalendarEvent[]): void {
    this.events.set(events);
    this.isVisible.set(true);
    this.persistState();
  }

  /**
   * Hide the calendar view
   */
  hideCalendar(): void {
    this.isVisible.set(false);
    this.persistState();
  }

  /**
   * Update calendar events
   */
  updateEvents(events: CalendarEvent[]): void {
    this.events.set(events);
    this.persistState();
  }

  /**
   * Update ICS content
   */
  updateIcsContent(icsContent: string | null): void {
    this.icsContent.set(icsContent);
    this.persistState();
  }

  /**
   * Request calendar to navigate to a specific date
   */
  goToDate(date: Date): void {
    this.navigateToDate.set(date);
  }

  /**
   * Request export of calendar events
   */
  requestExport(): void {
    this.exportRequestCount.update((count) => count + 1);
  }

  /**
   * Clear all persisted state
   */
  clearState(): void {
    this.events.set([]);
    this.icsContent.set(null);
    this.isVisible.set(false);
    this.extractionConfirmed.set(false);
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors (private mode, etc.)
      }
    }
  }

  /**
   * Persist current state to sessionStorage
   */
  private persistState(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const state: PersistedState = {
        events: this.events().map((e) => ({
          summary: e.summary,
          description: e.description,
          location: e.location,
          start: e.start instanceof Date ? e.start.toISOString() : e.start,
          end: e.end instanceof Date ? e.end.toISOString() : e.end,
        })),
        icsContent: this.icsContent(),
        calendarVisible: this.isVisible(),
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors (quota exceeded, private mode, etc.)
    }
  }

  /**
   * Restore state from sessionStorage
   */
  private restoreState(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const state: PersistedState = JSON.parse(stored);

      // Ignore stale data older than 24 hours
      if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      if (state.events?.length > 0) {
        // Convert date strings back to Date objects
        const events = state.events.map((e) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        this.events.set(events);
        this.icsContent.set(state.icsContent);
        if (state.calendarVisible) {
          this.isVisible.set(true);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }
}
