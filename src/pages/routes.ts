import { localizePath } from '../i18n/locales.ts';
import type { Alternate } from '../i18n/localizedContent.ts';
import { hasPageIn, hasPostIn, postAlternates, postIn } from '../i18n/localizedContent.ts';
import { buildAtomFeed } from '../lib/feed.ts';
import { buildSitemap } from '../lib/sitemap.ts';
import type { SiteModel } from '../lib/types.ts';
import { renderAuthorIndex, renderAuthorPage } from './authors.ts';
import { renderBlogIndex } from './blogIndex.ts';
import { renderHome } from './home.ts';
import { createPageContext, type PageContext, type SiteContext } from './layout.ts';
import { renderLivePage } from './live.ts';
import { renderMarkdownPage } from './markdownPage.ts';
import { renderNotFound } from './notFound.ts';
import { renderPost } from './post.ts';
import { renderSeriesIndex, renderSeriesPage } from './series.ts';
import { renderTagIndex, renderTagPage } from './tags.ts';

export interface RenderedFile {
  readonly path: string;
  readonly body: string;
  readonly contentType: 'text/html' | 'application/xml';
  readonly alternates: readonly Alternate[];
}

function renderLocale(model: SiteModel, context: PageContext): RenderedFile[] {
  const code = context.t.locale.code;
  const files: RenderedFile[] = [];
  const html = (path: string, body: string, alternates = context.everyLocale(path)): void => {
    files.push({
      path: context.href(path),
      body,
      contentType: 'text/html',
      alternates,
    });
  };

  html('/', renderHome(model, context));
  html('/blog/', renderBlogIndex(model, context));

  for (const post of model.posts) {
    if (hasPostIn(post, code)) {
      files.push({
        path: postIn(post, code).url,
        body: renderPost(post, model, context),
        contentType: 'text/html',
        alternates: postAlternates(post),
      });
    }
  }

  html('/tags/', renderTagIndex(model, context));
  for (const tag of model.tags.values()) {
    html(`/tags/${tag.slug}/`, renderTagPage(tag, context));
  }

  html('/series/', renderSeriesIndex(model, context));
  for (const series of model.series.values()) {
    html(`/series/${series.slug}/`, renderSeriesPage(series, context));
  }

  html('/authors/', renderAuthorIndex(model, context));
  for (const author of model.authors.values()) {
    html(`/authors/${author.id}/`, renderAuthorPage(author, model, context));
  }

  for (const page of model.pages.values()) {
    if (hasPageIn(page, code)) {
      const alternates = context.config.locales
        .filter((locale) => hasPageIn(page, locale.code))
        .map((locale) => ({
          locale: locale.code,
          path: localizePath(context.config, locale.code, `/${page.slug}/`),
        }));
      html(`/${page.slug}/`, renderMarkdownPage(page, context), alternates);
    }
  }

  html('/live/', renderLivePage(context));

  files.push({
    path: context.href('/feed.xml'),
    body: buildAtomFeed(model, context),
    contentType: 'application/xml',
    alternates: [],
  });
  return files;
}

export function renderSite(model: SiteModel, site: SiteContext): RenderedFile[] {
  const files: RenderedFile[] = [];
  for (const locale of site.config.locales) {
    files.push(...renderLocale(model, createPageContext(site, locale.code, model.pages)));
  }
  const fallback = createPageContext(site, site.config.defaultLocale, model.pages);
  files.push({
    path: '/404.html',
    body: renderNotFound(fallback),
    contentType: 'text/html',
    alternates: [],
  });
  const entries = files
    .filter((file) => file.path.endsWith('/'))
    .map((file) => ({ path: file.path, alternates: file.alternates }));
  files.push({
    path: '/sitemap.xml',
    body: buildSitemap(entries, site.config, model.posts[0]?.date ?? '1970-01-01'),
    contentType: 'application/xml',
    alternates: [],
  });
  return files;
}

export function outputFileFor(path: string): string {
  return path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);
}

export type { PageContext, SiteContext };
