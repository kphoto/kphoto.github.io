/** A calendar date without any time or zone information. */
export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1] ?? 0;
}

/**
 * Parses a strict `YYYY-MM-DD` string into a {@link CalendarDate}, rejecting
 * impossible dates such as `2026-02-30`. Throws on invalid input.
 */
export function parseIsoDate(value: string): CalendarDate {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid ISO date "${value}": expected YYYY-MM-DD`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid ISO date "${value}": month must be 01-12`);
  }
  if (day < 1 || day > daysInMonth(year, month)) {
    throw new Error(`Invalid ISO date "${value}": day is out of range for the month`);
  }
  return { year, month, day };
}

export function isValidIsoDate(value: string): boolean {
  try {
    parseIsoDate(value);
    return true;
  } catch {
    return false;
  }
}

/** Sorts ISO dates newest first; ties resolve to zero. */
export function compareIsoDatesDesc(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  return a < b ? 1 : -1;
}

/** Formats an ISO date as prose, e.g. `March 22, 2026`. */
export function formatDisplayDate(isoDate: string): string {
  const { year, month, day } = parseIsoDate(isoDate);
  const monthName = MONTH_NAMES[month - 1] ?? '';
  return `${monthName} ${String(day)}, ${String(year)}`;
}

/** Expands an ISO date to a UTC midnight timestamp for feeds and sitemaps. */
export function toUtcTimestamp(isoDate: string): string {
  parseIsoDate(isoDate);
  return `${isoDate}T00:00:00Z`;
}
