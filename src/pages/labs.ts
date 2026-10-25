import { renderFlipbook } from '../components/flipbook.ts';
import type { MessageKey } from '../i18n/messages/index.ts';
import { rawHtml } from '../i18n/safeHtml.ts';
import {
  FLIPBOOK_FRAME_COUNT,
  FLIPBOOK_ORIGINAL_FPS,
  frameFileName,
  MAX_CLIMB_DEGREES,
} from '../lib/flipbook.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import { FLIPBOOK_KEY } from '../client/flipbookPreferences.ts';
import { renderDocument, type PageContext } from './layout.ts';

export interface Lab {
  readonly slug: string;
  readonly title: MessageKey;
  readonly summary: MessageKey;
}

export const LABS: readonly Lab[] = [
  { slug: 'flapping-airplane', title: 'lab.flapping.title', summary: 'lab.flapping.summary' },
];

export const ORIGINAL_SITE = 'https://flappingairplanes.com/';

export const SNIPPETS = {
  frame: 'const frame = Math.floor(seconds * fps) % frames.length;',
  loop: `let shown = -1;
const start = performance.now();
const tick = (now: DOMHighResTimeStamp): void => {
  const seconds = (now - start) / 1000;
  const frame = Math.floor(seconds * fps) % frames.length;
  if (frame !== shown) {
    draw(frame);
    shown = frame;
  }
  requestAnimationFrame(tick);
};
requestAnimationFrame(tick);`,
  preload: `const frames = await Promise.all(
  urls.map(async (url) => {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  }),
);`,
  css: `.plane {
  animation: flap calc(28s / 12) step-end infinite;
}
@keyframes flap {
  0%      { background-image: url(frame_001.png); }
  3.5714% { background-image: url(frame_002.png); }
  7.1429% { background-image: url(frame_003.png); }
}`,
} as const;

export function labPath(slug: string): string {
  return `/labs/${slug}/`;
}

const code = (text: string) => rawHtml(`<code>${escapeHtml(text)}</code>`);

const link = (href: string, text: string) =>
  rawHtml(`<a href="${escapeAttribute(href)}">${escapeHtml(text)}</a>`);

const mdn = (path: string, text: string) =>
  rawHtml(
    `<a href="${escapeAttribute(`https://developer.mozilla.org/docs/Web/${path}`)}"><code>${escapeHtml(text)}</code></a>`,
  );

function snippet(text: string, label: string): string {
  return `<pre tabindex="0" aria-label="${escapeAttribute(label)}"><code>${escapeHtml(text)}</code></pre>`;
}

export function renderLabIndex(context: PageContext): string {
  const { t } = context;
  const items = LABS.map(
    (lab) =>
      `<li><a href="${escapeAttribute(context.href(labPath(lab.slug)))}">${t.html(lab.title)}</a><p>${t.html(lab.summary)}</p></li>`,
  ).join('\n');
  const main = `<header class="page-header">
<h1>${t.html('labs.title')}</h1>
<p class="lede">${t.html('labs.lede')}</p>
</header>
<ul class="lab-list">
${items}
</ul>`;
  return renderDocument(
    context,
    {
      title: t.text('labs.title'),
      description: t.text('labs.description', { site: context.config.title }),
      path: context.href('/labs/'),
      alternates: context.everyLocale('/labs/'),
    },
    main,
  );
}

export function renderFlappingAirplaneLab(context: PageContext): string {
  const { t } = context;
  const path = labPath('flapping-airplane');
  const files = rawHtml(
    `<code>${frameFileName(0)}</code> … <code>${frameFileName(FLIPBOOK_FRAME_COUNT - 1)}</code>`,
  );
  const main = `<article class="lab">
<header class="page-header">
<p class="eyebrow">${t.html('lab.eyebrow')}</p>
<h1>${t.html('lab.flapping.title')}</h1>
<p class="lede">${t.html('lab.flapping.lede', { count: FLIPBOOK_FRAME_COUNT, fps: FLIPBOOK_ORIGINAL_FPS })}</p>
</header>
${renderFlipbook(context)}
<p class="lab-credit">${t.html('lab.flapping.credit', { site: link(ORIGINAL_SITE, 'flappingairplanes.com') })}</p>
<p class="lab-disclaimer" role="note">${t.html('lab.flapping.disclaimer')}</p>
<div class="prose">
<h2 id="flipbook">${t.html('lab.flapping.flipbookHeading')}</h2>
<p>${t.html('lab.flapping.flipbook1', { count: FLIPBOOK_FRAME_COUNT, files })}</p>
<p>${t.html('lab.flapping.flipbook2')}</p>
<h2 id="clock">${t.html('lab.flapping.clockHeading')}</h2>
<p>${t.html('lab.flapping.clock1')}</p>
${snippet(SNIPPETS.frame, t.text('lab.flapping.codeLabel'))}
<p>${t.html('lab.flapping.clock2', { fps: FLIPBOOK_ORIGINAL_FPS })}</p>
<h2 id="loop">${t.html('lab.flapping.loopHeading')}</h2>
<p>${t.html('lab.flapping.loop1', { raf: mdn('API/Window/requestAnimationFrame', 'requestAnimationFrame()') })}</p>
${snippet(SNIPPETS.loop, t.text('lab.flapping.codeLabel'))}
<p>${t.html('lab.flapping.loop2', { observer: mdn('API/IntersectionObserver', 'IntersectionObserver') })}</p>
<h2 id="preload">${t.html('lab.flapping.preloadHeading')}</h2>
<p>${t.html('lab.flapping.preload1')}</p>
${snippet(SNIPPETS.preload, t.text('lab.flapping.codeLabel'))}
<p>${t.html('lab.flapping.preload2', { decode: mdn('API/HTMLImageElement/decode', 'decode()'), count: FLIPBOOK_FRAME_COUNT })}</p>
<h2 id="draw">${t.html('lab.flapping.drawHeading')}</h2>
<p>${t.html('lab.flapping.draw1')}</p>
<ul>
<li>${t.html('lab.flapping.drawImage', { img: code('<img>'), src: code('src') })}</li>
<li>${t.html('lab.flapping.drawCanvas', { canvas: code('<canvas>'), drawImage: mdn('API/CanvasRenderingContext2D/drawImage', 'drawImage()'), bitmap: mdn('API/ImageBitmap', 'ImageBitmap') })}</li>
<li>${t.html('lab.flapping.drawCss', { keyframes: code('@keyframes'), steps: code('step-end'), waapi: mdn('API/Web_Animations_API', 'Web Animations API'), animation: mdn('API/Animation', 'Animation') })}</li>
</ul>
${snippet(SNIPPETS.css, t.text('lab.flapping.codeLabel'))}
<h2 id="ink">${t.html('lab.flapping.inkHeading')}</h2>
<p>${t.html('lab.flapping.ink1', {
    filter: code('filter: grayscale(1) brightness(1.08) contrast(1.6)'),
    multiply: code('mix-blend-mode: multiply'),
    invert: code('invert(1)'),
    screen: code('screen'),
  })}</p>
<h2 id="original">${t.html('lab.flapping.originalHeading')}</h2>
<p>${t.html('lab.flapping.original1')}</p>
<p>${t.html('lab.flapping.original2', { degrees: MAX_CLIMB_DEGREES })}</p>
<p>${t.html('lab.flapping.original3')}</p>
<h2 id="polite">${t.html('lab.flapping.politeHeading')}</h2>
<p>${t.html('lab.flapping.polite1', { reduced: code('prefers-reduced-motion'), key: code(FLIPBOOK_KEY) })}</p>
</div>
</article>`;
  return renderDocument(
    context,
    {
      title: t.text('lab.flapping.title'),
      description: t.text('lab.flapping.description'),
      path: context.href(path),
      alternates: context.everyLocale(path),
    },
    main,
  );
}
