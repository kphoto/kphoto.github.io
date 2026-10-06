import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import { THEMES, type ThemeName } from '../client/storage.ts';
import type { MessageKey } from '../i18n/messages/index.ts';
import type { Translator } from '../i18n/translator.ts';

export const THEME_LABEL_KEYS: Readonly<Record<ThemeName, MessageKey>> = {
  system: 'theme.system',
  light: 'theme.light',
  dark: 'theme.dark',
  'solarized-light': 'theme.solarizedLight',
  'solarized-dark': 'theme.solarizedDark',
};

export function renderThemePicker(t: Translator): string {
  const options = THEMES.map(
    (theme) =>
      `<option value="${escapeAttribute(theme)}">${escapeHtml(t.text(THEME_LABEL_KEYS[theme]))}</option>`,
  ).join('');
  return `<kp-theme-picker>
<template shadowrootmode="open">
<style>
:host { display: inline-block; }
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
select {
  font: inherit;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
}
select:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
</style>
<label class="visually-hidden" for="theme-select">${t.html('theme.label')}</label>
<select id="theme-select" autocomplete="off">${options}</select>
</template>
</kp-theme-picker>`;
}
