import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarView } from './calendar-view';
import { CalendarEvent } from '../../models';
import { signal } from '@angular/core';
import { CalendarStateService } from '../../services/calendar-state.service';
import { LanguageService } from '../../services/language.service';
import { LoggerService } from '../../services/logger.service';

describe('CalendarView', () => {
  let fixture: ComponentFixture<CalendarView>;
  let component: CalendarView;
  let loadCalendarSpy: jasmine.Spy;
  let calendarStateServiceStub: Pick<
    CalendarStateService,
    'extractionConfirmed' | 'navigateToDate'
  >;

  const mockEvents: CalendarEvent[] = [
    {
      summary: 'Doctor Appointment',
      start: new Date('2025-01-15T10:00:00'),
      end: new Date('2025-01-15T11:00:00'),
      location: 'Hospital',
      description: 'Bring documents',
    },
    {
      summary: 'Project Meeting',
      start: new Date('2025-01-16T14:00:00'),
      end: new Date('2025-01-16T15:00:00'),
      location: 'Office',
      description: 'Sprint planning',
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
    calendarStateServiceStub = {
      extractionConfirmed: signal(false),
      navigateToDate: signal<Date | null>(null),
    };

    loadCalendarSpy = spyOn(CalendarView.prototype as never, 'loadCalendar').and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [CalendarView],
      providers: [
        { provide: CalendarStateService, useValue: calendarStateServiceStub },
        {
          provide: LanguageService,
          useValue: {
            currentLang: signal<'en' | 'fr'>('en'),
            translations: signal<Record<string, string>>({}),
            translate: (key: string) => key,
          },
        },
        {
          provide: LoggerService,
          useValue: jasmine.createSpyObj<LoggerService>('LoggerService', ['info', 'warn', 'error']),
        },
      ],
    }).compileComponents();

    fixture = await createComponent();
    loadCalendarSpy.and.returnValue(Promise.resolve());
  });

  it('should create', () => {
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should display the modal calendar when visible is true', () => {
    expect(fixture.nativeElement.querySelector('.calendar-modal-overlay')).toBeTruthy();
  });

  it('should not render the calendar when visible is false', async () => {
    loadCalendarSpy.calls.reset();
    const hiddenFixture = await createComponent({ visible: false });

    expect(hiddenFixture.nativeElement.querySelector('.calendar-modal-overlay')).toBeFalsy();
    expect(hiddenFixture.nativeElement.querySelector('.calendar-inline-container')).toBeFalsy();
    expect(loadCalendarSpy).not.toHaveBeenCalled();
  });

  it('should emit visibleChange when the close button is clicked', () => {
    component = fixture.componentInstance;
    let emittedValue: boolean | undefined;

    component.visibleChange.subscribe((value) => {
      emittedValue = value;
    });

    (fixture.nativeElement.querySelector('.close-button') as HTMLButtonElement | null)?.click();

    expect(emittedValue).toBe(false);
  });

  it('should have calendar options configured', () => {
    component = fixture.componentInstance;

    expect(component['calendarOptions']().initialView).toBe('dayGridMonth');
    expect(component['calendarOptions']().editable).toBe(true);
    expect(component['calendarOptions']().events).toEqual(jasmine.any(Array));
  });

  it('should not emit exportIcs until extraction is confirmed', () => {
    component = fixture.componentInstance;
    let exportCalled = false;

    component.exportIcs.subscribe(() => {
      exportCalled = true;
    });

    (fixture.nativeElement.querySelector('.export-btn') as HTMLButtonElement | null)?.click();

    expect(exportCalled).toBe(false);
  });

  it('should emit exportIcs when extraction is confirmed', () => {
    component = fixture.componentInstance;
    let exportCalled = false;

    component.exportIcs.subscribe(() => {
      exportCalled = true;
    });

    calendarStateServiceStub.extractionConfirmed.set(true);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.export-btn') as HTMLButtonElement | null)?.click();

    expect(exportCalled).toBe(true);
  });

  it('should request lazy calendar loading when visible', () => {
    expect(loadCalendarSpy).toHaveBeenCalled();
  });

  it('should sort events chronologically', async () => {
    fixture = await createComponent({ events: [mockEvents[1], mockEvents[0]] });
    component = fixture.componentInstance;

    const sortedEvents = component['sortedEvents']();

    expect(sortedEvents[0].summary).toBe('Doctor Appointment');
    expect(sortedEvents[1].summary).toBe('Project Meeting');
  });

  it('should expose the current view date as empty before datesSet runs', () => {
    component = fixture.componentInstance;

    expect(component['currentViewDate']()).toBe('');
  });

  it('should render inline mode when inline input is true', async () => {
    fixture = await createComponent({ inline: true });
    component = fixture.componentInstance;

    expect(fixture.nativeElement.querySelector('.calendar-inline-container')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.calendar-modal-overlay')).toBeFalsy();
    expect(component).toBeTruthy();
  });

  it('should display the confirmation banner in modal mode', () => {
    expect(fixture.nativeElement.querySelector('.export-confirm-banner')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('AI-extracted events may contain errors');
  });

  it('should hide event navigation when all events are visible in the current range', () => {
    component = fixture.componentInstance;
    component['currentViewRange'].set({
      start: new Date('2025-01-01T00:00:00'),
      end: new Date('2025-02-01T00:00:00'),
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.event-nav-index')).toBeFalsy();
  });

  it('should show event navigation when events extend beyond the current range', async () => {
    fixture = await createComponent({
      events: [
        mockEvents[0],
        {
          ...mockEvents[1],
          start: new Date('2025-02-16T14:00:00'),
          end: new Date('2025-02-16T15:00:00'),
        },
      ],
    });
    component = fixture.componentInstance;
    component['currentViewRange'].set({
      start: new Date('2025-01-01T00:00:00'),
      end: new Date('2025-02-01T00:00:00'),
    });
    fixture.detectChanges();

    const eventNavIndex = fixture.nativeElement.querySelector(
      '.event-nav-index',
    ) as HTMLElement | null;

    expect(eventNavIndex).toBeTruthy();
    expect(eventNavIndex?.textContent?.trim()).toBe('1/2');
  });

  it('should display the event popover when selectedEvent is set', () => {
    component = fixture.componentInstance;

    component['selectedEvent'].set({
      title: 'Doctor Appointment',
      start: 'Wed, Jan 15, 10:00',
      end: 'Wed, Jan 15, 11:00',
      location: 'Hospital',
      description: 'Bring documents',
      color: '#123456',
      x: 200,
      y: 150,
    });
    fixture.detectChanges();

    const popover = fixture.nativeElement.querySelector('.event-popover') as HTMLElement | null;
    const title = popover?.querySelector('.popover-title');
    const location = popover?.querySelector('.popover-text');

    expect(popover).toBeTruthy();
    expect(title?.textContent?.trim()).toBe('Doctor Appointment');
    expect(location?.textContent?.trim()).toBe('Hospital');
  });

  it('should close the popover on Escape', () => {
    component = fixture.componentInstance;

    component['selectedEvent'].set({
      title: 'Doctor Appointment',
      start: 'Wed, Jan 15, 10:00',
      end: 'Wed, Jan 15, 11:00',
      color: '#123456',
      x: 200,
      y: 150,
    });

    component.handleKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(component['selectedEvent']()).toBeNull();
  });

  it('should close the popover via closePopover()', () => {
    component = fixture.componentInstance;

    component['selectedEvent'].set({
      title: 'Test',
      start: 'Jan 15',
      end: 'Jan 15',
      color: '#123456',
      x: 100,
      y: 200,
    });

    component['closePopover']();

    expect(component['selectedEvent']()).toBeNull();
  });
});
