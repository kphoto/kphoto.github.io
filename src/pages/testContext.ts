import { catalogs } from '../i18n/messages/index.ts';
import { siteConfig, type SiteConfig } from '../lib/config.ts';
import type { MarkdownPage } from '../lib/types.ts';
import { createPageContext, type PageContext, type SiteContext } from './layout.ts';

export const TEST_COMMIT = '0123456789abcdef0123456789abcdef01234567';

export function makeSiteContext(overrides: Partial<SiteContext> = {}): SiteContext {
  return {
    config: siteConfig,
    assets: { scriptSrc: '/assets/main-TEST.js', styleHref: '/assets/styles-TEST.css' },
    buildYear: 2026,
    build: { commit: TEST_COMMIT, modified: false },
    catalogs,
    ...overrides,
  };
}

export function makePageContext(
  locale = 'en',
  overrides: Partial<SiteContext> = {},
  pages: ReadonlyMap<string, MarkdownPage> = new Map(),
): PageContext {
  return createPageContext(makeSiteContext(overrides), locale, pages);
}

export function withLiveStats(publishableKey: string): SiteConfig {
  return {
    ...siteConfig,
    liveStats: { projectUrl: 'https://example-ref.supabase.co', publishableKey },
  };
}
