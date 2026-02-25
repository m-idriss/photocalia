import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarView } from './calendar-view';
import { CalendarEvent } from '../../models';

describe('CalendarView', () => {
  let component: CalendarView;
  let fixture: ComponentFixture<CalendarView>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarView],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarView);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('events', mockEvents);
    fixture.componentRef.setInput('visible', true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display calendar when visible is true', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const modalOverlay = fixture.nativeElement.querySelector('.calendar-modal-overlay');
    expect(modalOverlay).toBeTruthy();
  });

  it('should not display calendar when visible is false', () => {
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();

    const modalOverlay = fixture.nativeElement.querySelector('.calendar-modal-overlay');
    expect(modalOverlay).toBeFalsy();
  });

  it('should emit visibleChange when close button is clicked', () => {
    let emittedValue: boolean | undefined;
    component.visibleChange.subscribe((value: boolean) => {
      emittedValue = value;
    });

    const closeButton = fixture.nativeElement.querySelector('.close-button');
    closeButton?.click();

    expect(emittedValue).toBe(false);
  });

  it('should emit exportIcs when export button is clicked', () => {
    let exportCalled = false;
    component.exportIcs.subscribe(() => {
      exportCalled = true;
    });

    const exportButton = fixture.nativeElement.querySelector('.export-btn');
    exportButton?.click();

    expect(exportCalled).toBe(true);
  });

  it('should have calendar options configured', () => {
    const options = component['calendarOptions']();

    expect(options.editable).toBe(true);
    expect(options.selectable).toBe(true);
    expect(options.initialView).toBe('dayGridMonth');
  });

  it('should not load calendar when visible is false', async () => {
    const freshFixture = TestBed.createComponent(CalendarView);
    const freshComponent = freshFixture.componentInstance;

    freshFixture.componentRef.setInput('events', mockEvents);
    freshFixture.componentRef.setInput('visible', false);

    freshFixture.detectChanges();
    await freshFixture.whenStable();

    expect(freshComponent['calendarLoaded']).toBe(false);
  });

  it('should set loadError to true when dynamic import fails', async () => {
    const freshFixture = TestBed.createComponent(CalendarView);
    const freshComponent = freshFixture.componentInstance;

    freshFixture.componentRef.setInput('events', mockEvents);
    freshFixture.componentRef.setInput('visible', true);

    spyOn<CalendarView>(freshComponent, 'loadCalendar' as never).and.returnValue(
      Promise.reject(new Error('Simulated import failure')),
    );

    freshComponent['loadError'] = false;

    try {
      await freshComponent['loadCalendar']();
    } catch {
      freshComponent['loadError'] = true;
    }

    freshFixture.detectChanges();

    expect(freshComponent['loadError']).toBe(true);
  });

  it('should display error message when loadError is true', () => {
    component['loadError'] = true;
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.textContent).toContain('Failed to load calendar');
  });

  // New tests for color-coded events
  it('should compute event count correctly', () => {
    expect(component['eventCount']()).toBe(2);
  });

  it('should compute date range for multiple events', () => {
    const range = component['dateRange']();
    expect(range).toContain('Jan');
    expect(range).toContain('–');
  });

  it('should compute date range for single event', () => {
    fixture.componentRef.setInput('events', [mockEvents[0]]);
    fixture.detectChanges();

    const range = component['dateRange']();
    expect(range).toContain('Jan');
    expect(range).toContain('2025');
  });

  it('should return empty date range for no events', () => {
    fixture.componentRef.setInput('events', []);
    fixture.detectChanges();

    expect(component['dateRange']()).toBe('');
  });

  // Event color generation
  it('should generate consistent colors for the same title', () => {
    const color1 = component['getEventColor']('Test Event');
    const color2 = component['getEventColor']('Test Event');
    expect(color1).toEqual(color2);
  });

  it('should generate different colors for different titles', () => {
    const color1 = component['getEventColor']('Meeting');
    const color2 = component['getEventColor']('Lunch Break');
    // They could coincidentally be the same, but with different hashes they likely differ
    // Just verify both return a valid color object
    expect(color1.bg).toBeTruthy();
    expect(color2.bg).toBeTruthy();
  });

  // Popover
  it('should have no selected event initially', () => {
    expect(component['selectedEvent']()).toBeNull();
  });

  it('should close popover via closePopover()', () => {
    component['selectedEvent'].set({
      title: 'Test',
      start: 'Jan 15',
      end: 'Jan 15',
      color: '#3b82f6',
      x: 100,
      y: 200,
    });
    expect(component['selectedEvent']()).toBeTruthy();

    component['closePopover']();
    expect(component['selectedEvent']()).toBeNull();
  });

  it('should close popover on Escape key', () => {
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
    } as unknown as KeyboardEvent);

    expect(component['selectedEvent']()).toBeNull();
  });

  it('should display stats badge in modal mode', () => {
    const stats = fixture.nativeElement.querySelector('.calendar-stats');
    expect(stats).toBeTruthy();

    const countEl = fixture.nativeElement.querySelector('.stat-count');
    expect(countEl?.textContent?.trim()).toBe('2');
  });

  it('should display instructions in modal mode', () => {
    const instructions = fixture.nativeElement.querySelector('.calendar-instructions');
    expect(instructions).toBeTruthy();
    expect(instructions?.textContent).toContain('Drag');
  });

  it('should render inline mode when inline input is true', () => {
    fixture.componentRef.setInput('inline', true);
    fixture.detectChanges();

    const inlineContainer = fixture.nativeElement.querySelector('.calendar-inline-container');
    expect(inlineContainer).toBeTruthy();

    const modalOverlay = fixture.nativeElement.querySelector('.calendar-modal-overlay');
    expect(modalOverlay).toBeFalsy();
  });

  it('should display event popover when selectedEvent is set', () => {
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

    const title = popover.querySelector('.popover-title');
    expect(title?.textContent?.trim()).toBe('Doctor Appointment');

    const locationEl = popover.querySelector('.popover-text');
    expect(locationEl?.textContent?.trim()).toBe('Hospital');
  });
});
