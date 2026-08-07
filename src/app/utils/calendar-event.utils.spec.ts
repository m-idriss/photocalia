import {
  formatCalendarEventInput,
  parseCalendarEventInput,
  validateCalendarEvent,
} from './calendar-event.utils';

describe('calendar event utilities', () => {
  it('preserves all-day date values without applying a timezone', () => {
    expect(formatCalendarEventInput('2026-08-15', true)).toBe('2026-08-15T00:00');
    expect(parseCalendarEventInput('2026-08-15T00:00', true)).toBe('2026-08-15');
  });

  it('formats and parses timed values in local browser time', () => {
    const date = new Date(2026, 7, 7, 10, 30);
    expect(formatCalendarEventInput(date)).toBe('2026-08-07T10:30');
    expect(parseCalendarEventInput('2026-08-07T10:30')).toEqual(date);
  });

  it('reports stable validation issues without exposing event content', () => {
    expect(
      validateCalendarEvent({
        summary: '   ',
        start: '2026-08-08T10:00:00Z',
        end: '2026-08-08T09:00:00Z',
      }),
    ).toEqual(['missing-summary', 'end-before-start']);
  });

  it('reports invalid dates independently', () => {
    expect(validateCalendarEvent({ summary: 'Broken', start: 'bad', end: 'also-bad' })).toEqual([
      'invalid-start',
      'invalid-end',
    ]);
  });
});
