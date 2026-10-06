import { pageIn, pageLocales } from '../i18n/localizedContent.ts';
import { localizePath } from '../i18n/locales.ts';
import { escapeHtml } from '../lib/html.ts';
import type { MarkdownPage } from '../lib/types.ts';
import { renderDocument, type PageContext } from './layout.ts';

export function renderMarkdownPage(page: MarkdownPage, context: PageContext): string {
  const { t } = context;
  const view = pageIn(page, t.locale.code);
  const main = `<article>
<header class="page-header">
<h1>${escapeHtml(view.title)}</h1>
</header>
<div class="prose">
${view.html}
</div>
</article>`;
  const path = `/${page.slug}/`;
  return renderDocument(
    context,
    {
      title: view.title,
      description: t.text('page.description', {
        title: view.title,
        description: t.text('site.description'),
      }),
      path: context.href(path),
      alternates: pageLocales(page).map((locale) => ({
        locale,
        path: localizePath(context.config, locale, path),
      })),
    },
    main,
  );
}
