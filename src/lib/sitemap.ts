import type { SiteConfig } from './config';
import { toUtcTimestamp } from './dates';

/** Builds sitemap.xml for the given site-absolute paths. */
export function buildSitemap(
  paths: readonly string[],
  config: SiteConfig,
  lastModifiedDate: string,
): string {
  const lastmod = toUtcTimestamp(lastModifiedDate);
  const urls = paths
    .map((path) =>
      [
        '  <url>',
        `    <loc>${config.url}${path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '  </url>',
      ].join('\n'),
    )
    .join('\n');
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}
