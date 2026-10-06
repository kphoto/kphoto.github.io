import { buildThemeInitScript } from '../client/themeInit.ts';
import type { RenderContext } from '../components/context.ts';
import { renderSiteFooter } from '../components/siteFooter.ts';
import { renderSiteHeader } from '../components/siteHeader.ts';
import { localizePath } from '../i18n/locales.ts';
import { hasPageIn, type Alternate } from '../i18n/localizedContent.ts';
import type { Catalogs } from '../i18n/messages/index.ts';
import { createTranslator, type Translator } from '../i18n/translator.ts';
import type { BuildInfo } from '../lib/buildInfo.ts';
import type { SiteConfig } from '../lib/config.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import type { MarkdownPage } from '../lib/types.ts';

export interface Assets {
  readonly scriptSrc: string;
  readonly styleHref: string;
}

export interface SiteContext {
  readonly config: SiteConfig;
  readonly assets: Assets;
  readonly buildYear: number;
  readonly build: BuildInfo;
  readonly catalogs: Catalogs;
}

export interface PageContext extends SiteContext, RenderContext {
  pageHref(slug: string): string;
  translatorFor(code: string): Translator;
  everyLocale(path: string): Alternate[];
}

export interface PageMeta {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly alternates: readonly Alternate[];
}

export function createPageContext(
  site: SiteContext,
  locale: string,
  pages: ReadonlyMap<string, MarkdownPage>,
): PageContext {
  const translators = new Map(
    site.config.locales.map((definition) => [
      definition.code,
      createTranslator(site.config, site.catalogs, definition.code),
    ]),
  );
  const translatorFor = (code: string): Translator => {
    const translator = translators.get(code);
    if (!translator) {
      throw new Error(`unknown locale "${code}"`);
    }
    return translator;
  };
  const href = (path: string): string => localizePath(site.config, locale, path);
  return {
    ...site,
    t: translatorFor(locale),
    href,
    translatorFor,
    pageHref(slug) {
      const page = pages.get(slug);
      const target = page && hasPageIn(page, locale) ? locale : site.config.defaultLocale;
      return localizePath(site.config, target, `/${slug}/`);
    },
    everyLocale(path) {
      return site.config.locales.map((definition) => ({
        locale: definition.code,
        path: localizePath(site.config, definition.code, path),
      }));
    },
  };
}

function alternateLinks(context: PageContext, alternates: readonly Alternate[]): string {
  if (alternates.length < 2) {
    return '';
  }
  const links = alternates.map(
    (alternate) =>
      `<link rel="alternate" hreflang="${escapeAttribute(alternate.locale)}" href="${escapeAttribute(`${context.config.url}${alternate.path}`)}" />`,
  );
  const fallback = alternates.find(
    (alternate) => alternate.locale === context.config.defaultLocale,
  );
  if (fallback) {
    links.push(
      `<link rel="alternate" hreflang="x-default" href="${escapeAttribute(`${context.config.url}${fallback.path}`)}" />`,
    );
  }
  return `\n${links.join('\n')}`;
}

export function renderDocument(context: PageContext, meta: PageMeta, mainHtml: string): string {
  const { config, assets, t } = context;
  const fullTitle = meta.title === config.title ? config.title : `${meta.title} · ${config.title}`;
  const canonical = `${config.url}${meta.path}`;
  return `<!doctype html>
<html lang="${escapeAttribute(t.locale.code)}" dir="${escapeAttribute(t.locale.dir)}" data-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeAttribute(meta.description)}" />
<link rel="canonical" href="${escapeAttribute(canonical)}" />${alternateLinks(context, meta.alternates)}
<meta property="og:title" content="${escapeAttribute(fullTitle)}" />
<meta property="og:description" content="${escapeAttribute(meta.description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeAttribute(canonical)}" />
<meta property="og:locale" content="${escapeAttribute(t.locale.code)}" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="alternate" type="application/atom+xml" title="${escapeAttribute(config.title)}" href="${escapeAttribute(context.href('/feed.xml'))}" />
<script>${buildThemeInitScript()}</script>
<link rel="stylesheet" href="${escapeAttribute(assets.styleHref)}" />
<script type="module" src="${escapeAttribute(assets.scriptSrc)}"></script>
</head>
<body>
<a class="skip-link" href="#main">${t.html('skipLink')}</a>
${renderSiteHeader(context, meta.path, meta.alternates)}
<main id="main" tabindex="-1">
${mainHtml}
</main>
${renderSiteFooter(context, meta.path)}
</body>
</html>
`;
}
