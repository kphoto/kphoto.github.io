import { describe, expect, it } from 'vitest';
import { en } from '../i18n/messages/en.ts';
import { es } from '../i18n/messages/es.ts';
import {
  boardRowViews,
  chooseTrackingMode,
  describeSummary,
  LIVE_MESSAGE_KEYS,
  parseLiveMessages,
  totalsValues,
  type LiveMessages,
  HEARTBEAT_INTERVAL_MS,
  isSafePath,
  LiveStatsShapeError,
  makeCountFormatter,
  MIN_POLL_GAP_MS,
  parseBoard,
  parseSummary,
  REQUEST_TIMEOUT_MS,
  type LiveSummary,
} from './liveStats.ts';

const summary: LiveSummary = {
  siteNow: 3,
  siteViews1h: 12,
  siteViews24h: 1234,
  pageNow: 1,
  pageViews24h: 40,
};

const format = makeCountFormatter('en');

describe('timing constants', () => {
  it('keep a tab counted across two missed heartbeats (server cutoff is 90 s)', () => {
    expect(HEARTBEAT_INTERVAL_MS * 3).toBe(90_000);
  });

  it('never let a request outlive the gap between polls', () => {
    expect(REQUEST_TIMEOUT_MS).toBeLessThanOrEqual(MIN_POLL_GAP_MS);
  });
});

describe('isSafePath', () => {
  it.each(['/', '/blog/2026-03-22-good-morning/', '/404.html', '/tags/a_b~c.d/'])(
    'accepts %s',
    (path) => {
      expect(isSafePath(path)).toBe(true);
    },
  );

  it.each([
    '',
    'blog/',
    '//evil.example/',
    'javascript:alert(1)',
    '/a b/',
    '/<script>/',
    '/über/',
    '/?q=1',
    '/#x',
    `/${'a'.repeat(200)}`,
  ])('rejects %j', (path) => {
    expect(isSafePath(path)).toBe(false);
  });

  it('accepts exactly 200 characters, like the SQL rule', () => {
    expect(isSafePath(`/${'a'.repeat(199)}`)).toBe(true);
  });

  it('rejects non-strings', () => {
    expect(isSafePath(undefined)).toBe(false);
    expect(isSafePath(42)).toBe(false);
  });
});

describe('parseSummary', () => {
  it('accepts the documented shape and ignores extra keys', () => {
    expect(parseSummary({ ...summary, extra: 'ignored' })).toEqual(summary);
  });

  it.each([
    ['null', null],
    ['an array', [summary]],
    ['a string', 'nope'],
    ['a missing field', { ...summary, pageNow: undefined }],
    ['a negative count', { ...summary, siteNow: -1 }],
    ['a fractional count', { ...summary, siteNow: 1.5 }],
    ['a numeric string', { ...summary, siteNow: '3' }],
    ['an unsafe integer', { ...summary, siteNow: 2 ** 60 }],
  ])('rejects %s', (_label, value) => {
    expect(() => parseSummary(value)).toThrow(LiveStatsShapeError);
  });
});

describe('parseBoard', () => {
  const row = { path: '/blog/a/', now: 2, views1h: 5, views24h: 9 };
  const totals = { siteNow: 2, siteViews1h: 5, siteViews24h: 9 };

  it('accepts the documented shape', () => {
    expect(parseBoard({ ...totals, pages: [row] })).toEqual({ ...totals, pages: [row] });
  });

  it('accepts an empty board', () => {
    expect(parseBoard({ ...totals, pages: [] }).pages).toEqual([]);
  });

  it('drops rows whose path could not safely become a link', () => {
    const board = parseBoard({
      ...totals,
      pages: [{ ...row, path: 'javascript:alert(1)' }, row, { ...row, path: '//x/' }],
    });
    expect(board.pages).toEqual([row]);
  });

  it('keeps the server order', () => {
    const second = { ...row, path: '/b/' };
    expect(parseBoard({ ...totals, pages: [second, row] }).pages.map((r) => r.path)).toEqual([
      '/b/',
      '/blog/a/',
    ]);
  });

  it.each([
    ['a missing pages array', totals],
    ['pages that is not an array', { ...totals, pages: {} }],
    ['a row that is not an object', { ...totals, pages: [7] }],
    ['a row with a bad count', { ...totals, pages: [{ ...row, now: -2 }] }],
    ['missing totals', { pages: [] }],
  ])('rejects %s', (_label, value) => {
    expect(() => parseBoard(value)).toThrow(LiveStatsShapeError);
  });
});

describe('chooseTrackingMode', () => {
  const production = {
    pageOrigin: 'https://kphoto.github.io',
    siteOrigin: 'https://kphoto.github.io',
    webdriver: false,
    globalPrivacyControl: false,
  };

  it('tracks a real visitor on the production origin', () => {
    expect(chooseTrackingMode(production)).toBe('track');
  });

  it('only observes on any other origin (dev server, preview, forks)', () => {
    expect(chooseTrackingMode({ ...production, pageOrigin: 'http://localhost:5173' })).toBe(
      'observe',
    );
    expect(chooseTrackingMode({ ...production, pageOrigin: 'https://kphoto.github.io.evil' })).toBe(
      'observe',
    );
  });

  it('only observes under automation', () => {
    expect(chooseTrackingMode({ ...production, webdriver: true })).toBe('observe');
  });

  it('honours Global Privacy Control', () => {
    expect(chooseTrackingMode({ ...production, globalPrivacyControl: true })).toBe('observe');
  });
});

describe('makeCountFormatter', () => {
  it('groups thousands for the locale', () => {
    expect(format(1234567)).toBe('1,234,567');
    expect(makeCountFormatter('de')(1234567)).toBe('1.234.567');
  });
});

const messages = Object.fromEntries(
  Object.entries(LIVE_MESSAGE_KEYS).map(([name, key]) => [name, en[key]]),
) as unknown as LiveMessages;

describe('describeSummary', () => {
  it('reads naturally with plural counts', () => {
    expect(describeSummary(summary, messages, 'en')).toBe(
      '3 readers on the site right now, 1 on this page · 1,234 page views in the last 24 hours',
    );
  });

  it('uses the singular for exactly one', () => {
    const text = describeSummary({ ...summary, siteNow: 1, siteViews24h: 1 }, messages, 'en');
    expect(text).toContain('1 reader on the site');
    expect(text).toContain('1 page view in the last');
  });

  it('uses the plural for zero', () => {
    const text = describeSummary({ ...summary, siteNow: 0, siteViews24h: 0 }, messages, 'en');
    expect(text).toContain('0 readers');
    expect(text).toContain('0 page views');
  });

  it('follows the locale for plurals and digit grouping', () => {
    const spanish = Object.fromEntries(
      Object.entries(LIVE_MESSAGE_KEYS).map(([name, key]) => [name, es[key]]),
    ) as unknown as LiveMessages;
    expect(describeSummary({ ...summary, siteNow: 1 }, spanish, 'es')).toBe(
      '1 lector en el sitio ahora mismo, 1 en esta página · 1234 visitas en las últimas 24 horas',
    );
  });
});

describe('parseLiveMessages', () => {
  it('round-trips the messages the server renders', () => {
    expect(parseLiveMessages(JSON.stringify(messages))).toEqual(messages);
  });

  it('rejects missing, malformed or incomplete input', () => {
    expect(parseLiveMessages(undefined)).toBeNull();
    expect(parseLiveMessages('{broken')).toBeNull();
    expect(parseLiveMessages('[]')).toBeNull();
    expect(parseLiveMessages(JSON.stringify({ ...messages, readers: 3 }))).toBeNull();
    expect(parseLiveMessages(JSON.stringify({ ...messages, views: { one: 'x' } }))).toBeNull();
  });
});

describe('totalsValues', () => {
  it('formats the totals in display order', () => {
    expect(totalsValues(summary, format)).toEqual(['3', '12', '1,234']);
  });
});

describe('boardRowViews', () => {
  it('formats every cell and keeps the path for the link', () => {
    expect(
      boardRowViews(
        {
          siteNow: 0,
          siteViews1h: 0,
          siteViews24h: 0,
          pages: [{ path: '/a/', now: 1, views1h: 1000, views24h: 20000 }],
        },
        format,
      ),
    ).toEqual([{ path: '/a/', cells: ['1', '1,000', '20,000'] }]);
  });
});
