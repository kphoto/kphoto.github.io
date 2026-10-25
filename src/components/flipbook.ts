import {
  FLIPBOOK_FRAME_COUNT,
  FLIPBOOK_FRAME_HEIGHT,
  FLIPBOOK_FRAME_WIDTH,
  FLIPBOOK_ORIGINAL_FPS,
  FLIPBOOK_RENDERERS,
  flipbookKeyframes,
  frameFileName,
  frameUrls,
  MAX_FPS,
  MIN_FPS,
  type FlipbookRenderer,
} from '../lib/flipbook.ts';
import { escapeAttribute } from '../lib/html.ts';
import type { MessageKey } from '../i18n/messages/index.ts';
import type { RenderContext } from './context.ts';

export const NO_SCRIPT_RENDERER: FlipbookRenderer = 'css';

const RENDERER_LABELS: Readonly<Record<FlipbookRenderer, MessageKey>> = {
  image: 'flipbook.rendererImage',
  canvas: 'flipbook.rendererCanvas',
  css: 'flipbook.rendererCss',
};

export function renderFlipbook(context: RenderContext): string {
  const { t } = context;
  const urls = frameUrls();
  const first = urls[0] ?? '';
  const hidden = (renderer: FlipbookRenderer): string =>
    renderer === NO_SCRIPT_RENDERER ? '' : ' hidden';
  const radios = FLIPBOOK_RENDERERS.map(
    (renderer) =>
      `<label class="choice"><input type="radio" name="renderer" value="${renderer}" disabled${renderer === NO_SCRIPT_RENDERER ? ' checked' : ''} /> ${t.html(RENDERER_LABELS[renderer])}</label>`,
  ).join('\n');
  const thumbs = urls
    .map(
      (url, index) =>
        `<li${index === 0 ? ' data-current=""' : ''}><img src="${escapeAttribute(url)}" alt="" width="90" height="72" loading="lazy" decoding="async" /></li>`,
    )
    .join('\n');
  const count = String(FLIPBOOK_FRAME_COUNT);
  const fps = String(FLIPBOOK_ORIGINAL_FPS);
  return `<kp-flipbook data-frames="${escapeAttribute(JSON.stringify(urls))}" data-state="idle">
<template shadowrootmode="open">
<style>
:host { display: block; }
figure {
  margin: 0;
  display: grid;
  gap: 0.6rem;
}
.stage {
  position: relative;
  aspect-ratio: ${String(FLIPBOOK_FRAME_WIDTH)} / ${String(FLIPBOOK_FRAME_HEIGHT)};
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
}
.tilt {
  position: absolute;
  inset: 0;
  display: grid;
  background: var(--bg);
  transform: rotate(calc(var(--climb, 0) * -1deg));
  opacity: var(--fade, 1);
}
.surface {
  grid-area: 1 / 1;
  display: block;
  inline-size: 100%;
  block-size: 100%;
  object-fit: contain;
  filter: var(--ink-filter, none);
  mix-blend-mode: var(--ink-blend, multiply);
}
.surface[hidden] {
  display: none;
}
.css {
  --frames: ${count};
  --fps: ${fps};
  background: url('${escapeAttribute(first)}') center / contain no-repeat;
  animation: kp-flap calc(var(--frames) * 1s / var(--fps)) step-end infinite;
}
@media (prefers-reduced-motion: reduce) {
  .css {
    animation-play-state: paused;
  }
}
${flipbookKeyframes('kp-flap', urls)}
figcaption {
  font-size: 0.85rem;
  color: var(--muted);
}
.status {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--muted);
}
.status [hidden] {
  display: none;
}
progress {
  inline-size: 8rem;
  accent-color: var(--accent-strong);
}
.controls {
  margin-block-start: 0.75rem;
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--surface);
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  font-size: 0.9rem;
  min-inline-size: 2.75rem;
  min-block-size: 2.75rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}
button:hover:enabled {
  border-color: var(--accent);
}
button.primary {
  min-inline-size: 6rem;
  font-weight: 600;
  border-color: var(--accent);
}
button:disabled,
input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.slider {
  display: grid;
  grid-template-columns: minmax(8rem, auto) 1fr 3.5rem;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}
.slider input {
  inline-size: 100%;
  accent-color: var(--accent-strong);
}
output {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-align: end;
}
fieldset {
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  font-size: 0.9rem;
}
legend {
  float: inline-start;
  margin-inline-end: 0.5rem;
  font-weight: 600;
}
.choice {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.choice input {
  accent-color: var(--accent-strong);
}
.readout {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  gap: 0.5rem;
}
.readout div {
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
}
dt {
  font-size: 0.75rem;
  color: var(--muted);
}
dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  color: var(--text);
}
.filmstrip {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0.1rem 0.5rem;
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
}
.filmstrip li {
  flex: none;
  inline-size: 3.75rem;
  border: 2px solid transparent;
  border-radius: 0.35rem;
  overflow: hidden;
  background: var(--bg);
}
.filmstrip li[data-current] {
  border-color: var(--accent);
}
.filmstrip img {
  display: block;
  inline-size: 100%;
  block-size: auto;
  filter: var(--ink-filter, none);
  mix-blend-mode: var(--ink-blend, multiply);
}
.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 480px) {
  .slider {
    grid-template-columns: 1fr 3rem;
  }
  .slider span {
    grid-column: 1 / -1;
  }
}
</style>
<figure>
<div class="stage" role="img" aria-label="${escapeAttribute(t.text('flipbook.stageLabel'))}">
<div class="tilt" data-tilt>
<img class="surface" data-surface="image" src="${escapeAttribute(first)}" alt="" width="${String(FLIPBOOK_FRAME_WIDTH)}" height="${String(FLIPBOOK_FRAME_HEIGHT)}"${hidden('image')} />
<canvas class="surface" data-surface="canvas" width="${String(FLIPBOOK_FRAME_WIDTH)}" height="${String(FLIPBOOK_FRAME_HEIGHT)}"${hidden('canvas')}></canvas>
<div class="surface css" data-surface="css"${hidden('css')}></div>
</div>
</div>
<figcaption>${t.html('flipbook.caption')}</figcaption>
</figure>
<p class="status" role="status"><span data-when="idle">${t.html('flipbook.noscript')}</span><span data-when="loading" hidden>${t.html('flipbook.loading')}</span><span data-when="ready" hidden>${t.html('flipbook.ready', { count: FLIPBOOK_FRAME_COUNT })}</span><span data-when="failed" hidden>${t.html('flipbook.failed')}</span><progress max="${count}" value="0" hidden aria-label="${escapeAttribute(t.text('flipbook.loading'))}"></progress></p>
<div class="controls">
<div class="buttons">
<button type="button" data-action="back" disabled aria-label="${escapeAttribute(t.text('flipbook.previous'))}">◀︎</button>
<button type="button" class="primary" data-action="toggle" disabled data-play="${escapeAttribute(t.text('flipbook.play'))}" data-pause="${escapeAttribute(t.text('flipbook.pause'))}">${t.html('flipbook.play')}</button>
<button type="button" data-action="forward" disabled aria-label="${escapeAttribute(t.text('flipbook.next'))}">▶︎</button>
</div>
<label class="slider"><span>${t.html('flipbook.frame')}</span><input type="range" data-control="frame" min="1" max="${count}" step="1" value="1" disabled /><output data-out="frame">1</output></label>
<label class="slider"><span>${t.html('flipbook.fps')}</span><input type="range" data-control="fps" min="${String(MIN_FPS)}" max="${String(MAX_FPS)}" step="1" value="${fps}" disabled /><output data-out="fps">${fps}</output></label>
<label class="slider"><span>${t.html('flipbook.climb')}</span><input type="range" data-control="climb" min="0" max="100" step="1" value="0" disabled /><output data-out="climb">0°</output></label>
<fieldset>
<legend>${t.html('flipbook.renderer')}</legend>
${radios}
</fieldset>
<dl class="readout">
<div><dt>${t.html('flipbook.time')}</dt><dd data-out="seconds">0.00 s</dd></div>
<div><dt>${t.html('flipbook.product')}</dt><dd data-out="product">0.00</dd></div>
<div><dt>${t.html('flipbook.index', { count: FLIPBOOK_FRAME_COUNT })}</dt><dd data-out="index">0</dd></div>
<div><dt>${t.html('flipbook.file')}</dt><dd data-out="file">${frameFileName(0)}</dd></div>
</dl>
</div>
<ol class="filmstrip" aria-hidden="true">
${thumbs}
</ol>
</template>
</kp-flipbook>`;
}
