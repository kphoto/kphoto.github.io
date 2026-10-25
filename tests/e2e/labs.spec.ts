import { expect, test } from './fixtures.ts';
import type { Locator, Page } from '@playwright/test';

const LAB = '/labs/flapping-airplane/';

async function ready(page: Page): Promise<Locator> {
  await page.goto(LAB);
  const flipbook = page.locator('kp-flipbook');
  await expect(flipbook).toHaveAttribute('data-state', 'ready', { timeout: 20_000 });
  return flipbook;
}

test.describe('labs', () => {
  test('the index links to the flapping airplane lab', async ({ page }) => {
    await page.goto('/labs/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Labs');
    await page.getByRole('link', { name: 'How the flapping airplane flies' }).click();
    await expect(page).toHaveURL(LAB);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'How the flapping airplane flies',
    );
  });

  test('carries the image disclaimer', async ({ page }) => {
    await page.goto(LAB);
    await expect(page.getByRole('note')).toContainText('demonstration purposes only');
  });
});

test.describe('the flipbook', () => {
  test('loads every drawing from this origin', async ({ page, baseURL }) => {
    const frames: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/images/flapping-airplanes/frame_')) {
        frames.push(request.url());
      }
    });
    await ready(page);
    expect(frames.length).toBeGreaterThan(0);
    for (const url of frames) {
      expect(url.startsWith(baseURL ?? '')).toBe(true);
    }
  });

  test('starts paused under reduced motion with every control enabled', async ({ page }) => {
    const flipbook = await ready(page);
    await expect(flipbook).toHaveAttribute('data-playing', 'false');
    await expect(flipbook).toHaveAttribute('data-frame', '0');
    await expect(flipbook.getByRole('button', { name: 'Play' })).toBeEnabled();
    await expect(flipbook.getByRole('slider', { name: 'Frames per second' })).toBeEnabled();
  });

  test('steps one drawing at a time and names the file', async ({ page }) => {
    const flipbook = await ready(page);
    const next = flipbook.getByRole('button', { name: 'Next frame' });
    await next.click();
    await next.click();
    await expect(flipbook).toHaveAttribute('data-frame', '2');
    await expect(flipbook.locator('[data-out="file"]')).toHaveText('frame_003.png');
    await flipbook.getByRole('button', { name: 'Previous frame' }).click();
    await flipbook.getByRole('button', { name: 'Previous frame' }).click();
    await flipbook.getByRole('button', { name: 'Previous frame' }).click();
    await expect(flipbook).toHaveAttribute('data-frame', '27');
  });

  test('plays, pauses and remembers the choice', async ({ page }) => {
    const flipbook = await ready(page);
    await flipbook.getByRole('button', { name: 'Play' }).click();
    await expect(flipbook).toHaveAttribute('data-playing', 'true');
    await expect(flipbook).not.toHaveAttribute('data-frame', '0');
    await flipbook.getByRole('button', { name: 'Pause' }).click();
    await expect(flipbook).toHaveAttribute('data-playing', 'false');
    const stored = await page.evaluate(() => localStorage.getItem('kphoto:flipbook:v1'));
    expect(JSON.parse(stored ?? '{}')).toEqual({ autoplay: false });
  });

  test('switches drawing technique and keeps it across a reload', async ({ page }) => {
    const flipbook = await ready(page);
    for (const [label, renderer] of [
      ['Canvas', 'canvas'],
      ['CSS only', 'css'],
      ['Image', 'image'],
      ['Canvas', 'canvas'],
    ] as const) {
      await flipbook.getByRole('radio', { name: label }).check();
      await expect(flipbook).toHaveAttribute('data-renderer', renderer);
      await expect(flipbook.locator(`[data-surface="${renderer}"]`)).toBeVisible();
    }
    await flipbook.getByRole('slider', { name: 'Frames per second' }).fill('24');
    await expect(flipbook.locator('[data-out="fps"]')).toHaveText('24');
    await page.reload();
    await expect(flipbook).toHaveAttribute('data-state', 'ready', { timeout: 20_000 });
    await expect(flipbook).toHaveAttribute('data-renderer', 'canvas');
    await expect(flipbook.getByRole('radio', { name: 'Canvas' })).toBeChecked();
    await expect(flipbook.locator('[data-out="fps"]')).toHaveText('24');
  });

  test('the CSS technique holds the chosen drawing while paused', async ({ page }) => {
    const flipbook = await ready(page);
    await flipbook.getByRole('radio', { name: 'CSS only' }).check();
    await flipbook.getByRole('slider', { name: 'Frame', exact: true }).fill('12');
    await expect(flipbook).toHaveAttribute('data-frame', '11');
    const background = await flipbook
      .locator('[data-surface="css"]')
      .evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(background).toContain('frame_012.png');
  });

  test('the climb slider tilts the airplane like the original', async ({ page }) => {
    const flipbook = await ready(page);
    await flipbook.getByRole('slider', { name: 'Climb' }).fill('60');
    await expect(flipbook.locator('[data-out="climb"]')).toHaveText('14°');
  });

  test('speaks Spanish under /es/', async ({ page }) => {
    await page.goto(`/es${LAB}`);
    const flipbook = page.locator('kp-flipbook');
    await expect(flipbook).toHaveAttribute('data-state', 'ready', { timeout: 20_000 });
    await expect(flipbook.getByRole('button', { name: 'Reproducir' })).toBeVisible();
    await expect(page.getByRole('note')).toContainText('fines educativos y de demostración');
  });
});
