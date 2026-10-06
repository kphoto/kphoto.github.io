import { renderPostCard } from '../components/postCard.ts';
import { postIn } from '../i18n/localizedContent.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import type { SeriesCollection, SiteModel } from '../lib/types.ts';
import { renderDocument, type PageContext } from './layout.ts';

export function renderSeriesIndex(model: SiteModel, context: PageContext): string {
  const { t } = context;
  const items = [...model.series.values()]
    .map(
      (series) =>
        `<li><a href="${escapeAttribute(context.href(`/series/${series.slug}/`))}">${escapeHtml(series.name)}</a> <span class="count">${t.html('series.parts', { count: series.posts.length })}</span></li>`,
    )
    .join('\n');
  const main = `<header class="page-header">
<h1>${t.html('series.title')}</h1>
<p class="lede">${t.html('series.lede')}</p>
</header>
<ul class="index-list">
${items}
</ul>`;
  return renderDocument(
    context,
    {
      title: t.text('series.title'),
      description: t.text('series.description', { site: context.config.title }),
      path: context.href('/series/'),
      alternates: context.everyLocale('/series/'),
    },
    main,
  );
}

export function renderSeriesPage(series: SeriesCollection, context: PageContext): string {
  const { t } = context;
  const cards = series.posts
    .map((post) => renderPostCard(postIn(post, t.locale.code), context, 2))
    .join('\n');
  const main = `<header class="page-header">
<p class="eyebrow">${t.html('series.eyebrow')}</p>
<h1>${escapeHtml(series.name)}</h1>
<p class="lede">${t.html('series.pageLede', { count: series.posts.length })}</p>
</header>
<section class="post-list">
${cards}
</section>`;
  const path = `/series/${series.slug}/`;
  return renderDocument(
    context,
    {
      title: series.name,
      description: t.text('series.pageDescription', {
        series: series.name,
        site: context.config.title,
      }),
      path: context.href(path),
      alternates: context.everyLocale(path),
    },
    main,
  );
}
