import {
  Component,
  signal,
  input,
  output,
  computed,
  ViewChild,
  PLATFORM_ID,
  inject,
  effect,
  HostListener,
  ViewContainerRef,
  ComponentRef,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  CalendarOptions,
  EventInput,
  EventDropArg,
  EventClickArg,
  EventMountArg,
} from '@fullcalendar/core';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import { CalendarEvent } from '../../models';
import { CalendarStateService } from '../../services/calendar-state.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { getEventColor } from '../../utils';

/** Selected event details for the popover */
interface EventDetail {
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  color: string;
  x: number;
  y: number;
}

/**
 * Interactive calendar view component for visualizing and editing events
 *
 * Features:
 * - Monthly, weekly, and daily grid views
 * - Drag & drop to move events
 * - Resize to adjust event duration
 * - Color-coded events with harmonious palette
 * - Click popover with event details
 * - Hover tooltips for quick preview
 * - Mini stats header with event count
 * - Export updated events to ICS
 */
@Component({
  selector: 'app-calendar-view',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './calendar-view.html',
  styleUrl: './calendar-view.scss',
})
export class CalendarView implements AfterViewInit {
  // Inputs
  readonly events = input.required<CalendarEvent[]>();
  readonly visible = input.required<boolean>();
  readonly inline = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly eventsChange = output<CalendarEvent[]>();
  readonly exportIcs = output<void>();

  // Computed stats (guard against required input not yet resolved)
  protected readonly eventCount = computed(() => {
    try {
      return this.events().length;
    } catch {
      return 0;
    }
  });
  protected readonly dateRange = computed(() => {
    let events: CalendarEvent[];
    try {
      events = this.events();
    } catch {
      return '';
    }
    if (events.length === 0) return '';
    const dates = events
      .map((e) => (e.start instanceof Date ? e.start : new Date(e.start)))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    if (dates.length === 0) return '';
    const first = dates[0];
    const last = dates[dates.length - 1];
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (first.toDateString() === last.toDateString()) {
      return first.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
    }
    const yearOpts: Intl.DateTimeFormatOptions =
      first.getFullYear() !== last.getFullYear() ? { year: 'numeric' } : {};
    return `${first.toLocaleDateString('en-US', { ...opts, ...yearOpts })} – ${last.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
  });

  // Sorted events by date for navigation
  protected readonly sortedEvents = computed(() => {
    try {
      return [...this.events()].sort(
        (a, b) =>
          (a.start instanceof Date ? a.start : new Date(a.start)).getTime() -
          (b.start instanceof Date ? b.start : new Date(b.start)).getTime(),
      );
    } catch {
      return [];
    }
  });

  // Current event index for navigation
  protected readonly currentEventIndex = signal(0);

  // Event detail popover
  protected readonly selectedEvent = signal<EventDetail | null>(null);

  // Local state
  protected readonly calendarOptions = signal<CalendarOptions>({
    plugins: [],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    buttonText: {
      prev: '◀',
      next: '▶',
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
    eventDisplay: 'block',
    events: [],
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: this.handleEventDidMount.bind(this),
    height: '100%',
    contentHeight: 'auto',
    expandRows: true,
    scrollTime: '06:00:00',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  });

  @ViewChild('calendarContainer', { read: ViewContainerRef }) calendarContainer?: ViewContainerRef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calendarComponentRef?: ComponentRef<any>;
  private calendarLoaded = false;
  protected loadError = false;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef);
  private readonly calendarStateService = inject(CalendarStateService);
  private readonly languageService = inject(LanguageService);

  constructor() {
    effect(() => {
      // Track the events signal explicitly so the effect re-runs on changes.
      // Guard against required input not yet being available during initial CD.
      let events: CalendarEvent[] | undefined;
      try {
        events = this.events();
      } catch {
        return;
      }
      if (events) {
        this.updateCalendarEvents(events);
      }
    });

    // React to navigate-to-date requests from the converter
    effect(() => {
      const date = this.calendarStateService.navigateToDate();
      if (date && this.calendarComponentRef) {
        const calendarApi = this.calendarComponentRef.instance.getApi();
        calendarApi.gotoDate(date);
      }
    });

    // Update FullCalendar locale and button text when language changes
    effect(() => {
      const lang = this.languageService.currentLang();
      const translations = this.languageService.translations();
      if (Object.keys(translations).length > 0) {
        this.updateCalendarLocale(lang, translations);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.calendarLoaded && isPlatformBrowser(this.platformId) && this.calendarContainer) {
      await this.loadCalendar();
    }
  }

  private async updateCalendarLocale(
    lang: string,
    translations: Record<string, string>,
  ): Promise<void> {
    // Load FullCalendar locale if not English
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fcLocale: any = 'en';
    if (lang === 'fr') {
      fcLocale = (await import('@fullcalendar/core/locales/fr')).default;
    }

    this.calendarOptions.update((options) => ({
      ...options,
      locale: fcLocale,
      buttonText: {
        ...options.buttonText,
        prev: '◀',
        next: '▶',
        today: translations['calendar.today'] ?? 'Today',
        month: translations['calendar.month'] ?? 'Month',
        week: translations['calendar.week'] ?? 'Week',
        day: translations['calendar.day'] ?? 'Day',
      },
    }));
    if (this.calendarComponentRef) {
      this.calendarComponentRef.instance.options = this.calendarOptions();
    }
  }

  private getEventColor = getEventColor;

  /**
   * Lazy load FullCalendar library and create the calendar component
   */
  private async loadCalendar(): Promise<void> {
    try {
      const [{ FullCalendarComponent }, dayGridPlugin, timeGridPlugin, interactionPlugin] =
        await Promise.all([
          import('@fullcalendar/angular'),
          import('@fullcalendar/daygrid').then((m) => m.default),
          import('@fullcalendar/timegrid').then((m) => m.default),
          import('@fullcalendar/interaction').then((m) => m.default),
        ]);

      this.calendarOptions.update((options) => ({
        ...options,
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      }));

      if (this.calendarContainer) {
        this.calendarComponentRef = this.calendarContainer.createComponent(FullCalendarComponent);
        this.calendarComponentRef.instance.options = this.calendarOptions();
        this.calendarLoaded = true;
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
  private updateCalendarEvents(events?: CalendarEvent[]): void {
    const source = events ?? this.events();
    const fullCalendarEvents: EventInput[] = source.map((event, index) => {
      const color = this.getEventColor(event.summary);
      return {
        id: index.toString(),
        title: event.summary,
        start: typeof event.start === 'string' ? event.start : event.start.toISOString(),
        end: typeof event.end === 'string' ? event.end : event.end.toISOString(),
        backgroundColor: color.bg,
        borderColor: color.border,
        textColor: color.text,
        extendedProps: {
          description: event.description,
          location: event.location,
        },
      };
    });

    this.calendarOptions.update((options) => ({
      ...options,
      events: fullCalendarEvents,
    }));

    if (this.calendarComponentRef) {
      this.calendarComponentRef.instance.options = this.calendarOptions();
    }
  }

  /**
   * Add hover tooltip and enhanced styling to each event element
   */
  private handleEventDidMount(info: EventMountArg): void {
    const { event, el } = info;
    const location = event.extendedProps?.['location'];
    const description = event.extendedProps?.['description'];

    // Build tooltip text
    const parts: string[] = [event.title];
    if (event.start) {
      const startStr = event.start.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      parts.push(`🕐 ${startStr}`);
    }
    if (location) parts.push(`📍 ${location}`);
    if (description) {
      const shortDesc = description.length > 60 ? description.substring(0, 60) + '…' : description;
      parts.push(`📝 ${shortDesc}`);
    }
    el.setAttribute('title', parts.join('\n'));
  }

  /**
   * Handle event drop (drag & drop)
   */
  private handleEventDrop(info: EventDropArg): void {
    this.closePopover();
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
    this.closePopover();
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
   * Handle event click — show detail popover (fixed position, viewport-relative)
   */
  private handleEventClick(info: EventClickArg): void {
    info.jsEvent.preventDefault();
    info.jsEvent.stopPropagation();

    const rect = info.el.getBoundingClientRect();

    const formatTime = (date: Date | null): string => {
      if (!date) return '—';
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    };

    const color = this.getEventColor(info.event.title);

    // Use viewport coordinates for fixed positioning
    this.selectedEvent.set({
      title: info.event.title,
      start: formatTime(info.event.start),
      end: formatTime(info.event.end),
      location: info.event.extendedProps?.['location'],
      description: info.event.extendedProps?.['description'],
      color: color.bg,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  }

  /**
   * Close the event detail popover
   */
  protected closePopover(): void {
    this.selectedEvent.set(null);
  }

  /**
   * Close the calendar view
   */
  protected close(): void {
    this.closePopover();
    this.visibleChange.emit(false);
  }

  /**
   * Handle escape key to close modal (only in modal mode)
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.selectedEvent()) {
        this.closePopover();
        event.preventDefault();
      } else if (!this.inline() && this.visible()) {
        this.close();
        event.preventDefault();
      }
    }
  }

  /**
   * Close popover when clicking outside
   */
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (this.selectedEvent()) {
      const target = event.target as HTMLElement;
      if (!target.closest('.event-popover') && !target.closest('.fc-event')) {
        this.closePopover();
      }
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

  /**
   * Navigate to today
   */
  protected goToToday(): void {
    if (isPlatformBrowser(this.platformId) && this.calendarComponentRef) {
      const calendarApi = this.calendarComponentRef.instance.getApi();
      calendarApi.today();
    }
  }

  /**
   * Navigate to the previous event
   */
  protected prevEvent(): void {
    const events = this.sortedEvents();
    if (events.length === 0) return;
    const newIndex = (this.currentEventIndex() - 1 + events.length) % events.length;
    this.currentEventIndex.set(newIndex);
    this.navigateToEvent(newIndex);
  }

  /**
   * Navigate to the next event
   */
  protected nextEvent(): void {
    const events = this.sortedEvents();
    if (events.length === 0) return;
    const newIndex = (this.currentEventIndex() + 1) % events.length;
    this.currentEventIndex.set(newIndex);
    this.navigateToEvent(newIndex);
  }

  private navigateToEvent(index: number): void {
    const events = this.sortedEvents();
    if (index < 0 || index >= events.length) return;
    const event = events[index];
    const date = event.start instanceof Date ? event.start : new Date(event.start);
    if (!isNaN(date.getTime()) && this.calendarComponentRef) {
      const calendarApi = this.calendarComponentRef.instance.getApi();
      calendarApi.gotoDate(date);
    }
  }
}
