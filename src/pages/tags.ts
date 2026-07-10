import { renderPostCard } from '../components/postCard';
import { escapeAttribute, escapeHtml } from '../lib/html';
import type { SiteModel, TagCollection } from '../lib/types';
import { renderDocument, type PageContext } from './layout';

/** Tags index: every tag with its post count, alphabetically. */
export function renderTagIndex(model: SiteModel, context: PageContext): string {
  const items = [...model.tags.values()]
    .map(
      (tag) =>
        `<li><a href="/tags/${escapeAttribute(tag.slug)}/">${escapeHtml(tag.name)}</a> <span class="count">× ${String(tag.posts.length)}</span></li>`,
    )
    .join('\n');
  const main = `<header class="page-header">
<h1>Tags</h1>
<p class="lede">Every topic on the site.</p>
</header>
<ul class="index-list">
${items}
</ul>`;
  return renderDocument(
    context,
    { title: 'Tags', description: `All tags on ${context.config.title}.`, path: '/tags/' },
    main,
  );
}

/** A single tag: its posts, newest first. */
export function renderTagPage(tag: TagCollection, context: PageContext): string {
  const cards = tag.posts.map((post) => renderPostCard(post, 2)).join('\n');
  const count = tag.posts.length;
  const main = `<header class="page-header">
<p class="eyebrow">Tag</p>
<h1>${escapeHtml(tag.name)}</h1>
<p class="lede">${String(count)} ${count === 1 ? 'post' : 'posts'}, newest first.</p>
</header>
<section class="post-list">
${cards}
</section>`;
  return renderDocument(
    context,
    {
      title: `Tagged “${tag.name}”`,
      description: `Posts tagged “${tag.name}” on ${context.config.title}.`,
      path: `/tags/${tag.slug}/`,
    },
    main,
  );
}
