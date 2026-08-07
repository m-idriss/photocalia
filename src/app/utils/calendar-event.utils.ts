import { CalendarEvent } from '../models/calendar-event.model';

export type CalendarEventValidationIssue =
  | 'missing-summary'
  | 'invalid-start'
  | 'invalid-end'
  | 'end-before-start';

export function validateCalendarEvent(event: CalendarEvent): CalendarEventValidationIssue[] {
  const issues: CalendarEventValidationIssue[] = [];
  if (!event.summary.trim()) issues.push('missing-summary');

  const start = calendarValueToTimestamp(event.start, event.allDay);
  const end = calendarValueToTimestamp(event.end, event.allDay);
  if (start === null) issues.push('invalid-start');
  if (end === null) issues.push('invalid-end');
  if (start !== null && end !== null && end < start) issues.push('end-before-start');
  return issues;
}

export function formatCalendarEventInput(value: string | Date, allDay = false): string {
  if (allDay && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    return `${value}T00:00`;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function parseCalendarEventInput(value: string, allDay = false): string | Date {
  return allDay ? value.slice(0, 10) : new Date(value);
}

function calendarValueToTimestamp(value: string | Date, allDay = false): number | null {
  if (allDay && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    const timestamp = Date.parse(`${value}T00:00:00Z`);
    return Number.isNaN(timestamp) ? null : timestamp;
  }
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}
