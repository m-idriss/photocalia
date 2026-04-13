import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Converter } from './converter';
import { ConverterService } from '../../services/converter';
import { CalendarEvent } from '../../models';

describe('Converter', () => {
  let component: Converter;
  let fixture: ComponentFixture<Converter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Converter],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Converter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset state when resetState is called', () => {
    // Setup initial state
    component['files'].set([new File(['test'], 'test.jpg', { type: 'image/jpeg' })]);
    component['extractedEvents'].set([
      {
        summary: 'Test Event',
        start: new Date('2025-01-15T10:00:00'),
        end: new Date('2025-01-15T11:00:00'),
      },
    ]);
    component['icsContent'].set('BEGIN:VCALENDAR\nEND:VCALENDAR');
    component['isProcessing'].set(true);
    component['isBatchMode'].set(true);

    // Call resetState
    component['resetState']();

    // Verify all state is cleared
    expect(component['files']().length).toBe(0);
    expect(component['extractedEvents']().length).toBe(0);
    expect(component['icsContent']()).toBeNull();
    expect(component['isProcessing']()).toBe(false);
    expect(component['isBatchMode']()).toBe(false);
  });

  describe('Event Editing', () => {
    beforeEach(() => {
      // Setup test events
      const testEvents: CalendarEvent[] = [
        {
          summary: 'Test Event 1',
          start: new Date('2025-01-15T10:00:00'),
          end: new Date('2025-01-15T11:00:00'),
          location: 'Test Location',
          description: 'Test Description',
          isEditing: false,
        },
        {
          summary: 'Test Event 2',
          start: new Date('2025-01-16T14:00:00'),
          end: new Date('2025-01-16T15:00:00'),
          isEditing: false,
        },
      ];
      component['extractedEvents'].set(testEvents);
    });

    it('should enable edit mode for an event', () => {
      component['editEvent'](0);
      const events = component['extractedEvents']();
      expect(events[0].isEditing).toBe(true);
      expect(events[1].isEditing).toBe(false);
    });

    it('should disable edit mode when saving', () => {
      component['editEvent'](0);
      component['saveEvent'](0);
      const events = component['extractedEvents']();
      expect(events[0].isEditing).toBe(false);
    });

    it('should disable edit mode when canceling', () => {
      component['editEvent'](0);
      component['cancelEdit'](0);
      const events = component['extractedEvents']();
      expect(events[0].isEditing).toBe(false);
    });

    it('should delete an event', () => {
      const initialCount = component['extractedEvents']().length;
      component['deleteEvent'](0);
      const events = component['extractedEvents']();
      expect(events.length).toBe(initialCount - 1);
      expect(events[0].summary).toBe('Test Event 2');
    });

    it('should update event field', () => {
      component['updateEventField'](0, 'summary', 'Updated Summary');
      const events = component['extractedEvents']();
      expect(events[0].summary).toBe('Updated Summary');
    });

    it('should format date for input correctly', () => {
      const date = new Date('2025-01-15T10:30:00');
      const formatted = component['formatDateForInput'](date);
      expect(formatted).toBe('2025-01-15T10:30');
    });

    it('should parse date from input correctly', () => {
      const dateStr = '2025-01-15T10:30';
      const parsed = component['parseDateFromInput'](dateStr);
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getFullYear()).toBe(2025);
      expect(parsed.getMonth()).toBe(0); // January
      expect(parsed.getDate()).toBe(15);
    });

    it('should regenerate ICS content after editing', () => {
      component['editEvent'](0);
      component['updateEventField'](0, 'summary', 'Updated Event');
      component['saveEvent'](0);
      const icsContent = component['icsContent']();
      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(icsContent).toContain('Updated Event');
      expect(icsContent).toContain('END:VCALENDAR');
    });

    it('should clear ICS content when all events are deleted', () => {
      component['deleteEvent'](0);
      component['deleteEvent'](0);
      const icsContent = component['icsContent']();
      expect(icsContent).toBeNull();
    });
  });

  describe('Contribution Nudge', () => {
    let downloadIcsFileSpy: jasmine.Spy;

    beforeEach(() => {
      const converterService = TestBed.inject(ConverterService);
      downloadIcsFileSpy = spyOn(converterService, 'downloadIcsFile');
    });

    it('should not show nudge initially', () => {
      expect(component['showContributionNudge']()).toBe(false);
    });

    it('should show nudge after downloadIcs is called with valid state', () => {
      component['icsContent'].set('BEGIN:VCALENDAR\nEND:VCALENDAR');
      component['extractionConfirmed'].set(true);
      component['downloadIcs']();
      expect(downloadIcsFileSpy).toHaveBeenCalledOnceWith('BEGIN:VCALENDAR\nEND:VCALENDAR');
      expect(component['showContributionNudge']()).toBe(true);
    });

    it('should not show nudge if ICS content is missing', () => {
      component['icsContent'].set(null);
      component['extractionConfirmed'].set(true);
      component['downloadIcs']();
      expect(downloadIcsFileSpy).not.toHaveBeenCalled();
      expect(component['showContributionNudge']()).toBe(false);
    });

    it('should not show nudge if extraction is not confirmed', () => {
      component['icsContent'].set('BEGIN:VCALENDAR\nEND:VCALENDAR');
      component['extractionConfirmed'].set(false);
      component['downloadIcs']();
      expect(downloadIcsFileSpy).not.toHaveBeenCalled();
      expect(component['showContributionNudge']()).toBe(false);
    });

    it('should dismiss nudge when dismissContributionNudge is called', () => {
      component['showContributionNudge'].set(true);
      component['dismissContributionNudge']();
      expect(component['showContributionNudge']()).toBe(false);
    });

    it('should hide nudge when resetState is called', () => {
      component['showContributionNudge'].set(true);
      component['resetState']();
      expect(component['showContributionNudge']()).toBe(false);
    });
  });
});
