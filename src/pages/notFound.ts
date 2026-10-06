import { rawHtml } from '../i18n/safeHtml.ts';
import { escapeAttribute } from '../lib/html.ts';
import { renderDocument, type PageContext } from './layout.ts';

export function renderNotFound(context: PageContext): string {
  const { t } = context;
  const home = rawHtml(
    `<a href="${escapeAttribute(context.href('/'))}">${t.html('notFound.home')}</a>`,
  );
  const browse = rawHtml(
    `<a href="${escapeAttribute(context.href('/blog/'))}">${t.html('notFound.browse')}</a>`,
  );
  const main = `<header class="page-header">
<p class="eyebrow">${t.html('notFound.eyebrow')}</p>
<h1>${t.html('notFound.heading')}</h1>
<p class="lede">${t.html('notFound.lede', { example: rawHtml('<code>/blog/2026-03-22-good-morning/</code>') })}</p>
<p class="lede">${t.html('notFound.actions', { home, browse })}</p>
</header>`;
  return renderDocument(
    context,
    {
      title: t.text('notFound.title'),
      description: t.text('notFound.description'),
      path: '/404.html',
      alternates: [],
    },
    main,
  );
}
