import type { Alternate } from '../i18n/localizedContent.ts';
import type { Translator } from '../i18n/translator.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import type { RenderContext } from './context.ts';

export interface SwitcherContext extends RenderContext {
  translatorFor(code: string): Translator;
}

export function orderedAlternates(
  context: RenderContext,
  alternates: readonly Alternate[],
): Alternate[] {
  const order = context.config.locales.map((locale) => locale.code);
  return [...alternates]
    .filter((alternate) => order.includes(alternate.locale))
    .sort((a, b) => order.indexOf(a.locale) - order.indexOf(b.locale));
}

export function renderLanguageSwitcher(
  context: SwitcherContext,
  alternates: readonly Alternate[],
): string {
  const { t, config } = context;
  const available = orderedAlternates(context, alternates);
  if (config.locales.length < 2 || available.length < 2) {
    return '';
  }
  const current = t.locale.code;
  const links = available
    .map((alternate) => {
      const name = config.locales.find((locale) => locale.code === alternate.locale)?.name;
      const isCurrent = alternate.locale === current ? ' aria-current="page"' : '';
      return `<li><a href="${escapeAttribute(alternate.path)}" lang="${escapeAttribute(alternate.locale)}" hreflang="${escapeAttribute(alternate.locale)}" data-locale="${escapeAttribute(alternate.locale)}"${isCurrent}>${escapeHtml(name ?? alternate.locale)}</a></li>`;
    })
    .join('');
  const suggestions = available
    .filter((alternate) => alternate.locale !== current)
    .map(
      (alternate) =>
        `<p class="suggest" data-locale="${escapeAttribute(alternate.locale)}" hidden><a href="${escapeAttribute(alternate.path)}" lang="${escapeAttribute(alternate.locale)}" hreflang="${escapeAttribute(alternate.locale)}" data-locale="${escapeAttribute(alternate.locale)}">${context.translatorFor(alternate.locale).html('language.suggest')}</a></p>`,
    )
    .join('');
  return `<kp-language-switcher data-locale="${escapeAttribute(current)}">
<template shadowrootmode="open">
<style>
:host { display: inline-block; }
[hidden] { display: none !important; }
ul {
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}
a {
  color: var(--muted);
  text-decoration: none;
}
a:hover,
a[aria-current='page'] {
  color: var(--text);
}
a[aria-current='page'] {
  border-block-end: 2px solid var(--accent);
}
a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.suggest {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
}
.suggest a {
  color: var(--accent-strong);
  text-decoration: underline;
}
</style>
<nav aria-label="${escapeAttribute(t.text('language.label'))}"><ul>${links}</ul>${suggestions}</nav>
</template>
</kp-language-switcher>`;
}
