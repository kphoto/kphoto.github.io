import { describe, expect, it } from 'vitest';
import {
  compareIsoDatesDesc,
  formatDisplayDate,
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
