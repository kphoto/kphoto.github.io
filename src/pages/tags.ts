import { renderPostCard } from '../components/postCard.ts';
import { postIn } from '../i18n/localizedContent.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import type { SiteModel, TagCollection } from '../lib/types.ts';
import { renderDocument, type PageContext } from './layout.ts';

export function renderTagIndex(model: SiteModel, context: PageContext): string {
  const { t } = context;
  const items = [...model.tags.values()]
    .map(
      (tag) =>
        `<li><a href="${escapeAttribute(context.href(`/tags/${tag.slug}/`))}">${escapeHtml(tag.name)}</a> <span class="count">× ${t.number(tag.posts.length)}</span></li>`,
    )
    .join('\n');
  const main = `<header class="page-header">
<h1>${t.html('tags.title')}</h1>
<p class="lede">${t.html('tags.lede')}</p>
</header>
<ul class="index-list">
${items}
</ul>`;
  return renderDocument(
    context,
    {
      title: t.text('tags.title'),
      description: t.text('tags.description', { site: context.config.title }),
      path: context.href('/tags/'),
      alternates: context.everyLocale('/tags/'),
    },
    main,
  );
}

export function renderTagPage(tag: TagCollection, context: PageContext): string {
  const { t } = context;
  const cards = tag.posts
    .map((post) => renderPostCard(postIn(post, t.locale.code), context, 2))
    .join('\n');
  const main = `<header class="page-header">
<p class="eyebrow">${t.html('tag.eyebrow')}</p>
<h1>${escapeHtml(tag.name)}</h1>
<p class="lede">${t.html('blog.lede', { count: tag.posts.length })}</p>
</header>
<section class="post-list">
${cards}
</section>`;
  const path = `/tags/${tag.slug}/`;
  return renderDocument(
    context,
    {
      title: t.text('tag.title', { tag: tag.name }),
      description: t.text('tag.description', { tag: tag.name, site: context.config.title }),
      path: context.href(path),
      alternates: context.everyLocale(path),
    },
    main,
  );
}
