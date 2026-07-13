import { expect, test } from '@playwright/test';
import { siteConfig } from '../../src/lib/config';

test.describe('home page', () => {
  test('shows the hero and the latest posts', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('kphoto');
    await expect(page.locator('.hero-frontmatter')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'The modern web, hand-rolled.',
    );
    const cards = page.locator('kp-post-card');
    await expect(cards).toHaveCount(siteConfig.postsOnHome);
  });

  test('navigates from a post card to the post', async ({ page }) => {
    await page.goto('/');
    // Content-agnostic on purpose (ADR 0010): the newest published post
    // changes every time an episode goes live, so the test derives the
    // expected URL and title from the first card instead of naming one.
    const link = page.locator('kp-post-card').first().locator('h2 a');
    const href = (await link.getAttribute('href')) ?? '';
    const title = ((await link.textContent()) ?? '').trim();
    expect(href).toMatch(/^\/blog\/\d{4}-\d{2}-\d{2}-[a-z0-9-]+\/$/);
    expect(title.length).toBeGreaterThan(0);
    await link.click();
    await expect(page).toHaveURL(href);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  });
});

test.describe('header navigation', () => {
  test('marks the current section with aria-current', async ({ page }) => {
    await page.goto('/blog/2026-03-22-good-morning/');
    const blogLink = page.locator('kp-header').getByRole('link', { name: 'Blog' });
    await expect(blogLink).toHaveAttribute('aria-current', 'page');
  });

  test('reaches every section from the header', async ({ page }) => {
    await page.goto('/');
    for (const [name, url, heading] of [
      ['Blog', '/blog/', 'Blog'],
      ['Tags', '/tags/', 'Tags'],
      ['Series', '/series/', 'Series'],
      ['Authors', '/authors/', 'Authors'],
      ['About', '/about/', 'About'],
      ['Contact', '/contact/', 'Contact'],
    ] as const) {
      await page.locator('kp-header').getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    }
  });
});

test.describe('date-stamped URLs', () => {
  test('two posts share a title but not a URL, newest first on the tag page', async ({ page }) => {
    await page.goto('/tags/introductions/');
    const links = page.locator('kp-post-card').getByRole('link', { name: 'Good morning!' });
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toHaveAttribute('href', '/blog/2026-04-01-good-morning/');
    await expect(links.nth(1)).toHaveAttribute('href', '/blog/2026-03-22-good-morning/');
  });
});

test.describe('series', () => {
  test('series page lists episodes in ascending order', async ({ page }) => {
    await page.goto('/series/typescript-7-in-practice/');
    const titles = page.locator('kp-post-card h2 a');
    await expect(titles).toHaveCount(3);
    await expect(titles.nth(0)).toHaveAttribute(
      'href',
      '/blog/2026-05-05-typescript-7-native-compiler/',
    );
    await expect(titles.nth(2)).toHaveAttribute(
      'href',
      '/blog/2026-05-19-scoped-styles-with-declarative-shadow-dom/',
    );
  });

  test('a middle episode links to its neighbours', async ({ page }) => {
    await page.goto('/blog/2026-05-12-a-markdown-renderer-from-scratch/');
    const nav = page.locator('kp-series-nav').first();
    await expect(nav).toContainText('Part 2 of 3');
    await expect(nav.getByRole('link', { name: /native compiler/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /declarative shadow DOM/i })).toBeVisible();
  });
});

test.describe('theming', () => {
  test('the picker applies a theme and it survives a reload', async ({ page }) => {
    await page.goto('/');
    const select = page.locator('kp-theme-picker select');
    await select.selectOption('solarized-dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'solarized-dark');

    const stored = await page.evaluate(() => localStorage.getItem('kphoto:settings:v1'));
    expect(stored).toBe('{"theme":"solarized-dark"}');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'solarized-dark');
    await expect(select).toHaveValue('solarized-dark');
  });

  test('system follows the OS colour scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('resilience and accessibility', () => {
  test('unknown paths return the 404 page with a 404 status', async ({ page }) => {
    const response = await page.goto('/definitely-not-a-page/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nothing at this address.');
  });

  test('the skip link jumps to the main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/#main');
    await expect(page.locator('main#main')).toBeFocused();
  });

  test('every page advertises the Atom feed', async ({ page }) => {
    await page.goto('/about/');
    await expect(
      page.locator('link[rel="alternate"][type="application/atom+xml"]'),
    ).toHaveAttribute('href', '/feed.xml');
  });
});
