import { describe, expect, it } from 'vitest';
import { siteConfig } from './config.ts';
import { buildSitemap } from './sitemap.ts';

describe('buildSitemap', () => {
  const xml = buildSitemap(
    [
      { path: '/', alternates: [] },
      {
        path: '/blog/',
        alternates: [
          { locale: 'en', path: '/blog/' },
          { locale: 'es', path: '/es/blog/' },
        ],
      },
    ],
    siteConfig,
    '2026-04-01',
  );

  it('lists each path with the last-modified date', () => {
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain(`<loc>${siteConfig.url}/</loc>`);
    expect(xml).toContain(`<loc>${siteConfig.url}/blog/</loc>`);
    expect(xml.match(/<lastmod>2026-04-01T00:00:00Z<\/lastmod>/g)).toHaveLength(2);
  });

  it('declares language alternates only where there are several', () => {
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain(
      `<xhtml:link rel="alternate" hreflang="es" href="${siteConfig.url}/es/blog/" />`,
    );
    expect(xml.match(/<xhtml:link/g)).toHaveLength(2);
  });
});
