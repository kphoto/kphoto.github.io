import { escapeAttribute, escapeHtml } from '../lib/html';
import type { Post, SeriesCollection } from '../lib/types';

/**
 * Series navigation for a post that belongs to a series: "Part N of M",
 * a link to the series page, and previous/next episode links.
 */
export function renderSeriesNav(post: Post, series: SeriesCollection): string {
  const membership = post.series;
  if (!membership) {
    return '';
  }
  const index = series.posts.findIndex((candidate) => candidate.slug === post.slug);
  const previous = index > 0 ? series.posts[index - 1] : undefined;
  const next = index >= 0 ? series.posts[index + 1] : undefined;
  const previousHtml = previous
    ? `<a class="prev" href="${escapeAttribute(previous.url)}" rel="prev"><span aria-hidden="true">←</span> ${escapeHtml(previous.title)}</a>`
    : '<span></span>';
  const nextHtml = next
    ? `<a class="next" href="${escapeAttribute(next.url)}" rel="next">${escapeHtml(next.title)} <span aria-hidden="true">→</span></a>`
    : '<span></span>';
  return `<kp-series-nav>
<template shadowrootmode="open">
<style>
:host { display: block; }
nav {
  border: 1px solid var(--border);
  border-inline-start: 3px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--surface);
  padding: 0.9rem 1rem;
  display: grid;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.which {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--muted);
}
.which a {
  color: var(--accent-strong);
}
.steps {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.steps a {
  color: var(--text);
  text-decoration: none;
}
.steps a:hover {
  color: var(--accent-strong);
  text-decoration: underline;
}
a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
</style>
<nav aria-label="Series">
<p class="which">Part ${String(membership.episode)} of ${String(series.posts.length)} in <a href="/series/${escapeAttribute(series.slug)}/">${escapeHtml(series.name)}</a></p>
<div class="steps">${previousHtml}${nextHtml}</div>
</nav>
</template>
</kp-series-nav>`;
}
