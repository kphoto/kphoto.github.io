import type { Alternate } from '../i18n/localizedContent.ts';
import type { MessageKey } from '../i18n/messages/index.ts';
import type { Translator } from '../i18n/translator.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import type { RenderContext } from './context.ts';
import { renderLanguageSwitcher } from './languageSwitcher.ts';
import { renderThemePicker } from './themePicker.ts';

export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export interface HeaderContext extends RenderContext {
  pageHref(slug: string): string;
  translatorFor(code: string): Translator;
}

export const NAV_KEYS: readonly (readonly [MessageKey, string])[] = [
  ['nav.blog', '/blog/'],
  ['nav.tags', '/tags/'],
  ['nav.series', '/series/'],
  ['nav.authors', '/authors/'],
  ['nav.about', 'about'],
  ['nav.contact', 'contact'],
];

export function navItems(context: HeaderContext): NavItem[] {
  return NAV_KEYS.map(([key, target]) => ({
    label: context.t.text(key),
    href: target.startsWith('/') ? context.href(target) : context.pageHref(target),
  }));
}

function isCurrent(currentPath: string, item: NavItem): boolean {
  return currentPath === item.href || currentPath.startsWith(item.href);
}

export function renderSiteHeader(
  context: HeaderContext,
  currentPath: string,
  alternates: readonly Alternate[],
): string {
  const { t } = context;
  const home = context.href('/');
  const links = navItems(context)
    .map((item) => {
      const current = isCurrent(currentPath, item) ? ' aria-current="page"' : '';
      return `<a href="${escapeAttribute(item.href)}"${current}>${escapeHtml(item.label)}</a>`;
    })
    .join('');
  const homeCurrent = currentPath === home ? ' aria-current="page"' : '';
  return `<kp-header>
<template shadowrootmode="open">
<style>
:host { display: block; }
header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  max-inline-size: var(--measure-wide);
  margin-inline: auto;
  padding: 1rem var(--gutter);
  border-block-end: 1px solid var(--border);
}
.wordmark {
  font-family: var(--font-mono);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
  text-decoration: none;
  display: inline-flex;
  align-items: baseline;
}
.wordmark:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.cursor {
  inline-size: 0.55em;
  block-size: 1em;
  margin-inline-start: 0.15em;
  background: var(--accent);
  align-self: center;
}
@media (prefers-reduced-motion: no-preference) {
  .cursor {
    animation: kp-blink 1.1s steps(1, end) 2;
  }
  @keyframes kp-blink {
    50% { opacity: 0; }
  }
}
nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin-inline-start: auto;
}
nav a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
  padding-block: 0.15rem;
}
nav a:hover {
  color: var(--text);
}
nav a[aria-current='page'] {
  color: var(--text);
  border-block-end: 2px solid var(--accent);
}
nav a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
@media (max-width: 640px) {
  header { padding-block: 0.75rem; }
  nav { inline-size: 100%; margin-inline-start: 0; }
}
</style>
<header>
<a class="wordmark" href="${escapeAttribute(home)}"${homeCurrent}>${escapeHtml(context.config.title)}<span class="cursor" aria-hidden="true"></span></a>
<nav aria-label="${escapeAttribute(t.text('nav.label'))}">${links}</nav>
${renderLanguageSwitcher(context, alternates)}
${renderThemePicker(t)}
</header>
</template>
</kp-header>`;
}
