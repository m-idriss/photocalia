import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarView } from './calendar-view';
import { CalendarEvent } from '../../models';

describe('CalendarView', () => {
  let fixture: ComponentFixture<CalendarView>;
  let component: CalendarView;
  let loadCalendarSpy: jasmine.Spy;

  type CalendarViewWithLoadCalendar = CalendarView & {
    loadCalendar: () => Promise<void>;
  };

  const mockEvents: CalendarEvent[] = [
    {
      summary: 'Test Event 1',
      start: new Date('2025-01-15T10:00:00'),
      end: new Date('2025-01-15T11:00:00'),
      location: 'Test Location',
      description: 'Test Description',
    },
    {
      summary: 'Test Event 2',
      start: new Date('2025-01-16T14:00:00'),
      end: new Date('2025-01-16T15:00:00'),
      location: 'Another Location',
      description: 'Another Description',
    },
  ];

  async function createComponent(options?: {
    events?: CalendarEvent[];
    visible?: boolean;
    inline?: boolean;
  }): Promise<ComponentFixture<CalendarView>> {
    const createdFixture = TestBed.createComponent(CalendarView);
    createdFixture.componentRef.setInput('events', options?.events ?? mockEvents);
    createdFixture.componentRef.setInput('visible', options?.visible ?? true);
    if (options?.inline !== undefined) {
      createdFixture.componentRef.setInput('inline', options.inline);
    }

    createdFixture.detectChanges();
    await createdFixture.whenStable();
    return createdFixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarView],
    }).compileComponents();

    loadCalendarSpy = spyOn(
      CalendarView.prototype as unknown as CalendarViewWithLoadCalendar,
      'loadCalendar',
    );
    loadCalendarSpy.and.returnValue(Promise.resolve());

    fixture = await createComponent();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the modal calendar when visible is true', () => {
    expect(fixture.nativeElement.querySelector('.calendar-modal-overlay')).toBeTruthy();
  });

  it('should not render the calendar when visible is false', async () => {
    const hiddenFixture = await createComponent({ visible: false });

    expect(hiddenFixture.nativeElement.querySelector('.calendar-modal-overlay')).toBeFalsy();
    expect(loadCalendarSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit visibleChange when the close button is clicked', () => {
    let emittedValue: boolean | undefined;
    component.visibleChange.subscribe((value) => {
      emittedValue = value;
    });

    fixture.nativeElement.querySelector('.close-button')?.click();

    expect(emittedValue).toBe(false);
  });

  it('should not emit exportIcs until extraction is confirmed', () => {
    let exportCalled = false;
    component.exportIcs.subscribe(() => {
      exportCalled = true;
    });

    fixture.nativeElement.querySelector('.export-btn')?.click();

    expect(exportCalled).toBe(false);
  });

  it('should emit exportIcs when extraction is confirmed', () => {
    let exportCalled = false;
    component.exportIcs.subscribe(() => {
      exportCalled = true;
    });

    component['calendarStateService'].extractionConfirmed.set(true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.export-btn')?.click();

    expect(exportCalled).toBe(true);
  });

  it('should have calendar options configured', () => {
    const options = component['calendarOptions']();

    expect(options.editable).toBe(true);
    expect(options.selectable).toBe(true);
    expect(options.initialView).toBe('dayGridMonth');
  });

  it('should request lazy calendar loading when visible', () => {
    expect(loadCalendarSpy).toHaveBeenCalled();
  });

  it('should display an error message when loadError is true', () => {
    component['loadError'] = true;
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.textContent).toContain('Failed to load calendar');
  });

  it('should compute event count correctly', () => {
    expect(component['eventCount']()).toBe(2);
  });

  it('should sort events chronologically', async () => {
    fixture = await createComponent({ events: [mockEvents[1], mockEvents[0]] });
    component = fixture.componentInstance;

    const sortedEvents = component['sortedEvents']();
    expect(sortedEvents[0].summary).toBe('Test Event 1');
    expect(sortedEvents[1].summary).toBe('Test Event 2');
  });

  it('should expose the current view date as empty before datesSet runs', () => {
    expect(component['currentViewDate']()).toBe('');
  });

  it('should return an empty sorted event list when there are no events', async () => {
    fixture = await createComponent({ events: [] });
    component = fixture.componentInstance;

    expect(component['sortedEvents']()).toEqual([]);
  });

  it('should generate consistent colors for the same title', () => {
    const color1 = component['getEventColor']('Test Event');
    const color2 = component['getEventColor']('Test Event');
    expect(color1).toEqual(color2);
  });

  it('should generate valid colors for different titles', () => {
    const color1 = component['getEventColor']('Meeting');
    const color2 = component['getEventColor']('Lunch Break');

    expect(color1.bg).toBeTruthy();
    expect(color2.bg).toBeTruthy();
  });

  it('should have no selected event initially', () => {
    expect(component['selectedEvent']()).toBeNull();
  });

  it('should close the popover via closePopover()', () => {
    component['selectedEvent'].set({
      title: 'Test',
      start: 'Jan 15',
      end: 'Jan 15',
      color: '#3b82f6',
      x: 100,
      y: 200,
    });

    component['closePopover']();

    expect(component['selectedEvent']()).toBeNull();
  });

  it('should close the popover on Escape', () => {
    component['selectedEvent'].set({
      title: 'Test',
      start: 'Jan 15',
      end: 'Jan 15',
      color: '#3b82f6',
      x: 100,
      y: 200,
    });

    component.handleKeyDown({
      key: 'Escape',
      preventDefault: () => undefined,
    } as KeyboardEvent);

    expect(component['selectedEvent']()).toBeNull();
  });

  it('should display the confirmation banner in modal mode', () => {
    expect(fixture.nativeElement.querySelector('.export-confirm-banner')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('AI-extracted events may contain errors');
  });

  it('should render inline mode when inline input is true', async () => {
    fixture = await createComponent({ inline: true });
    component = fixture.componentInstance;

    expect(fixture.nativeElement.querySelector('.calendar-inline-container')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.calendar-modal-overlay')).toBeFalsy();
  });

  it('should show event navigation when there are multiple events', () => {
    const eventNavIndex = fixture.nativeElement.querySelector('.event-nav-index');

    expect(eventNavIndex).toBeTruthy();
    expect(eventNavIndex.textContent.trim()).toBe('1/2');
  });

  it('should display the event popover when selectedEvent is set', () => {
    component['selectedEvent'].set({
      title: 'Doctor Appointment',
      start: 'Wed, Jan 15, 10:00',
      end: 'Wed, Jan 15, 11:00',
      location: 'Hospital',
      description: 'Annual checkup',
      color: '#3b82f6',
      x: 200,
      y: 300,
    });
    fixture.detectChanges();

    const popover = fixture.nativeElement.querySelector('.event-popover');
    expect(popover).toBeTruthy();
    expect(popover.querySelector('.popover-title')?.textContent?.trim()).toBe('Doctor Appointment');
    expect(popover.querySelector('.popover-text')?.textContent?.trim()).toBe('Hospital');
  });
});
