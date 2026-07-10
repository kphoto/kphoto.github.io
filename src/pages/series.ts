import { renderPostCard } from '../components/postCard';
import { escapeAttribute, escapeHtml } from '../lib/html';
import type { SeriesCollection, SiteModel } from '../lib/types';
import { renderDocument, type PageContext } from './layout';

/** Series index: every series with its episode count, alphabetically. */
export function renderSeriesIndex(model: SiteModel, context: PageContext): string {
  const items = [...model.series.values()]
    .map(
      (series) =>
        `<li><a href="/series/${escapeAttribute(series.slug)}/">${escapeHtml(series.name)}</a> <span class="count">${String(series.posts.length)} ${series.posts.length === 1 ? 'part' : 'parts'}</span></li>`,
    )
    .join('\n');
  const main = `<header class="page-header">
<h1>Series</h1>
<p class="lede">Posts that belong together, in reading order.</p>
</header>
<ul class="index-list">
${items}
</ul>`;
  return renderDocument(
    context,
    { title: 'Series', description: `All series on ${context.config.title}.`, path: '/series/' },
    main,
  );
}

/** A single series: its episodes, lowest episode first. */
export function renderSeriesPage(series: SeriesCollection, context: PageContext): string {
  const cards = series.posts.map((post) => renderPostCard(post, 2)).join('\n');
  const main = `<header class="page-header">
<p class="eyebrow">Series</p>
<h1>${escapeHtml(series.name)}</h1>
<p class="lede">${String(series.posts.length)} ${series.posts.length === 1 ? 'part' : 'parts'}, in order.</p>
</header>
<section class="post-list">
${cards}
</section>`;
  return renderDocument(
    context,
    {
      title: series.name,
      description: `The “${series.name}” series on ${context.config.title}, in reading order.`,
      path: `/series/${series.slug}/`,
    },
    main,
  );
}
