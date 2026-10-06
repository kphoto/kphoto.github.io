import { renderPostCard } from '../components/postCard.ts';
import { postIn } from '../i18n/localizedContent.ts';
import type { SiteModel } from '../lib/types.ts';
import { renderDocument, type PageContext } from './layout.ts';

export function renderBlogIndex(model: SiteModel, context: PageContext): string {
  const { t } = context;
  const cards = model.posts
    .map((post) => renderPostCard(postIn(post, t.locale.code), context, 2))
    .join('\n');
  const main = `<header class="page-header">
<h1>${t.html('blog.title')}</h1>
<p class="lede">${t.html('blog.lede', { count: model.posts.length })}</p>
</header>
<section class="post-list">
${cards}
</section>`;
  return renderDocument(
    context,
    {
      title: t.text('blog.title'),
      description: t.text('blog.description', { site: context.config.title }),
      path: context.href('/blog/'),
      alternates: context.everyLocale('/blog/'),
    },
    main,
  );
}
