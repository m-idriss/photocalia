import {
  Component,
  signal,
  input,
  output,
  OnInit,
  ViewChild,
  PLATFORM_ID,
  inject,
  effect,
  HostListener,
  ViewContainerRef,
  ComponentRef,
  AfterViewInit,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { CalendarOptions, EventInput, EventDropArg, EventClickArg } from '@fullcalendar/core';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import { CalendarEvent } from '../../models';

/**
 * Interactive calendar view component for visualizing and editing events
 *
 * Features:
 * - Monthly and weekly grid views
 * - Drag & drop to move events
 * - Resize to adjust event duration
 * - Export updated events to ICS
 */
@Component({
  selector: 'app-calendar-view',
  imports: [CommonModule],
  templateUrl: './calendar-view.html',
  styleUrl: './calendar-view.scss',
})
export class CalendarView implements OnInit, AfterViewInit {
  // Inputs
  readonly events = input.required<CalendarEvent[]>();
  readonly visible = input.required<boolean>();
  readonly inline = input<boolean>(false); // New: inline mode for desktop side-by-side layout

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly eventsChange = output<CalendarEvent[]>();
  readonly exportIcs = output<void>();

  // Local state
  protected readonly calendarOptions = signal<CalendarOptions>({
    plugins: [], // Will be populated after dynamic import
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    buttonText: {
      prev: '◄',
      next: '►',
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day',
    },
    buttonIcons: false,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    events: [],
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    eventClick: this.handleEventClick.bind(this),
    height: '80%',
    contentHeight: 'auto',
    expandRows: true,
    scrollTime: '06:00:00', // Start day view at 6am (daylight hours)
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  });

  @ViewChild('calendarContainer', { read: ViewContainerRef }) calendarContainer?: ViewContainerRef;
  // Type will be FullCalendarComponent after dynamic import, but we can't reference it statically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calendarComponentRef?: ComponentRef<any>;
  private calendarLoaded = false;
  protected loadError = false;

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    // Watch for events changes and update calendar
    effect(() => {
      this.updateCalendarEvents();
    });
  }

  ngOnInit(): void {
    // Initial load will happen in ngAfterViewInit
  }

  async ngAfterViewInit(): Promise<void> {
    // Lazy load FullCalendar modules once, only in the browser platform when the container is available
    if (!this.calendarLoaded && isPlatformBrowser(this.platformId) && this.calendarContainer) {
      await this.loadCalendar();
    }
  }

  /**
   * Lazy load FullCalendar library and create the calendar component
   */
  private async loadCalendar(): Promise<void> {
    try {
      // Dynamically import FullCalendar modules
      const [
        { FullCalendarComponent },
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
      ] = await Promise.all([
        import('@fullcalendar/angular'),
        import('@fullcalendar/daygrid').then((m) => m.default),
        import('@fullcalendar/timegrid').then((m) => m.default),
        import('@fullcalendar/interaction').then((m) => m.default),
      ]);

      // Update calendar options with the loaded plugins
      this.calendarOptions.update((options) => ({
        ...options,
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      }));

      // Create the FullCalendar component dynamically
      if (this.calendarContainer) {
        this.calendarComponentRef = this.calendarContainer.createComponent(FullCalendarComponent);
        this.calendarComponentRef.instance.options = this.calendarOptions();

        this.calendarLoaded = true;

        // Update calendar events after loading
        this.updateCalendarEvents();
      }
    } catch (error) {
      console.error('Error loading FullCalendar:', error);
      this.loadError = true;
    }
  }

  /**
   * Update calendar events when input changes
   */
  private updateCalendarEvents(): void {
    const fullCalendarEvents: EventInput[] = this.events().map((event, index) => ({
      id: index.toString(),
      title: event.summary,
      start: typeof event.start === 'string' ? event.start : event.start.toISOString(),
      end: typeof event.end === 'string' ? event.end : event.end.toISOString(),
      extendedProps: {
        description: event.description,
        location: event.location,
      },
    }));

    this.calendarOptions.update((options) => ({
      ...options,
      events: fullCalendarEvents,
    }));

    // Update the component instance if it's already loaded
    if (this.calendarComponentRef) {
      this.calendarComponentRef.instance.options = this.calendarOptions();
    }
  }

  /**
   * Handle event drop (drag & drop)
   */
  private handleEventDrop(info: EventDropArg): void {
    const eventIndex = parseInt(info.event.id, 10);
    const updatedEvents = [...this.events()];

    if (updatedEvents[eventIndex]) {
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        start: info.event.start || updatedEvents[eventIndex].start,
        end: info.event.end || updatedEvents[eventIndex].end,
      };

      this.eventsChange.emit(updatedEvents);
    }
  }

  /**
   * Handle event resize
   */
  private handleEventResize(info: EventResizeDoneArg): void {
    const eventIndex = parseInt(info.event.id, 10);
    const updatedEvents = [...this.events()];

    if (updatedEvents[eventIndex]) {
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        start: info.event.start || updatedEvents[eventIndex].start,
        end: info.event.end || updatedEvents[eventIndex].end,
      };

      this.eventsChange.emit(updatedEvents);
    }
  }

  /**
   * Handle event click
   * Placeholder for future feature implementation (e.g., edit modal, event details)
   * @param _info - Event click information (unused for now)
   */
  private handleEventClick(_info: EventClickArg): void {
    // TODO: Implement event editing or detail view
    // Possible features:
    // - Open edit modal with event details
    // - Show event details popup
    // - Enable quick event deletion
  }

  /**
   * Close the calendar view
   */
  protected close(): void {
    this.visibleChange.emit(false);
  }

  /**
   * Handle escape key to close modal (only in modal mode)
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.inline() && this.visible()) {
      this.close();
      event.preventDefault();
    }
  }

  /**
   * Export events to ICS
   */
  protected handleExport(): void {
    this.exportIcs.emit();
  }

  /**
   * Change calendar view
   */
  protected changeView(viewType: string): void {
    if (isPlatformBrowser(this.platformId) && this.calendarComponentRef) {
      const calendarApi = this.calendarComponentRef.instance.getApi();
      calendarApi.changeView(viewType);
    }
  }
}
