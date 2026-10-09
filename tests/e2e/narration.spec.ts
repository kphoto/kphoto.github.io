import type { Page } from '@playwright/test';
import { expect, test } from './fixtures.ts';
import { SETTINGS_KEY } from '../../src/client/storage.ts';

async function openPost(page: Page, narrated: boolean): Promise<void> {
  await page.goto('/blog/');
  const badge = page.locator('.narrated');
  const cards = page.locator('kp-post-card');
  const matching = narrated ? cards.filter({ has: badge }) : cards.filter({ hasNot: badge });
  test.skip((await matching.count()) === 0, 'no such post is published');
  const link = matching.first().locator('h2 a');
  const href = (await link.getAttribute('href')) ?? '';
  await page.goto(href);
}

test.describe('narration', () => {
  test('a narrated post offers a native player that streams its recording inline', async ({
    page,
  }) => {
    await openPost(page, true);
    const audio = page.locator('kp-narration audio');
    await expect(audio).toHaveCount(1);
    await expect(audio).toHaveAttribute('controls', '');
    await expect(audio).not.toHaveAttribute('autoplay');
    await expect(audio).toHaveAccessibleName(/./);
    expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);

    const source = page.locator('kp-narration source');
    const src = (await source.getAttribute('src')) ?? '';
    const type = (await source.getAttribute('type')) ?? '';
    expect(src).toMatch(/^\/spoken\/[a-z0-9-]+\.[a-z0-9]+$/);
    expect(
      await audio.evaluate((element: HTMLAudioElement, mime) => element.canPlayType(mime), type),
    ).not.toBe('');

    const response = await page.request.get(src, { headers: { Range: 'bytes=0-1023' } });
    expect([200, 206]).toContain(response.status());
    expect(response.headers()['content-type']).toMatch(/^audio\//);
    expect(response.headers()['content-disposition'] ?? '').not.toMatch(/attachment/i);
  });

  test('a post without the badge has no player', async ({ page }) => {
    await openPost(page, false);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('kp-narration')).toHaveCount(0);
  });

  test('the listening speed is remembered across visits', async ({ page }) => {
    await openPost(page, true);
    const audio = page.locator('kp-narration audio');
    await audio.evaluate((element: HTMLAudioElement) => {
      element.playbackRate = 1.5;
    });
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key) ?? '', SETTINGS_KEY))
      .toContain('"playbackRate":1.5');
    await page.reload();
    await expect
      .poll(() => audio.evaluate((element: HTMLAudioElement) => element.playbackRate))
      .toBe(1.5);
  });
});
