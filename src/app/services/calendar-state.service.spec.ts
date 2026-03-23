import { TestBed } from '@angular/core/testing';
import { CalendarStateService } from './calendar-state.service';
import { CalendarEvent } from '../models';

describe('CalendarStateService', () => {
  let service: CalendarStateService;

  const STORAGE_KEY = 'photocalia_conversion_state_v1';

  function createService(): CalendarStateService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(CalendarStateService);
  }

  beforeEach(() => {
    sessionStorage.clear();
    service = createService();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with calendar hidden', () => {
    expect(service.isVisible()).toBe(false);
  });

  it('should start with no events', () => {
    expect(service.events()).toEqual([]);
  });

  it('should start with export request count at 0', () => {
    expect(service.exportRequestCount()).toBe(0);
  });

  describe('showCalendar', () => {
    it('should set events and make calendar visible', () => {
      const events: CalendarEvent[] = [
        { summary: 'Test Event', start: '2025-01-01', end: '2025-01-02' },
      ];

      service.showCalendar(events);

      expect(service.events()).toEqual(events);
      expect(service.isVisible()).toBe(true);
    });

    it('should replace existing events', () => {
      const events1: CalendarEvent[] = [
        { summary: 'Event 1', start: '2025-01-01', end: '2025-01-02' },
      ];
      const events2: CalendarEvent[] = [
        { summary: 'Event 2', start: '2025-02-01', end: '2025-02-02' },
      ];

      service.showCalendar(events1);
      service.showCalendar(events2);

      expect(service.events()).toEqual(events2);
    });
  });

  describe('hideCalendar', () => {
    it('should set calendar to not visible', () => {
      service.showCalendar([]);
      expect(service.isVisible()).toBe(true);

      service.hideCalendar();
      expect(service.isVisible()).toBe(false);
    });
  });

  describe('updateEvents', () => {
    it('should update events without changing visibility', () => {
      const events: CalendarEvent[] = [
        { summary: 'Updated Event', start: '2025-03-01', end: '2025-03-02' },
      ];

      service.updateEvents(events);

      expect(service.events()).toEqual(events);
      expect(service.isVisible()).toBe(false);
    });
  });

  describe('requestExport', () => {
    it('should increment export request count', () => {
      expect(service.exportRequestCount()).toBe(0);

      service.requestExport();
      expect(service.exportRequestCount()).toBe(1);

      service.requestExport();
      expect(service.exportRequestCount()).toBe(2);
    });
  });

  describe('restoreState', () => {
    it('should restore persisted events, ICS content, and visibility from sessionStorage', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          events: [
            {
              summary: 'Persisted Event',
              start: '2025-01-01T09:00:00.000Z',
              end: '2025-01-01T10:00:00.000Z',
            },
          ],
          icsContent: 'BEGIN:VCALENDAR',
          calendarVisible: true,
          timestamp: Date.now(),
        }),
      );

      const restoredService = createService();
      const [event] = restoredService.events();

      expect(restoredService.isVisible()).toBe(true);
      expect(restoredService.icsContent()).toBe('BEGIN:VCALENDAR');
      expect(restoredService.events().length).toBe(1);
      expect(event.summary).toBe('Persisted Event');
      expect(event.start instanceof Date).toBe(true);
      expect(event.end instanceof Date).toBe(true);
    });

    it('should ignore stale persisted state older than 24 hours', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          events: [{ summary: 'Old Event', start: '2025-01-01', end: '2025-01-02' }],
          icsContent: 'BEGIN:VCALENDAR',
          calendarVisible: true,
          timestamp: Date.now() - 25 * 60 * 60 * 1000,
        }),
      );

      const restoredService = createService();

      expect(restoredService.events()).toEqual([]);
      expect(restoredService.isVisible()).toBe(false);
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('clearState', () => {
    it('should reset signals and remove persisted state', () => {
      const events: CalendarEvent[] = [
        { summary: 'Persisted Event', start: '2025-01-01', end: '2025-01-02' },
      ];

      service.showCalendar(events);
      service.updateIcsContent('BEGIN:VCALENDAR');
      service.extractionConfirmed.set(true);

      expect(sessionStorage.getItem(STORAGE_KEY)).toBeTruthy();

      service.clearState();

      expect(service.events()).toEqual([]);
      expect(service.icsContent()).toBeNull();
      expect(service.isVisible()).toBe(false);
      expect(service.extractionConfirmed()).toBe(false);
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
