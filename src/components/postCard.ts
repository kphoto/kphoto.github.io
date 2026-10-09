import type { LocalizedPost } from '../i18n/localizedContent.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import { slugify } from '../lib/slug.ts';
import type { RenderContext } from './context.ts';

export function renderTagLinks(tags: readonly string[], context: RenderContext): string {
  return tags
    .map(
      (name) =>
        `<li><a href="${escapeAttribute(context.href(`/tags/${slugify(name)}/`))}">${escapeHtml(name)}</a></li>`,
    )
    .join('');
}

export function renderPostCard(
  view: LocalizedPost,
  context: RenderContext,
  headingLevel: 2 | 3 = 2,
): string {
  const { t } = context;
  const post = view.post;
  const tag = `h${String(headingLevel)}`;
  const episode = post.series
    ? ` · <a class="series" href="${escapeAttribute(context.href(`/series/${post.series.slug}/`))}">${escapeHtml(post.series.name)}</a> <span class="ep">${t.html('post.episode', { episode: post.series.episode })}</span>`
    : '';
  const foreign = view.language !== t.locale.code;
  const lang = foreign ? ` lang="${escapeAttribute(view.language)}"` : '';
  const badge = foreign
    ? ` · <span class="language">${t.html('post.inLanguage', { language: t.localeName(view.language) })}</span>`
    : '';
  const narrated = view.narration
    ? ` · <span class="narrated">${t.html('post.narrated')}</span>`
    : '';
  const tagLinks = renderTagLinks(post.tags, context);
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
.machine .language {
  color: var(--text);
}
.machine .ep,
.machine .narrated {
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
<p class="machine"><time datetime="${escapeAttribute(post.date)}">${escapeHtml(t.date(post.date))}</time>${episode} · ${t.html('post.readingTime', { count: view.readingMinutes })}${narrated}${badge}</p>
<${tag}${lang}><a href="${escapeAttribute(view.url)}"${foreign ? ` hreflang="${escapeAttribute(view.language)}"` : ''}>${escapeHtml(view.title)}</a></${tag}>
<p class="summary"${lang}>${escapeHtml(view.summary)}</p>
<ul class="tags" aria-label="${escapeAttribute(t.text('post.tags'))}">${tagLinks}</ul>
</article>
</template>
</kp-post-card>`;
}
