import { formatIcsDate, getMonthDay, getTime } from './date.utils';

describe('date.utils', () => {
  describe('formatIcsDate', () => {
    it('should return empty string for falsy input', () => {
      expect(formatIcsDate('')).toBe('');
    });

    it('should format all-day event date (YYYYMMDD)', () => {
      expect(formatIcsDate('20250115')).toBe('15/01/2025');
    });

    it('should format timed event with seconds (YYYYMMDDTHHMMSS)', () => {
      expect(formatIcsDate('20250115T143000')).toBe('15/01/2025 14:30');
    });

    it('should format timed event without seconds (YYYYMMDDTHHMM)', () => {
      expect(formatIcsDate('20250115T1430')).toBe('15/01/2025 14:30');
    });

    it('should handle trailing Z (UTC)', () => {
      expect(formatIcsDate('20250115T143000Z')).toBe('15/01/2025 14:30');
    });

    it('should handle timezone offset', () => {
      expect(formatIcsDate('20250115T143000+0100')).toBe('15/01/2025 14:30');
    });

    it('should return original string for unparseable input', () => {
      expect(formatIcsDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('getMonthDay', () => {
    it('should extract month abbreviation and day', () => {
      expect(getMonthDay('15/01/2025')).toBe('JAN\n15');
    });

    it('should handle date with time', () => {
      expect(getMonthDay('15/01/2025 14:30')).toBe('JAN\n15');
    });

    it('should handle December', () => {
      expect(getMonthDay('25/12/2025')).toBe('DEC\n25');
    });

    it('should return original string for invalid format', () => {
      expect(getMonthDay('invalid')).toBe('invalid');
    });
  });

  describe('getTime', () => {
    it('should extract time from date string', () => {
      expect(getTime('15/01/2025 14:30')).toBe('14:30');
    });

    it('should return empty string for date-only input', () => {
      expect(getTime('15/01/2025')).toBe('');
    });
  });
});
