import { describe, expect, it } from 'vitest';
import {
  FLIPBOOK_FRAME_COUNT,
  FLIPBOOK_RENDERERS,
  frameUrls,
  parseFrameList,
} from '../lib/flipbook.ts';
import { makePageContext } from '../pages/testContext.ts';
import { NO_SCRIPT_RENDERER, renderFlipbook } from './flipbook.ts';

const en = renderFlipbook(makePageContext('en'));
const es = renderFlipbook(makePageContext('es'));

describe('renderFlipbook', () => {
  it('ships an open shadow root with scoped styles', () => {
    expect(en.startsWith('<kp-flipbook ')).toBe(true);
    expect(en).toContain('<template shadowrootmode="open">');
    expect(en).toContain('<style>');
    expect(en.trim().endsWith('</kp-flipbook>')).toBe(true);
  });

  it('hands every frame path to the browser', () => {
    const match = /data-frames="([^"]+)"/.exec(en);
    const raw = (match?.[1] ?? '').replaceAll('&quot;', '"');
    expect(parseFrameList(raw)).toEqual(frameUrls());
  });

  it('plays with CSS alone until script takes over', () => {
    expect(NO_SCRIPT_RENDERER).toBe('css');
    expect(en).toContain('<div class="surface css" data-surface="css">');
    expect(en).toContain('data-surface="image" src="/images/flapping-airplanes/frame_001.png"');
    expect(en).toMatch(/data-surface="image"[^>]* hidden \/>/);
    expect(en).toMatch(/data-surface="canvas"[^>]* hidden>/);
    expect(en).toContain('@keyframes kp-flap {');
    expect(en).toContain(
      'animation: kp-flap calc(var(--frames) * 1s / var(--fps)) step-end infinite;',
    );
    expect(en).toContain('animation-play-state: paused;');
  });

  it('keeps every control disabled until upgraded', () => {
    const controls = en.match(/<(button|input) [^>]*>/g) ?? [];
    expect(controls.length).toBeGreaterThan(5);
    for (const control of controls) {
      expect(control).toContain('disabled');
    }
  });

  it('offers each renderer once, CSS checked', () => {
    for (const renderer of FLIPBOOK_RENDERERS) {
      expect(en.match(new RegExp(`value="${renderer}"`, 'g'))).toHaveLength(1);
    }
    expect(en).toContain('value="css" disabled checked');
  });

  it('labels the picture and the icon buttons', () => {
    expect(en).toContain('role="img" aria-label="A hand-drawn airplane');
    expect(en).toContain('aria-label="Previous frame"');
    expect(en).toContain('aria-label="Next frame"');
    expect(en).toContain('data-play="Play" data-pause="Pause"');
  });

  it('shows the filmstrip to sighted readers only', () => {
    expect(en).toContain('<ol class="filmstrip" aria-hidden="true">');
    expect(en.match(/<li[^>]*><img [^>]*loading="lazy"/g)).toHaveLength(FLIPBOOK_FRAME_COUNT);
  });

  it('credits the drawings and says why they are here', () => {
    expect(en).toContain('Drawings © Flapping Airplanes, used for demonstration purposes only.');
  });

  it('speaks the page language', () => {
    expect(es).toContain('Reproducir');
    expect(es).toContain('Dibujar con');
    expect(es).toContain('Dibujos © Flapping Airplanes');
  });

  it('blends the ink with theme tokens', () => {
    expect(en).toContain('filter: var(--ink-filter, none);');
    expect(en).toContain('mix-blend-mode: var(--ink-blend, multiply);');
  });
});
