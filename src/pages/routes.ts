import { siteConfig } from '../lib/config';
import { buildAtomFeed } from '../lib/feed';
import { buildSitemap } from '../lib/sitemap';
import type { SiteModel } from '../lib/types';
import { renderAuthorIndex, renderAuthorPage } from './authors';
import { renderBlogIndex } from './blogIndex';
import { renderHome } from './home';
import { renderDocument, type PageContext } from './layout';
import { renderMarkdownPage } from './markdownPage';
import { renderNotFound } from './notFound';
import { renderPost } from './post';
import { renderSeriesIndex, renderSeriesPage } from './series';
import { renderTagIndex, renderTagPage } from './tags';

/** One output file: an HTML page (path ends with `/`) or a top-level file. */
export interface RenderedFile {
  readonly path: string;
  readonly body: string;
  readonly contentType: 'text/html' | 'application/xml';
}

/** Renders every page, the 404 page, the Atom feed and the sitemap. */
export function renderSite(model: SiteModel, context: PageContext): RenderedFile[] {
  const html = (path: string, body: string): RenderedFile => ({
    path,
    body,
    contentType: 'text/html',
  });

  const files: RenderedFile[] = [
    html('/', renderHome(model, context)),
    html('/blog/', renderBlogIndex(model, context)),
  ];

  for (const post of model.posts) {
    files.push(html(post.url, renderPost(post, model, context)));
  }

  files.push(html('/tags/', renderTagIndex(model, context)));
  for (const tag of model.tags.values()) {
    files.push(html(`/tags/${tag.slug}/`, renderTagPage(tag, context)));
  }

  files.push(html('/series/', renderSeriesIndex(model, context)));
  for (const series of model.series.values()) {
    files.push(html(`/series/${series.slug}/`, renderSeriesPage(series, context)));
  }

  files.push(html('/authors/', renderAuthorIndex(model, context)));
  for (const author of model.authors.values()) {
    files.push(html(`/authors/${author.id}/`, renderAuthorPage(author, model, context)));
  }

  for (const page of model.pages.values()) {
    files.push(html(`/${page.slug}/`, renderMarkdownPage(page, context)));
  }

  files.push(html('/404.html', renderNotFound(context)));

  const htmlPaths = files.filter((file) => file.path.endsWith('/')).map((file) => file.path);
  const lastModified = model.posts[0]?.date ?? '1970-01-01';
  files.push({
    path: '/feed.xml',
    body: buildAtomFeed(model, context.config),
    contentType: 'application/xml',
  });
  files.push({
    path: '/sitemap.xml',
    body: buildSitemap(htmlPaths, context.config, lastModified),
    contentType: 'application/xml',
  });

  return files;
}

/** Maps a route path to its on-disk file inside the build output. */
export function outputFileFor(path: string): string {
  return path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);
}

export { renderDocument, siteConfig };
export type { PageContext };
