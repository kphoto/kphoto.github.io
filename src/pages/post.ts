import { renderAuthorCard } from '../components/authorCard';
import { renderPostMeta } from '../components/postMeta';
import { renderSeriesNav } from '../components/seriesNav';
import { escapeHtml } from '../lib/html';
import type { Post, SiteModel } from '../lib/types';
import { renderDocument, type PageContext } from './layout';

/** A single post: title, meta, series navigation, content and author card. */
export function renderPost(post: Post, model: SiteModel, context: PageContext): string {
  const author = model.authors.get(post.author);
  const series = post.series ? model.series.get(post.series.slug) : undefined;
  const seriesNav = series ? renderSeriesNav(post, series) : '';
  const authorPostCount = author ? (model.postsByAuthor.get(author.id)?.length ?? 0) : 0;
  const authorCard = author
    ? `<footer class="post-author"><h2 class="section-heading">Written by</h2>${renderAuthorCard(author, authorPostCount, 2)}</footer>`
    : '';
  const main = `<article class="post">
<header class="page-header">
<h1>${escapeHtml(post.title)}</h1>
<p class="lede">${escapeHtml(post.summary)}</p>
${renderPostMeta(post, author)}
</header>
${seriesNav}
<div class="prose">
${post.html}
</div>
${seriesNav}
${authorCard}
</article>`;
  return renderDocument(
    context,
    { title: post.title, description: post.summary, path: post.url },
    main,
  );
}
