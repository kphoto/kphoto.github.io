import type { Alternate } from '../i18n/localizedContent.ts';
import type { SiteConfig } from './config.ts';
import { toUtcTimestamp } from './dates.ts';
import { escapeAttribute } from './html.ts';

export interface SitemapEntry {
  readonly path: string;
  readonly alternates: readonly Alternate[];
}

export function buildSitemap(
  entries: readonly SitemapEntry[],
  config: SiteConfig,
  lastModifiedDate: string,
): string {
  const lastmod = toUtcTimestamp(lastModifiedDate);
  const urls = entries
    .map((entry) => {
      const alternates =
        entry.alternates.length < 2
          ? []
          : entry.alternates.map(
              (alternate) =>
                `    <xhtml:link rel="alternate" hreflang="${escapeAttribute(alternate.locale)}" href="${escapeAttribute(`${config.url}${alternate.path}`)}" />`,
            );
      return [
        '  <url>',
        `    <loc>${config.url}${entry.path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        ...alternates,
        '  </url>',
      ].join('\n');
    })
    .join('\n');
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}
