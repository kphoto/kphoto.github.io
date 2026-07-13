import { describe, expect, it } from 'vitest';
import {
  compareIsoDatesDesc,
  formatDisplayDate,
  isoDateInTimeZone,
  isValidIsoDate,
  parseIsoDate,
  toUtcTimestamp,
} from './dates';

describe('parseIsoDate', () => {
  it('parses a valid date', () => {
    expect(parseIsoDate('2026-03-22')).toEqual({ year: 2026, month: 3, day: 22 });
  });

  it('rejects malformed strings', () => {
    for (const bad of ['2026-3-22', '20260322', '2026-03-22T00:00', 'yesterday']) {
      expect(() => parseIsoDate(bad)).toThrow();
    }
  });

  it('rejects impossible calendar dates', () => {
    expect(() => parseIsoDate('2026-02-30')).toThrow();
    expect(() => parseIsoDate('2026-13-01')).toThrow();
    expect(() => parseIsoDate('2026-04-31')).toThrow();
  });

  it('knows leap years', () => {
    expect(isValidIsoDate('2024-02-29')).toBe(true); // divisible by 4
    expect(isValidIsoDate('2026-02-29')).toBe(false); // common year
    expect(isValidIsoDate('2000-02-29')).toBe(true); // divisible by 400
    expect(isValidIsoDate('1900-02-29')).toBe(false); // divisible by 100 only
  });
});

describe('compareIsoDatesDesc', () => {
  it('sorts newest first', () => {
    const dates = ['2026-03-22', '2026-04-01', '2025-12-31'];
    expect([...dates].sort(compareIsoDatesDesc)).toEqual([
      '2026-04-01',
      '2026-03-22',
      '2025-12-31',
    ]);
  });

  it('returns 0 for equal dates', () => {
    expect(compareIsoDatesDesc('2026-03-22', '2026-03-22')).toBe(0);
  });
});

describe('formatDisplayDate', () => {
  it('formats without any locale machinery', () => {
    expect(formatDisplayDate('2026-03-22')).toBe('March 22, 2026');
    expect(formatDisplayDate('2026-01-01')).toBe('January 1, 2026');
  });
});

describe('toUtcTimestamp', () => {
  it('renders midnight UTC', () => {
    expect(toUtcTimestamp('2026-03-22')).toBe('2026-03-22T00:00:00Z');
  });
});

describe('isoDateInTimeZone', () => {
  it('maps one instant to different calendar dates across zones', () => {
    // 03:30 UTC on July 14 is still 23:30 on July 13 in New York.
    const instant = new Date('2026-07-14T03:30:00Z');
    expect(isoDateInTimeZone(instant, 'America/New_York')).toBe('2026-07-13');
    expect(isoDateInTimeZone(instant, 'UTC')).toBe('2026-07-14');
    expect(isoDateInTimeZone(instant, 'Asia/Tokyo')).toBe('2026-07-14');
  });

  it('handles the winter offset too', () => {
    // 04:30 UTC on January 2 is 23:30 on January 1 in New York (EST).
    const instant = new Date('2026-01-02T04:30:00Z');
    expect(isoDateInTimeZone(instant, 'America/New_York')).toBe('2026-01-01');
  });

  it('rejects a time zone the runtime does not know', () => {
    expect(() => isoDateInTimeZone(new Date(), 'Neverland/Nowhere')).toThrow();
  });
});
