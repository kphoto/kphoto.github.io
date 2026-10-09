import type { LocalizedPost } from '../i18n/localizedContent.ts';
import { escapeAttribute } from '../lib/html.ts';
import type { RenderContext } from './context.ts';

export function renderNarration(view: LocalizedPost, context: RenderContext): string {
  const narration = view.narration;
  if (!narration) {
    return '';
  }
  const { t } = context;
  return `<kp-narration>
<template shadowrootmode="open">
<style>
:host { display: block; }
figure {
  margin: 0;
  display: grid;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border);
  border-inline-start: 3px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--surface);
}
figcaption {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text);
}
audio {
  display: block;
  inline-size: 100%;
}
audio:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.note {
  margin: 0;
  font-size: 0.75rem;
  color: var(--muted);
}
</style>
<figure>
<figcaption id="narration-label">${t.html('narration.label')}</figcaption>
<audio controls preload="metadata" aria-labelledby="narration-label" lang="${escapeAttribute(view.language)}"><source src="${escapeAttribute(narration.src)}" type="${escapeAttribute(narration.type)}" /></audio>
<p class="note">${t.html('narration.note')}</p>
</figure>
</template>
</kp-narration>`;
}
