import { escapeAttribute, escapeHtml } from '../lib/html';
import { THEMES, type ThemeName } from '../client/storage';

const THEME_LABELS: Readonly<Record<ThemeName, string>> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
  'solarized-light': 'Solarized Light',
  'solarized-dark': 'Solarized Dark',
};

/**
 * Server-rendered theme picker. The markup ships as declarative shadow DOM so
 * its styles are scoped; `src/client/main.ts` upgrades it with behaviour.
 */
export function renderThemePicker(): string {
  const options = THEMES.map(
    (theme) =>
      `<option value="${escapeAttribute(theme)}">${escapeHtml(THEME_LABELS[theme])}</option>`,
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
<label class="visually-hidden" for="theme-select">Theme</label>
<select id="theme-select" autocomplete="off">${options}</select>
</template>
</kp-theme-picker>`;
}
