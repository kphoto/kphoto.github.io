import { postIn } from '../i18n/localizedContent.ts';
import { rawHtml } from '../i18n/safeHtml.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import type { Post, SeriesCollection } from '../lib/types.ts';
import type { RenderContext } from './context.ts';

function neighbourLink(post: Post, rel: 'prev' | 'next', context: RenderContext): string {
  const view = postIn(post, context.t.locale.code);
  const lang =
    view.language === context.t.locale.code ? '' : ` lang="${escapeAttribute(view.language)}"`;
  const title = `<span${lang}>${escapeHtml(view.title)}</span>`;
  return rel === 'prev'
    ? `<a class="prev" href="${escapeAttribute(view.url)}" rel="prev"><span aria-hidden="true">←</span> ${title}</a>`
    : `<a class="next" href="${escapeAttribute(view.url)}" rel="next">${title} <span aria-hidden="true">→</span></a>`;
}

export function renderSeriesNav(
  post: Post,
  series: SeriesCollection,
  context: RenderContext,
): string {
  const { t } = context;
  const membership = post.series;
  if (!membership) {
    return '';
  }
  const index = series.posts.findIndex((candidate) => candidate.slug === post.slug);
  const previous = index > 0 ? series.posts[index - 1] : undefined;
  const next = index >= 0 ? series.posts[index + 1] : undefined;
  const previousHtml = previous ? neighbourLink(previous, 'prev', context) : '<span></span>';
  const nextHtml = next ? neighbourLink(next, 'next', context) : '<span></span>';
  const seriesLink = rawHtml(
    `<a href="${escapeAttribute(context.href(`/series/${series.slug}/`))}">${escapeHtml(series.name)}</a>`,
  );
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
<nav aria-label="${escapeAttribute(t.text('series.nav'))}">
<p class="which">${t.html('series.position', { episode: membership.episode, total: series.posts.length, series: seriesLink })}</p>
<div class="steps">${previousHtml}${nextHtml}</div>
</nav>
</template>
</kp-series-nav>`;
}
