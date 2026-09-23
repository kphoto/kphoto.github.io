import type { Page, Route } from '@playwright/test';
import { BREAKER_KEY } from '../../src/client/liveStats';
import { liveStatsEnabled, siteConfig } from '../../src/lib/config';
import { expect, recordBackendRequests, SUPABASE, test } from './fixtures';

const enabled = liveStatsEnabled(siteConfig);

const summary = { siteNow: 3, siteViews1h: 12, siteViews24h: 1234, pageNow: 1, pageViews24h: 40 };
const board = {
  siteNow: 3,
  siteViews1h: 12,
  siteViews24h: 1234,
  pages: [
    { path: '/blog/', now: 2, views1h: 7, views24h: 900 },
    { path: 'javascript:alert(1)', now: 9, views1h: 9, views24h: 9 },
    { path: '/about/', now: 1, views1h: 5, views24h: 334 },
  ],
};

/** Answers every Supabase RPC with `respond(functionName)`. */
async function mockBackend(
  page: Page,
  respond: (fn: string, route: Route) => { status: number; body?: unknown },
): Promise<void> {
  await page.route(SUPABASE, async (route) => {
    const fn = new URL(route.request().url()).pathname.split('/').pop() ?? '';
    const { status, body } = respond(fn, route);
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: body === undefined ? '' : JSON.stringify(body),
    });
  });
}

const liveLine = (page: Page) => page.locator('kp-live-stats p');

test.describe('live statistics switched off', () => {
  test.skip(enabled, 'this build has live statistics switched on');

  test('no live markup and no requests anywhere', async ({ page }) => {
    const requests = recordBackendRequests(page);
    await page.goto('/');
    await expect(page.locator('kp-footer')).toBeVisible();
    await expect(page.locator('kp-live-stats')).toHaveCount(0);
    await page.goto('/live/');
    await expect(page.getByText('switched off in this build')).toBeVisible();
    expect(requests).toEqual([]);
  });
});

test.describe('live statistics switched on', () => {
  test.skip(!enabled, 'this build has live statistics switched off (no publishable key)');

  test('the footer shows live numbers from a read-only summary', async ({ page }) => {
    const requests = recordBackendRequests(page);
    await mockBackend(page, () => ({ status: 200, body: summary }));
    await page.goto('/about/');
    await expect(liveLine(page)).toBeVisible();
    await expect(liveLine(page)).toContainText(
      '3 readers on the site right now, 1 on this page · 1,234 page views in the last 24 hours',
    );
    await expect(page.locator('kp-live-stats').getByRole('link')).toHaveAttribute('href', '/live/');

    const [first] = requests;
    expect(first?.method()).toBe('GET');
    expect(first?.url()).toContain('/rest/v1/rpc/kp_summary?p_path=%2Fabout%2F');
    const headers = await first?.allHeaders();
    expect(headers?.apikey).toBe(siteConfig.liveStats.publishableKey);
    expect(headers?.authorization).toBeUndefined();
  });

  test('automated browsers never count a visit', async ({ page }) => {
    const requests = recordBackendRequests(page);
    await mockBackend(page, () => ({ status: 200, body: summary }));
    await page.goto('/blog/');
    await expect(liveLine(page)).toBeVisible();
    expect(requests.map((request) => request.url())).not.toContainEqual(
      expect.stringContaining('kp_heartbeat'),
    );
  });

  test('an unreachable backend leaves the page exactly as it was', async ({ page }) => {
    // No page.route: the fixture's "backend unreachable" applies.
    await page.goto('/about/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
    await expect(page.locator('kp-footer').getByText('on GitHub')).toBeVisible();
    await expect(liveLine(page)).toBeHidden();
  });

  test('a permanent failure trips the breaker for every later page', async ({ page }) => {
    await mockBackend(page, () => ({ status: 404, body: { code: 'PGRST202' } }));
    await page.goto('/about/');
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), BREAKER_KEY))
      .not.toBeNull();
    await expect(liveLine(page)).toBeHidden();

    const requests = recordBackendRequests(page);
    await page.goto('/blog/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog');
    await page.waitForLoadState('networkidle');
    expect(requests).toEqual([]);
  });

  test('/live/ renders totals and the busiest pages, dropping unsafe paths', async ({ page }) => {
    await mockBackend(page, (fn) =>
      fn === 'kp_board' ? { status: 200, body: board } : { status: 200, body: summary },
    );
    await page.goto('/live/');
    const liveBoard = page.locator('kp-live-board');
    await expect(liveBoard.locator('dd').first()).toHaveText('3');
    await expect(liveBoard.locator('dd').nth(2)).toHaveText('1,234');
    const rows = liveBoard.locator('tbody tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0).getByRole('link')).toHaveAttribute('href', '/blog/');
    await expect(rows.nth(0)).toContainText('900');
    await expect(rows.nth(1).getByRole('link')).toHaveAttribute('href', '/about/');
    await expect(liveBoard.locator('.status')).toBeHidden();
  });

  test('/live/ says so, calmly, when the backend is gone', async ({ page }) => {
    await mockBackend(page, () => ({ status: 402 }));
    await page.goto('/live/');
    await expect(page.locator('kp-live-board').getByRole('status')).toHaveText(
      'Live statistics are unavailable right now. The rest of the site is unaffected.',
    );
    await expect(page.locator('kp-live-board table')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'What is collected' })).toBeVisible();
  });

  test('/live/ shows an empty state for a quiet day', async ({ page }) => {
    await mockBackend(page, (fn) =>
      fn === 'kp_board'
        ? { status: 200, body: { siteNow: 0, siteViews1h: 0, siteViews24h: 0, pages: [] } }
        : { status: 200, body: summary },
    );
    await page.goto('/live/');
    await expect(page.locator('kp-live-board tbody')).toContainText(
      'No page views in the last 24 hours yet.',
    );
  });
});
