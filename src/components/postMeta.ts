import type { LocalizedPost } from '../i18n/localizedContent.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import type { Author } from '../lib/types.ts';
import type { RenderContext } from './context.ts';
import { renderTagLinks } from './postCard.ts';

export function renderPostMeta(
  view: LocalizedPost,
  author: Author | undefined,
  context: RenderContext,
): string {
  const { t } = context;
  const post = view.post;
  const authorHtml = author
    ? `<a href="${escapeAttribute(context.href(`/authors/${author.id}/`))}" rel="author">${escapeHtml(author.name)}</a>`
    : escapeHtml(post.author);
  const tagLinks = renderTagLinks(post.tags, context);
  const original = view.translated
    ? `<p class="line translation">${t.html('post.translatedFrom', { language: t.localeName(post.language) })} <a href="${escapeAttribute(post.url)}" hreflang="${escapeAttribute(post.language)}">${t.html('post.readOriginal')}</a></p>`
    : '';
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
.translation {
  margin-block-start: 0.35rem;
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
<p class="line"><time datetime="${escapeAttribute(post.date)}">${escapeHtml(t.date(post.date))}</time> · ${authorHtml} · ${t.html('post.readingTime', { count: view.readingMinutes })}</p>
${original}
<ul class="tags" aria-label="${escapeAttribute(t.text('post.tags'))}">${tagLinks}</ul>
</template>
</kp-post-meta>`;
}
