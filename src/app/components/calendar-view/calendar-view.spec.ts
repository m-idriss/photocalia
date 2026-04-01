    expect(component['selectedEvent']()).toBeTruthy();
  // Popover
  // Event color generation
  // New tests for color-coded events

    fixture.componentRef.setInput('events', mockEvents);
  let component: CalendarView;
  let loadCalendarSpy: jasmine.Spy;

  type CalendarViewWithLoadCalendar = CalendarView & {
    loadCalendar: () => Promise<void>;
  };
    fixture.componentRef.setInput('visible', true);

    fixture.detectChanges();
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarView } from './calendar-view';
import { CalendarEvent } from '../../models';

describe('CalendarView', () => {
  let component: CalendarView;
      end: new Date('2025-01-15T11:00:00'),
      location: 'Test Location',
      description: 'Test Description',
    },
    {
      summary: 'Test Event 2',
      start: new Date('2025-01-16T14:00:00'),
      end: new Date('2025-01-16T15:00:00'),
      location: 'Another Location',
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

      description: 'Another Description',
    },
  ];

  beforeEach(async () => {
    loadCalendarSpy = spyOn(
      CalendarView.prototype as unknown as CalendarViewWithLoadCalendar,
      'loadCalendar',
    );
    loadCalendarSpy.and.returnValue(Promise.resolve());

    fixture = await createComponent();
      imports: [CalendarView],
    expect(modalOverlay).toBeFalsy();
  });

  it('should emit visibleChange when close button is clicked', () => {
    let emittedValue: boolean | undefined;
    component.visibleChange.subscribe((value: boolean) => {
  it('should display the modal calendar when visible is true', () => {
    expect(fixture.nativeElement.querySelector('.calendar-modal-overlay')).toBeTruthy();
    expect(emittedValue).toBe(false);
  });
  it('should not render the calendar when visible is false', async () => {
    const hiddenFixture = await createComponent({ visible: false });
    component.exportIcs.subscribe(() => {
    expect(hiddenFixture.nativeElement.querySelector('.calendar-modal-overlay')).toBeFalsy();
    expect(loadCalendarSpy).toHaveBeenCalledTimes(1);

    const exportButton = fixture.nativeElement.querySelector('.export-btn');
  it('should emit visibleChange when the close button is clicked', () => {

    component.visibleChange.subscribe((value) => {
  });

  it('should have calendar options configured', () => {
    fixture.nativeElement.querySelector('.close-button')?.click();
    const freshComponent = freshFixture.componentInstance;

  it('should display calendar when visible is true', () => {
    fixture.componentRef.setInput('visible', true);
  it('should not emit exportIcs until extraction is confirmed', () => {
    let exportCalled = false;
    component.exportIcs.subscribe(() => {
      exportCalled = true;
    });

    fixture.nativeElement.querySelector('.export-btn')?.click();

    expect(exportCalled).toBe(false);
  });

  it('should emit exportIcs when extraction is confirmed', () => {

  it('should not display calendar when visible is false', () => {
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();

    component['calendarStateService'].extractionConfirmed.set(true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.export-btn')?.click();
    expect(modalOverlay).toBeFalsy();
  it('should emit visibleChange when close button is clicked', () => {
    const freshComponent = freshFixture.componentInstance;

    component.visibleChange.subscribe((value: boolean) => {
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    closeButton?.click();

    spyOn(calendarLoader, 'loadCalendar').and.returnValue(
  it('should emit exportIcs when export button is clicked', () => {

    expect(freshComponent['loadError']).toBe(true);
  it('should request lazy calendar loading when visible', () => {
    expect(loadCalendarSpy).toHaveBeenCalled();
    await freshFixture.whenStable();

  it('should display an error message when loadError is true', () => {
  });

  it('should set loadError to true when dynamic import fails', async () => {
  it('should compute date range for multiple events', () => {
    const range = component['dateRange']();
    expect(range).toContain('Jan');
    expect(range).toContain('–');
  });
    fixture.componentRef.setInput('events', [mockEvents[0]]);
    fixture.detectChanges();
    const range = component['dateRange']();
    expect(range).toContain('Jan');
  it('should sort events chronologically', async () => {
    fixture = await createComponent({ events: [mockEvents[1], mockEvents[0]] });
    component = fixture.componentInstance;
    fixture.componentRef.setInput('events', []);
    const sortedEvents = component['sortedEvents']();
    expect(sortedEvents[0].summary).toBe('Test Event 1');
    expect(sortedEvents[1].summary).toBe('Test Event 2');
  });
    expect(component['dateRange']()).toBe('');
  it('should expose the current view date as empty before datesSet runs', () => {
    expect(component['currentViewDate']()).toBe('');
  it('should generate consistent colors for the same title', () => {
    const color1 = component['getEventColor']('Test Event');
  it('should return an empty sorted event list when there are no events', async () => {
    fixture = await createComponent({ events: [] });
    component = fixture.componentInstance;

    expect(component['sortedEvents']()).toEqual([]);
    const color1 = component['getEventColor']('Meeting');
    // They could coincidentally be the same, but with different hashes they likely differ
  it('should close popover via closePopover()', () => {
    // Just verify both return a valid color object
    expect(color1.bg).toBeTruthy();
    expect(color2.bg).toBeTruthy();
  });

  it('should generate valid colors for different titles', () => {
    expect(component['selectedEvent']()).toBeNull();
  });

    component['selectedEvent'].set({
      title: 'Test',
      start: 'Jan 15',
      end: 'Jan 15',
      x: 100,
      y: 200,
    });
    expect(component['selectedEvent']()).toBeTruthy();
  it('should close the popover via closePopover()', () => {
    component['closePopover']();
    expect(component['selectedEvent']()).toBeNull();
    } as unknown as KeyboardEvent);

  it('should display stats badge in modal mode', () => {
    const stats = fixture.nativeElement.querySelector('.calendar-stats');
    expect(stats).toBeTruthy();

    expect(countEl?.textContent?.trim()).toBe('2');


  it('should display instructions in modal mode', () => {
    const instructions = fixture.nativeElement.querySelector('.calendar-instructions');
    expect(instructions).toBeTruthy();
  it('should close the popover on Escape', () => {
    expect(stats).toBeTruthy();

    const countEl = fixture.nativeElement.querySelector('.stat-count');
  it('should render inline mode when inline input is true', () => {
    fixture.componentRef.setInput('inline', true);
    fixture.detectChanges();
    const inlineContainer = fixture.nativeElement.querySelector('.calendar-inline-container');
    expect(inlineContainer).toBeTruthy();

  it('should display event popover when selectedEvent is set', () => {
    expect(modalOverlay).toBeFalsy();
    expect(instructions?.textContent).toContain('Drag');
    } as KeyboardEvent);

  it('should render inline mode when inline input is true', () => {
    fixture.componentRef.setInput('inline', true);
    fixture.detectChanges();
  it('should display the confirmation banner in modal mode', () => {
    expect(fixture.nativeElement.querySelector('.export-confirm-banner')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('AI-extracted events may contain errors');
    expect(title?.textContent?.trim()).toBe('Doctor Appointment');

  it('should render inline mode when inline input is true', async () => {
    fixture = await createComponent({ inline: true });
    component = fixture.componentInstance;

    expect(fixture.nativeElement.querySelector('.calendar-inline-container')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.calendar-modal-overlay')).toBeFalsy();
      start: 'Wed, Jan 15, 10:00',
      end: 'Wed, Jan 15, 11:00',
  it('should show event navigation when there are multiple events', () => {
    const eventNavIndex = fixture.nativeElement.querySelector('.event-nav-index');
      x: 200,
    expect(eventNavIndex).toBeTruthy();
    expect(eventNavIndex.textContent.trim()).toBe('1/2');
    expect(popover).toBeTruthy();

  it('should display the event popover when selectedEvent is set', () => {
    expect(title?.textContent?.trim()).toBe('Doctor Appointment');

    const locationEl = popover.querySelector('.popover-text');
    expect(locationEl?.textContent?.trim()).toBe('Hospital');
  });
});
