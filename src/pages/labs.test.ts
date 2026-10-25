import { describe, expect, it } from 'vitest';
import { FLIPBOOK_KEY } from '../client/flipbookPreferences.ts';
import {
  LABS,
  labPath,
  ORIGINAL_SITE,
  renderFlappingAirplaneLab,
  renderLabIndex,
  SNIPPETS,
} from './labs.ts';
import { makePageContext } from './testContext.ts';

const en = makePageContext('en');
const es = makePageContext('es');
const lab = renderFlappingAirplaneLab(en);
const labEs = renderFlappingAirplaneLab(es);

describe('labPath', () => {
  it('nests every lab under /labs/', () => {
    expect(labPath('flapping-airplane')).toBe('/labs/flapping-airplane/');
  });
});

describe('renderLabIndex', () => {
  const index = renderLabIndex(en);

  it('links every lab with its summary', () => {
    for (const entry of LABS) {
      expect(index).toContain(`href="${labPath(entry.slug)}"`);
    }
    expect(index).toContain('<h1>Labs</h1>');
    expect(index).toContain('How the flapping airplane flies');
  });

  it('localizes links and text', () => {
    const spanish = renderLabIndex(es);
    expect(spanish).toContain('href="/es/labs/flapping-airplane/"');
    expect(spanish).toContain('<h1>Laboratorio</h1>');
  });
});

describe('renderFlappingAirplaneLab', () => {
  it('renders the flipbook inside the lab article', () => {
    expect(lab).toContain('<article class="lab">');
    expect(lab).toContain('<kp-flipbook ');
    expect(lab).toContain('<h1>How the flapping airplane flies</h1>');
  });

  it('credits the original and carries the disclaimer', () => {
    expect(lab).toContain(`href="${ORIGINAL_SITE}"`);
    expect(lab).toContain('<p class="lab-disclaimer" role="note">');
    expect(lab).toContain('educational and demonstration purposes only');
    expect(lab).toContain('not affiliated with or endorsed by Flapping Airplanes');
    expect(labEs).toContain('solo con fines educativos y de demostración');
  });

  it('teaches with escaped, keyboard-scrollable code', () => {
    expect(lab.match(/<pre tabindex="0" aria-label="Code example">/g)).toHaveLength(4);
    expect(lab).toContain('Math.floor(seconds * fps) % frames.length;');
    expect(lab).toContain('(now: DOMHighResTimeStamp): void =&gt;');
    expect(SNIPPETS.css).toContain('step-end');
  });

  it('names the real numbers and the storage key', () => {
    expect(lab).toContain('28 drawings');
    expect(lab).toContain('12 times a second');
    expect(lab).toContain('14°');
    expect(lab).toContain(`<code>${FLIPBOOK_KEY}</code>`);
    expect(lab).toContain('<code>frame_001.png</code> … <code>frame_028.png</code>');
  });

  it('declares both language versions', () => {
    expect(lab).toContain(
      'hreflang="es" href="https://kphoto.github.io/es/labs/flapping-airplane/"',
    );
    expect(labEs).toContain('<html lang="es"');
    expect(labEs).toContain('Cómo vuela el avión que aletea');
  });
});
