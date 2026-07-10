import { buildThemeInitScript } from '../client/themeInit';
import { renderSiteFooter } from '../components/siteFooter';
import { renderSiteHeader } from '../components/siteHeader';
import type { SiteConfig } from '../lib/config';
import { escapeAttribute, escapeHtml } from '../lib/html';

/** Where the client script and stylesheet live (dev paths or hashed build assets). */
export interface Assets {
  readonly scriptSrc: string;
  readonly styleHref: string;
}

/** Everything a page render needs beyond the content model. */
export interface PageContext {
  readonly config: SiteConfig;
  readonly assets: Assets;
  /** Injected build-time year for the footer, keeping renders pure. */
  readonly buildYear: number;
}

export interface PageMeta {
  readonly title: string;
  readonly description: string;
  /** Site-absolute path with a trailing slash (or `/404.html`). */
  readonly path: string;
}

/** Renders the full HTML document around a page's main content. */
export function renderDocument(context: PageContext, meta: PageMeta, mainHtml: string): string {
  const { config, assets } = context;
  const fullTitle = meta.title === config.title ? config.title : `${meta.title} · ${config.title}`;
  const canonical = `${config.url}${meta.path}`;
  return `<!doctype html>
<html lang="${escapeAttribute(config.language)}" data-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeAttribute(meta.description)}" />
<link rel="canonical" href="${escapeAttribute(canonical)}" />
<meta property="og:title" content="${escapeAttribute(fullTitle)}" />
<meta property="og:description" content="${escapeAttribute(meta.description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeAttribute(canonical)}" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="alternate" type="application/atom+xml" title="${escapeAttribute(config.title)}" href="/feed.xml" />
<script>${buildThemeInitScript()}</script>
<link rel="stylesheet" href="${escapeAttribute(assets.styleHref)}" />
<script type="module" src="${escapeAttribute(assets.scriptSrc)}"></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${renderSiteHeader(meta.path)}
<main id="main" tabindex="-1">
${mainHtml}
</main>
${renderSiteFooter(config, context.buildYear)}
</body>
</html>
`;
}
