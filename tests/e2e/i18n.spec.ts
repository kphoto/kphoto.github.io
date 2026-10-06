import type { Page } from '@playwright/test';
import { expect, test } from './fixtures.ts';

async function otherLanguage(page: Page): Promise<{ locale: string; href: string } | null> {
  const link = page.locator('kp-language-switcher li a:not([aria-current])').first();
  if ((await link.count()) === 0) {
    return null;
  }
  return {
    locale: (await link.getAttribute('hreflang')) ?? '',
    href: (await link.getAttribute('href')) ?? '',
  };
}

test.describe('languages', () => {
  test('the document declares its language and its alternates', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', /^[a-z]{2,3}(-[a-z0-9]+)*$/);
    await expect(page.locator('html')).toHaveAttribute('dir', /^(ltr|rtl)$/);
    const switcherLinks = await page.locator('kp-language-switcher li a').count();
    const alternates = page.locator('head link[rel="alternate"][hreflang]');
    await expect(alternates).toHaveCount(switcherLinks === 0 ? 0 : switcherLinks + 1);
  });

  test('switching language changes the page language and is remembered', async ({ page }) => {
    await page.goto('/');
    const other = await otherLanguage(page);
    test.skip(other === null, 'this build has a single language');
    if (other === null) {
      return;
    }
    await page.locator(`kp-language-switcher li a[hreflang="${other.locale}"]`).click();
    await expect(page).toHaveURL(other.href);
    await expect(page.locator('html')).toHaveAttribute('lang', other.locale);
    const stored = await page.evaluate(() => localStorage.getItem('kphoto:settings:v1'));
    expect(JSON.parse(stored ?? '{}')).toMatchObject({ locale: other.locale });

    await page.goto('/');
    await expect(
      page.locator(`kp-language-switcher .suggest[data-locale="${other.locale}"]`),
    ).toBeVisible();
  });

  test('a reader already in their language sees no suggestion', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('kp-language-switcher .suggest:visible')).toHaveCount(0);
  });

  test('the localized home page links its own sections', async ({ page }) => {
    await page.goto('/');
    const other = await otherLanguage(page);
    test.skip(other === null, 'this build has a single language');
    if (other === null) {
      return;
    }
    await page.goto(other.href);
    const blog = page.locator('kp-header nav a').first();
    await expect(blog).toHaveAttribute('href', `${other.href}blog/`);
    await expect(
      page.locator('link[rel="alternate"][type="application/atom+xml"]'),
    ).toHaveAttribute('href', `${other.href}feed.xml`);
  });
});

test.describe('languages from the browser', () => {
  test.use({ locale: 'es-ES' });

  test('suggests the reader language when the page exists in it', async ({ page }) => {
    await page.goto('/');
    const spanish = page.locator('kp-language-switcher .suggest[data-locale="es"]');
    test.skip((await spanish.count()) === 0, 'this build has no Spanish');
    await expect(spanish).toBeVisible();
    await expect(spanish.locator('a')).toHaveAttribute('lang', 'es');
  });
});

test.describe('build provenance', () => {
  test('the footer links the commit the site was built from', async ({ page }) => {
    await page.goto('/');
    const commit = page.locator('kp-footer a.commit');
    test.skip((await commit.count()) === 0, 'built without git metadata');
    const href = (await commit.getAttribute('href')) ?? '';
    expect(href).toMatch(/\/commit\/[0-9a-f]{40}$/);
    const full = href.slice(-40);
    await expect(commit).toHaveText(full.slice(0, 7));
  });
});
