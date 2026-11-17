import { escapeAttribute, escapeHtml } from '../lib/html.ts';

export interface SettingOption {
  readonly value: string;
  readonly label: string;
}

export interface SettingSelect {
  readonly tag: string;
  readonly id: string;
  readonly labelHtml: string;
  readonly options: readonly SettingOption[];
}

export function renderSettingSelect(select: SettingSelect): string {
  const id = escapeAttribute(select.id);
  const options = select.options
    .map(
      (option) =>
        `<option value="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</option>`,
    )
    .join('');
  return `<${select.tag}>
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
<label class="visually-hidden" for="${id}">${select.labelHtml}</label>
<select id="${id}" autocomplete="off">${options}</select>
</template>
</${select.tag}>`;
}
