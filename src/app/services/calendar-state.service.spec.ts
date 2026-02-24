import { TestBed } from '@angular/core/testing';
import { CalendarStateService } from './calendar-state.service';
import { CalendarEvent } from '../models';

describe('CalendarStateService', () => {
  let service: CalendarStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarStateService);
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
});
