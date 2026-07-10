import { renderPostCard } from '../components/postCard';
import { latestPosts } from '../lib/collections';
import { escapeHtml } from '../lib/html';
import type { SiteModel } from '../lib/types';
import { renderDocument, type PageContext } from './layout';

/**
 * Home page: the hero renders the site's own "frontmatter" — the format that
 * powers every post is the most characteristic thing in this site's world —
 * followed by the latest posts.
 */
export function renderHome(model: SiteModel, context: PageContext): string {
  const posts = latestPosts([...model.posts], context.config.postsOnHome);
  const cards = posts.map((post) => renderPostCard(post, 2)).join('\n');
  const main = `<section class="hero">
<pre class="hero-frontmatter" aria-hidden="true"><code>---
title:  ${escapeHtml(context.config.title)}
stack:  TypeScript 7 · zero runtime dependencies
build:  vite · vitest · playwright
themes: light · dark · solarized
---</code></pre>
<h1>The modern web, hand-rolled.</h1>
<p class="lede">${escapeHtml(context.config.description)} Every post is a markdown file; every parser, component and theme on this site is written from scratch — no framework, no runtime dependencies.</p>
</section>
<section class="post-list" aria-labelledby="latest-heading">
<h2 id="latest-heading" class="section-heading">Latest posts</h2>
${cards}
<p class="more"><a href="/blog/">All posts →</a></p>
</section>`;
  return renderDocument(
    context,
    { title: context.config.title, description: context.config.description, path: '/' },
    main,
  );
}
