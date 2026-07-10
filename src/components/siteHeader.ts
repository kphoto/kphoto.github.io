import { escapeAttribute, escapeHtml } from '../lib/html';
import { renderThemePicker } from './themePicker';

export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/blog/', label: 'Blog' },
  { href: '/tags/', label: 'Tags' },
  { href: '/series/', label: 'Series' },
  { href: '/authors/', label: 'Authors' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
];

function isCurrent(currentPath: string, item: NavItem): boolean {
  return currentPath === item.href || currentPath.startsWith(item.href);
}

/**
 * Site header: mono wordmark with a one-blink cursor (the site's small
 * signature), main navigation and the theme picker. Declarative shadow DOM
 * keeps every style scoped to the component.
 */
export function renderSiteHeader(currentPath: string): string {
  const links = NAV_ITEMS.map((item) => {
    const current = isCurrent(currentPath, item) ? ' aria-current="page"' : '';
    return `<a href="${escapeAttribute(item.href)}"${current}>${escapeHtml(item.label)}</a>`;
  }).join('');
  const homeCurrent = currentPath === '/' ? ' aria-current="page"' : '';
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
<a class="wordmark" href="/"${homeCurrent}>kphoto<span class="cursor" aria-hidden="true"></span></a>
<nav aria-label="Main">${links}</nav>
${renderThemePicker()}
</header>
</template>
</kp-header>`;
}
