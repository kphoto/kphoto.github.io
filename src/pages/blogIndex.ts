import { renderPostCard } from '../components/postCard';
import type { SiteModel } from '../lib/types';
import { renderDocument, type PageContext } from './layout';

/** Blog index: every post, newest first. */
export function renderBlogIndex(model: SiteModel, context: PageContext): string {
  const cards = model.posts.map((post) => renderPostCard(post, 2)).join('\n');
  const count = model.posts.length;
  const main = `<header class="page-header">
<h1>Blog</h1>
<p class="lede">${String(count)} ${count === 1 ? 'post' : 'posts'}, newest first.</p>
</header>
<section class="post-list">
${cards}
</section>`;
  return renderDocument(
    context,
    {
      title: 'Blog',
      description: `All posts on ${context.config.title}, newest first.`,
      path: '/blog/',
    },
    main,
  );
}
