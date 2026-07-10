import { renderAuthorCard } from '../components/authorCard';
import { renderPostCard } from '../components/postCard';
import { escapeHtml } from '../lib/html';
import type { Author, SiteModel } from '../lib/types';
import { renderDocument, type PageContext } from './layout';

/** Authors index: everyone who writes here. */
export function renderAuthorIndex(model: SiteModel, context: PageContext): string {
  const cards = [...model.authors.values()]
    .map((author) => renderAuthorCard(author, model.postsByAuthor.get(author.id)?.length ?? 0, 2))
    .join('\n');
  const main = `<header class="page-header">
<h1>Authors</h1>
<p class="lede">The people writing here.</p>
</header>
<section class="author-list">
${cards}
</section>`;
  return renderDocument(
    context,
    { title: 'Authors', description: `The authors of ${context.config.title}.`, path: '/authors/' },
    main,
  );
}

/** An author's page: their card and their posts, newest first. */
export function renderAuthorPage(author: Author, model: SiteModel, context: PageContext): string {
  const posts = model.postsByAuthor.get(author.id) ?? [];
  const cards = posts.map((post) => renderPostCard(post, 3)).join('\n');
  const postsSection =
    posts.length > 0
      ? `<section class="post-list" aria-labelledby="author-posts-heading">
<h2 id="author-posts-heading" class="section-heading">Posts by ${escapeHtml(author.name)}</h2>
${cards}
</section>`
      : `<p class="lede">No posts yet.</p>`;
  const main = `<header class="page-header">
<p class="eyebrow">Author</p>
${renderAuthorCard(author, posts.length, 1)}
</header>
${postsSection}`;
  return renderDocument(
    context,
    {
      title: author.name,
      description: author.bio ?? `Posts by ${author.name} on ${context.config.title}.`,
      path: `/authors/${author.id}/`,
    },
    main,
  );
}
