import { formatMessage, formatNumber, isMessageValue, type MessageValue } from '../i18n/format.ts';
import type { MessageKey } from '../i18n/messages/index.ts';

export const HEARTBEAT_INTERVAL_MS = 30_000;

export const BOARD_INTERVAL_MS = 20_000;

export const REQUEST_TIMEOUT_MS = 5_000;

export const MAX_CONSECUTIVE_FAILURES = 3;

export const BREAKER_COOLDOWN_MS = 10 * 60_000;

export const MIN_POLL_GAP_MS = 5_000;

export const BREAKER_KEY = 'kphoto:live-stats:retry-after:v1';

export interface LiveSiteTotals {
  readonly siteNow: number;

  readonly siteViews1h: number;

  readonly siteViews24h: number;
}

export interface LiveSummary extends LiveSiteTotals {
  readonly pageNow: number;

  readonly pageViews24h: number;
}

export interface LivePageRow {
  readonly path: string;
  readonly now: number;
  readonly views1h: number;
  readonly views24h: number;
}

export interface LiveBoard extends LiveSiteTotals {
  readonly pages: readonly LivePageRow[];
}

export class LiveStatsShapeError extends Error {
  override readonly name = 'LiveStatsShapeError';
}

export function isSafePath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= 200 &&
    /^\/[A-Za-z0-9._~/-]*$/.test(value) &&
    !value.startsWith('//')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function count(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new LiveStatsShapeError(`expected a non-negative integer "${key}"`);
  }
  return value;
}

function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new LiveStatsShapeError('expected a JSON object');
  }
  return value;
}

function parseTotals(input: Record<string, unknown>): LiveSiteTotals {
  return {
    siteNow: count(input, 'siteNow'),
    siteViews1h: count(input, 'siteViews1h'),
    siteViews24h: count(input, 'siteViews24h'),
  };
}

export function parseSummary(value: unknown): LiveSummary {
  const input = record(value);
  return {
    ...parseTotals(input),
    pageNow: count(input, 'pageNow'),
    pageViews24h: count(input, 'pageViews24h'),
  };
}

export function parseBoard(value: unknown): LiveBoard {
  const input = record(value);
  const pages = input.pages;
  if (!Array.isArray(pages)) {
    throw new LiveStatsShapeError('expected a "pages" array');
  }
  const rows: LivePageRow[] = [];
  for (const entry of pages as unknown[]) {
    const row = record(entry);
    if (!isSafePath(row.path)) {
      continue;
    }
    rows.push({
      path: row.path,
      now: count(row, 'now'),
      views1h: count(row, 'views1h'),
      views24h: count(row, 'views24h'),
    });
  }
  return { ...parseTotals(input), pages: rows };
}

export type TrackingMode = 'track' | 'observe';

export interface TrackingEnvironment {
  readonly pageOrigin: string;

  readonly siteOrigin: string;

  readonly webdriver: boolean;

  readonly globalPrivacyControl: boolean;
}

export function chooseTrackingMode(environment: TrackingEnvironment): TrackingMode {
  const production = environment.pageOrigin === environment.siteOrigin;
  return production && !environment.webdriver && !environment.globalPrivacyControl
    ? 'track'
    : 'observe';
}

export type CountFormatter = (value: number) => string;

export function makeCountFormatter(locale: string): CountFormatter {
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  return (value) => format.format(value);
}

export const LIVE_MESSAGE_KEYS = {
  readers: 'live.readers',
  views: 'live.views',
  summary: 'live.summary',
  unavailable: 'live.unavailable',
  stillTrying: 'live.stillTrying',
  reconnecting: 'live.reconnecting',
  empty: 'live.empty',
} as const satisfies Readonly<Record<string, MessageKey>>;

export type LiveMessages = { readonly [Name in keyof typeof LIVE_MESSAGE_KEYS]: MessageValue };

export function parseLiveMessages(raw: string | undefined): LiveMessages | null {
  if (raw === undefined) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return null;
    }
    const messages: Record<string, MessageValue> = {};
    for (const name of Object.keys(LIVE_MESSAGE_KEYS)) {
      const value = parsed[name];
      if (!isMessageValue(value)) {
        return null;
      }
      messages[name] = value;
    }
    return messages as LiveMessages;
  } catch {
    return null;
  }
}

export function describeSummary(
  summary: LiveSummary,
  messages: LiveMessages,
  locale: string,
): string {
  return formatMessage(locale, messages.summary, {
    readers: formatMessage(locale, messages.readers, { count: summary.siteNow }),
    pageNow: formatNumber(locale, summary.pageNow),
    views: formatMessage(locale, messages.views, { count: summary.siteViews24h }),
  });
}

export function totalsValues(
  totals: LiveSiteTotals,
  format: CountFormatter,
): readonly [now: string, views1h: string, views24h: string] {
  return [format(totals.siteNow), format(totals.siteViews1h), format(totals.siteViews24h)];
}

export interface BoardRowView {
  readonly path: string;
  readonly cells: readonly [now: string, views1h: string, views24h: string];
}

export function boardRowViews(board: LiveBoard, format: CountFormatter): BoardRowView[] {
  return board.pages.map((row) => ({
    path: row.path,
    cells: [format(row.now), format(row.views1h), format(row.views24h)],
  }));
}
