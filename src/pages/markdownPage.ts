import { escapeHtml } from '../lib/html';
import type { MarkdownPage } from '../lib/types';
import { renderDocument, type PageContext } from './layout';

/** A standalone markdown page such as About or Contact. */
export function renderMarkdownPage(page: MarkdownPage, context: PageContext): string {
  const main = `<article>
<header class="page-header">
<h1>${escapeHtml(page.title)}</h1>
</header>
<div class="prose">
${page.html}
</div>
</article>`;
  return renderDocument(
    context,
    {
      title: page.title,
      description: `${page.title} — ${context.config.description}`,
      path: `/${page.slug}/`,
    },
    main,
  );
}
