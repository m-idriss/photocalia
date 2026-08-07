import ICAL from '../libs/ical-wrapper';
import { generateIcs, parseIcsEvents, repairIcsContent } from './ics.utils';

describe('ICS utilities', () => {
  it('generates independently parseable timed events and escapes text', () => {
    const ics = generateIcs(
      [
        {
          summary: 'Réunion, équipe; produit',
          start: '2026-08-07T08:00:00.000Z',
          end: '2026-08-07T09:00:00.000Z',
          location: 'Paris, France',
          description: 'Ligne 1\nLigne 2',
        },
      ],
      {
        now: new Date('2026-08-01T12:00:00.000Z'),
        uidFactory: () => 'fixture-1@photocalia.com',
      },
    );

    expect(() => ICAL.parse(ics)).not.toThrow();
    expect(ics).toContain('SUMMARY:Réunion\\, équipe\\; produit');
    expect(ics).toContain('DESCRIPTION:Ligne 1\\nLigne 2');

    const [event] = parseIcsEvents(ics, false);
    expect(event.summary).toBe('Réunion, équipe; produit');
    expect(event.location).toBe('Paris, France');
    expect(event.allDay).toBeFalse();
  });

  it('preserves all-day semantics', () => {
    const ics = generateIcs(
      [
        {
          summary: 'Jour férié',
          start: new Date('2026-08-15T00:00:00.000Z'),
          end: new Date('2026-08-16T00:00:00.000Z'),
          allDay: true,
        },
      ],
      { uidFactory: () => 'all-day@photocalia.com' },
    );

    expect(ics).toContain('DTSTART;VALUE=DATE:20260815');
    const [event] = parseIcsEvents(ics, false);
    expect(event.allDay).toBeTrue();
    expect(event.start).toBe('2026-08-15');
    expect(event.end).toBe('2026-08-16');
    expect(generateIcs([event])).toContain('DTSTART;VALUE=DATE:20260815');
  });

  it('repairs a provider response without removing accented text', () => {
    const repaired = repairIcsContent('```ics\nBEGIN:VEVENT\nSUMMARY:Déjeuner\nEND:VEVENT\n```');

    expect(repaired).toContain('BEGIN:VCALENDAR');
    expect(repaired).toContain('VERSION:2.0');
    expect(repaired).toContain('SUMMARY:Déjeuner');
    expect(repaired).toContain('END:VCALENDAR');
  });

  it('rejects invalid event dates during generation', () => {
    expect(() =>
      generateIcs([{ summary: 'Broken', start: 'not-a-date', end: 'also-broken' }]),
    ).toThrowError('Invalid calendar event date');
  });
});
