import { describe, expect, it } from 'vitest';
import { siteConfig } from './config';
import { buildSitemap } from './sitemap';

describe('buildSitemap', () => {
  it('lists each path with the last-modified date', () => {
    const xml = buildSitemap(['/', '/blog/'], siteConfig, '2026-04-01');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain(`<loc>${siteConfig.url}/</loc>`);
    expect(xml).toContain(`<loc>${siteConfig.url}/blog/</loc>`);
    expect(xml.match(/<lastmod>2026-04-01T00:00:00Z<\/lastmod>/g)).toHaveLength(2);
  });
});
