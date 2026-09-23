/**
 * Live statistics — the pure part (ADRs 0022–0025). Types, response
 * validation, the tracking policy and text formatting live here with no DOM,
 * no network and no clock, so every rule is unit-tested directly.
 */

/**
 * How often a visible tab checks in. The database counts a tab as "here now"
 * for 90 s after its last check-in (`kphoto_stats.active_cutoff()` in
 * `docs/supabase/live-stats.sql`) — three missed heartbeats. Keep in sync.
 */
export const HEARTBEAT_INTERVAL_MS = 30_000;

/** How often `/live/` refreshes its board. */
export const BOARD_INTERVAL_MS = 20_000;

/** Every request is abandoned after this long; the page never waits on it. */
export const REQUEST_TIMEOUT_MS = 5_000;

/** Consecutive failures that open the circuit breaker (ADR 0025). */
export const MAX_CONSECUTIVE_FAILURES = 3;

/** How long an open breaker keeps every page on this browser from trying. */
export const BREAKER_COOLDOWN_MS = 10 * 60_000;

/** Returning to a tab never re-polls faster than this. */
export const MIN_POLL_GAP_MS = 5_000;

/** localStorage key holding the breaker's "retry after" epoch milliseconds. */
export const BREAKER_KEY = 'kphoto:live-stats:retry-after:v1';

export interface LiveSiteTotals {
  /** Tabs anywhere on the site that checked in within the last 90 s. */
  readonly siteNow: number;
  /** Page views across the site in the rolling last hour. */
  readonly siteViews1h: number;
  /** Page views across the site in the rolling last 24 hours. */
  readonly siteViews24h: number;
}

export interface LiveSummary extends LiveSiteTotals {
  /** Tabs on this page that checked in within the last 90 s. */
  readonly pageNow: number;
  /** Views of this page in the rolling last 24 hours. */
  readonly pageViews24h: number;
}

export interface LivePageRow {
  readonly path: string;
  readonly now: number;
  readonly views1h: number;
  readonly views24h: number;
}

export interface LiveBoard extends LiveSiteTotals {
  /** The busiest pages, already ordered by the database. */
  readonly pages: readonly LivePageRow[];
}

/** Raised when a response does not have the documented shape. */
export class LiveStatsShapeError extends Error {
  override readonly name = 'LiveStatsShapeError';
}

/**
 * The same rule as `kphoto_stats.valid_path()` in SQL: a site-absolute path
 * of URL-safe characters, at most 200 long, never protocol-relative. Paths
 * from the server are re-checked with this before they become links.
 */
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

/** Validates a `kp_heartbeat` / `kp_summary` response. */
export function parseSummary(value: unknown): LiveSummary {
  const input = record(value);
  return {
    ...parseTotals(input),
    pageNow: count(input, 'pageNow'),
    pageViews24h: count(input, 'pageViews24h'),
  };
}

/** Validates a `kp_board` response; rows with unsafe paths are dropped. */
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

/**
 * `track` sends heartbeats (and so counts the visit); `observe` only reads.
 * A visit counts only on the production origin, and never for automated
 * browsers or visitors who send Global Privacy Control (ADR 0023).
 */
export type TrackingMode = 'track' | 'observe';

export interface TrackingEnvironment {
  /** `location.origin` of the page being viewed. */
  readonly pageOrigin: string;
  /** The deployed site's origin (`siteConfig.url`). */
  readonly siteOrigin: string;
  /** `navigator.webdriver` — true under Playwright and other automation. */
  readonly webdriver: boolean;
  /** `navigator.globalPrivacyControl`, where the browser exposes it. */
  readonly globalPrivacyControl: boolean;
}

export function chooseTrackingMode(environment: TrackingEnvironment): TrackingMode {
  const production = environment.pageOrigin === environment.siteOrigin;
  return production && !environment.webdriver && !environment.globalPrivacyControl
    ? 'track'
    : 'observe';
}

/** Formats integers for display; injected so tests pin the locale. */
export type CountFormatter = (value: number) => string;

export function makeCountFormatter(locale: string): CountFormatter {
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  return (value) => format.format(value);
}

function plural(value: number, one: string, many: string): string {
  return value === 1 ? one : many;
}

/** The footer's one-line summary, e.g. "3 readers on the site right now…". */
export function describeSummary(summary: LiveSummary, format: CountFormatter): string {
  const readers = `${format(summary.siteNow)} ${plural(summary.siteNow, 'reader', 'readers')}`;
  const views = `${format(summary.siteViews24h)} page ${plural(summary.siteViews24h, 'view', 'views')}`;
  return `${readers} on the site right now, ${format(summary.pageNow)} on this page · ${views} in the last 24 hours`;
}

/** The `/live/` headline figures, in display order. */
export function describeTotals(
  totals: LiveSiteTotals,
  format: CountFormatter,
): readonly (readonly [label: string, value: string])[] {
  return [
    ['Here right now', format(totals.siteNow)],
    ['Views, last hour', format(totals.siteViews1h)],
    ['Views, last 24 hours', format(totals.siteViews24h)],
  ];
}

/** One `/live/` table row as display strings (the path doubles as the href). */
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
