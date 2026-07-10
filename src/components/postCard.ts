import { formatDisplayDate } from '../lib/dates';
import { escapeAttribute, escapeHtml } from '../lib/html';
import { slugify } from '../lib/slug';
import type { Post } from '../lib/types';

/**
 * A post as it appears in every list view. The mono "machine line" eyebrow
 * (date · episode · reading time) surfaces the data that makes each post
 * unique; the summary and tags are always shown, as the content rules require.
 */
export function renderPostCard(post: Post, headingLevel: 2 | 3 = 2): string {
  const tag = `h${String(headingLevel)}`;
  const episode = post.series
    ? ` · <a class="series" href="/series/${escapeAttribute(post.series.slug)}/">${escapeHtml(post.series.name)}</a> <span class="ep">ep ${String(post.series.episode)}</span>`
    : '';
  const tagLinks = post.tags
    .map(
      (name) =>
        `<li><a href="/tags/${escapeAttribute(slugify(name))}/">${escapeHtml(name)}</a></li>`,
    )
    .join('');
  return `<kp-post-card>
<template shadowrootmode="open">
<style>
:host { display: block; }
article {
  padding-block: 1.25rem;
  border-block-end: 1px solid var(--border);
  display: grid;
  gap: 0.4rem;
}
.machine {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--muted);
}
.machine a {
  color: inherit;
}
.machine .ep {
  color: var(--accent-strong);
}
h2, h3 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
h2 a, h3 a {
  color: var(--text);
  text-decoration: none;
}
h2 a:hover, h3 a:hover {
  color: var(--accent-strong);
  text-decoration: underline;
}
a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.summary {
  margin: 0;
  color: var(--muted);
}
.tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.2rem 0 0;
  padding: 0;
}
.tags a {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  text-decoration: none;
}
.tags a:hover {
  border-color: var(--accent);
}
</style>
<article>
<p class="machine"><time datetime="${escapeAttribute(post.date)}">${escapeHtml(formatDisplayDate(post.date))}</time>${episode} · ${String(post.readingMinutes)} min read</p>
<${tag}><a href="${escapeAttribute(post.url)}">${escapeHtml(post.title)}</a></${tag}>
<p class="summary">${escapeHtml(post.summary)}</p>
<ul class="tags" aria-label="Tags">${tagLinks}</ul>
</article>
</template>
</kp-post-card>`;
}
