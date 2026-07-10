import { renderDocument, type PageContext } from './layout';

/** The 404 page GitHub Pages serves for unknown paths. */
export function renderNotFound(context: PageContext): string {
  const main = `<header class="page-header">
<p class="eyebrow">404</p>
<h1>Nothing at this address.</h1>
<p class="lede">The page may have moved, or the URL may have a typo. Post URLs start with their date, like <code>/blog/2026-03-22-good-morning/</code>.</p>
<p class="lede"><a href="/">Go to the home page</a> or <a href="/blog/">browse all posts</a>.</p>
</header>`;
  return renderDocument(
    context,
    { title: 'Page not found', description: 'This page does not exist.', path: '/404.html' },
    main,
  );
}
