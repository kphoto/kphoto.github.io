import { renderAuthorCard } from '../components/authorCard.ts';
import { renderPostMeta } from '../components/postMeta.ts';
import { renderSeriesNav } from '../components/seriesNav.ts';
import { postAlternates, postIn } from '../i18n/localizedContent.ts';
import { escapeHtml } from '../lib/html.ts';
import type { Post, SiteModel } from '../lib/types.ts';
import { renderDocument, type PageContext } from './layout.ts';

export function renderPost(post: Post, model: SiteModel, context: PageContext): string {
  const { t } = context;
  const view = postIn(post, t.locale.code);
  const author = model.authors.get(post.author);
  const series = post.series ? model.series.get(post.series.slug) : undefined;
  const seriesNav = series ? renderSeriesNav(post, series, context) : '';
  const authorPostCount = author ? (model.postsByAuthor.get(author.id)?.length ?? 0) : 0;
  const authorCard = author
    ? `<footer class="post-author"><h2 class="section-heading">${t.html('post.writtenBy')}</h2>${renderAuthorCard(author, authorPostCount, context, 2)}</footer>`
    : '';
  const main = `<article class="post">
<header class="page-header">
<h1>${escapeHtml(view.title)}</h1>
<p class="lede">${escapeHtml(view.summary)}</p>
${renderPostMeta(view, author, context)}
</header>
${seriesNav}
<div class="prose">
${view.html}
</div>
${seriesNav}
${authorCard}
</article>`;
  return renderDocument(
    context,
    {
      title: view.title,
      description: view.summary,
      path: view.url,
      alternates: postAlternates(post),
    },
    main,
  );
}
