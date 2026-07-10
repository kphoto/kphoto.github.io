import { escapeAttribute, escapeHtml } from '../lib/html';
import type { Author } from '../lib/types';

const SOCIAL_URLS: Readonly<Record<string, (handle: string) => string>> = {
  github: (handle) => `https://github.com/${handle}`,
  bluesky: (handle) => `https://bsky.app/profile/${handle}`,
  mastodon: (handle) => handle,
};

function socialUrl(network: string, handle: string): string | undefined {
  const build = SOCIAL_URLS[network];
  return build ? build(handle) : undefined;
}

/** An author as shown on the authors index and on their detail page. */
export function renderAuthorCard(
  author: Author,
  postCount: number,
  headingLevel: 1 | 2 = 2,
): string {
  const tag = `h${String(headingLevel)}`;
  const avatar = author.avatar
    ? `<img src="/${escapeAttribute(author.avatar)}" alt="" width="72" height="72" loading="lazy" />`
    : '<span class="placeholder" aria-hidden="true"></span>';
  const bio = author.bio ? `<p class="bio">${escapeHtml(author.bio)}</p>` : '';
  const email = author.email
    ? `<a href="mailto:${escapeAttribute(author.email)}">${escapeHtml(author.email)}</a>`
    : '';
  const socials = Object.entries(author.socials ?? {})
    .map(([network, handle]) => {
      const url = socialUrl(network, handle);
      return url
        ? `<a href="${escapeAttribute(url)}" rel="me">${escapeHtml(network)}</a>`
        : `<span>${escapeHtml(network)}: ${escapeHtml(handle)}</span>`;
    })
    .join('');
  const contact = email !== '' || socials !== '' ? `<p class="contact">${email}${socials}</p>` : '';
  const posts = ` · ${String(postCount)} ${postCount === 1 ? 'post' : 'posts'}`;
  return `<kp-author-card>
<template shadowrootmode="open">
<style>
:host { display: block; }
article {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.35rem 1rem;
  align-items: start;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background: var(--surface);
}
img, .placeholder {
  grid-row: span 3;
  inline-size: 72px;
  block-size: 72px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg);
  object-fit: cover;
}
h1, h2 {
  margin: 0;
  font-size: 1.15rem;
}
h1 a, h2 a {
  color: var(--text);
  text-decoration: none;
}
h1 a:hover, h2 a:hover {
  color: var(--accent-strong);
  text-decoration: underline;
}
a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.count {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--muted);
}
.bio {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
}
.contact {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
}
.contact a {
  color: var(--accent-strong);
}
</style>
<article>
${avatar}
<${tag}><a href="/authors/${escapeAttribute(author.id)}/">${escapeHtml(author.name)}</a><span class="count">${posts}</span></${tag}>
${bio}
${contact}
</article>
</template>
</kp-author-card>`;
}
