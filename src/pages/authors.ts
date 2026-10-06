import { renderAuthorCard } from '../components/authorCard.ts';
import { renderPostCard } from '../components/postCard.ts';
import { postIn } from '../i18n/localizedContent.ts';
import type { Author, SiteModel } from '../lib/types.ts';
import { renderDocument, type PageContext } from './layout.ts';

export function renderAuthorIndex(model: SiteModel, context: PageContext): string {
  const { t } = context;
  const cards = [...model.authors.values()]
    .map((author) =>
      renderAuthorCard(author, model.postsByAuthor.get(author.id)?.length ?? 0, context, 2),
    )
    .join('\n');
  const main = `<header class="page-header">
<h1>${t.html('authors.title')}</h1>
<p class="lede">${t.html('authors.lede')}</p>
</header>
<section class="author-list">
${cards}
</section>`;
  return renderDocument(
    context,
    {
      title: t.text('authors.title'),
      description: t.text('authors.description', { site: context.config.title }),
      path: context.href('/authors/'),
      alternates: context.everyLocale('/authors/'),
    },
    main,
  );
}

export function renderAuthorPage(author: Author, model: SiteModel, context: PageContext): string {
  const { t } = context;
  const posts = model.postsByAuthor.get(author.id) ?? [];
  const cards = posts
    .map((post) => renderPostCard(postIn(post, t.locale.code), context, 3))
    .join('\n');
  const postsSection =
    posts.length > 0
      ? `<section class="post-list" aria-labelledby="author-posts-heading">
<h2 id="author-posts-heading" class="section-heading">${t.html('author.postsBy', { name: author.name })}</h2>
${cards}
</section>`
      : `<p class="lede">${t.html('author.noPosts')}</p>`;
  const main = `<header class="page-header">
<p class="eyebrow">${t.html('author.eyebrow')}</p>
${renderAuthorCard(author, posts.length, context, 1)}
</header>
${postsSection}`;
  const path = `/authors/${author.id}/`;
  return renderDocument(
    context,
    {
      title: author.name,
      description:
        author.bio ??
        t.text('author.description', { name: author.name, site: context.config.title }),
      path: context.href(path),
      alternates: context.everyLocale(path),
    },
    main,
  );
}
