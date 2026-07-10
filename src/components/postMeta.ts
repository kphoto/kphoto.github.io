import { formatDisplayDate } from '../lib/dates';
import { escapeAttribute, escapeHtml } from '../lib/html';
import { slugify } from '../lib/slug';
import type { Author, Post } from '../lib/types';

/**
 * The metadata block under a post title: date, author link, reading time and
 * the post's tags (shown in the detail view as well as list views).
 */
export function renderPostMeta(post: Post, author: Author | undefined): string {
  const authorHtml = author
    ? `<a href="/authors/${escapeAttribute(author.id)}/" rel="author">${escapeHtml(author.name)}</a>`
    : escapeHtml(post.author);
  const tagLinks = post.tags
    .map(
      (name) =>
        `<li><a href="/tags/${escapeAttribute(slugify(name))}/">${escapeHtml(name)}</a></li>`,
    )
    .join('');
  return `<kp-post-meta>
<template shadowrootmode="open">
<style>
:host { display: block; }
.line {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--muted);
}
.line a {
  color: var(--accent-strong);
}
a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.6rem 0 0;
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
<p class="line"><time datetime="${escapeAttribute(post.date)}">${escapeHtml(formatDisplayDate(post.date))}</time> · ${authorHtml} · ${String(post.readingMinutes)} min read</p>
<ul class="tags" aria-label="Tags">${tagLinks}</ul>
</template>
</kp-post-meta>`;
}
