import ICAL from '../libs/ical-wrapper';
import { CalendarEvent } from '../models/calendar-event.model';
import { validateCalendarEvent } from './calendar-event.utils';

export interface IcsGenerationOptions {
  now?: Date;
  uidFactory?: (event: CalendarEvent, index: number) => string;
}

export function parseIcsEvents(raw: string, repair = true): CalendarEvent[] {
  const source = repair ? repairIcsContent(raw) : sanitizeIcs(raw);
  const calendar = new ICAL.Component(ICAL.parse(source));
  const vevents = calendar.getAllSubcomponents('vevent');

  // ICAL.js does not expose complete TypeScript declarations through the local wrapper.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return vevents.map((vevent: any) => {
    const event = new ICAL.Event(vevent);
    const allDay = event.startDate.isDate;
    return {
      summary: event.summary,
      description: event.description,
      location: event.location,
      // A DATE value is a calendar date, not a midnight instant. Converting it through
      // JavaScript Date shifts the day in negative UTC offsets and breaks round-trips.
      start: allDay ? event.startDate.toString().slice(0, 10) : event.startDate.toJSDate(),
      end: allDay ? event.endDate.toString().slice(0, 10) : event.endDate.toJSDate(),
      allDay,
    };
  });
}

export function generateIcs(
  events: readonly CalendarEvent[],
  options: IcsGenerationOptions = {},
): string {
  const now = options.now ?? new Date();
  const uidFactory = options.uidFactory ?? defaultUid;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PhotoCalia Calendar Converter//EN',
    'CALSCALE:GREGORIAN',
  ];

  events.forEach((event, index) => {
    const issues = validateCalendarEvent(event);
    if (issues.includes('invalid-start') || issues.includes('invalid-end')) {
      throw new Error('Invalid calendar event date');
    }
    if (issues.includes('missing-summary')) throw new Error('Invalid calendar event summary');
    if (issues.includes('end-before-start'))
      throw new Error('Calendar event ends before it starts');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${escapeIcsText(uidFactory(event, index))}`);
    lines.push(`DTSTAMP:${dateToIcsUtc(now)}`);

    if (event.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${dateToIcsDate(event.start)}`);
      lines.push(`DTEND;VALUE=DATE:${dateToIcsDate(event.end)}`);
    } else {
      lines.push(`DTSTART:${dateToIcsUtc(event.start)}`);
      lines.push(`DTEND:${dateToIcsUtc(event.end)}`);
    }

    lines.push(`SUMMARY:${escapeIcsText(event.summary)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return `${lines.flatMap(foldIcsLine).join('\r\n')}\r\n`;
}

export function sanitizeIcs(raw: string): string {
  return raw
    .replace(/```(?:ics|icalendar)?/gi, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() === '' || /^[A-Z0-9-]+[;:]/i.test(line) || /^ /u.test(line))
    .join('\r\n')
    .trim();
}

export function repairIcsContent(raw: string): string {
  if (!raw) return '';

  let ics = sanitizeIcs(raw.replace(/\r\n|\r|\n/g, '\n')).replace(/\r\n{2,}/g, '\r\n');
  if (!ics.includes('BEGIN:VCALENDAR')) ics = `BEGIN:VCALENDAR\r\n${ics}`;
  if (!ics.includes('END:VCALENDAR')) ics += '\r\nEND:VCALENDAR';
  if (!/VERSION:2\.0/u.test(ics)) {
    ics = ics.replace('BEGIN:VCALENDAR\r\n', 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n');
  }
  if (!/PRODID:/u.test(ics)) {
    ics = ics.replace(
      'VERSION:2.0\r\n',
      'VERSION:2.0\r\nPRODID:-//PhotoCalia Calendar Converter//EN\r\n',
    );
  }
  return ics.trim();
}

export function escapeIcsText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r\n', '\\n')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;');
}

function dateToIcsUtc(value: string | Date): string {
  const date = validDate(value);
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function dateToIcsDate(value: string | Date): string {
  const date = validDate(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function validDate(value: string | Date): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid calendar event date');
  return date;
}

function defaultUid(_event: CalendarEvent, index: number): string {
  const randomId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${index}`;
  return `${randomId}@photocalia.com`;
}

function foldIcsLine(line: string): string[] {
  const chunks: string[] = [];
  let remainder = line;
  while (remainder.length > 73) {
    chunks.push(remainder.slice(0, 73));
    remainder = ` ${remainder.slice(73)}`;
  }
  chunks.push(remainder);
  return chunks;
}
