import { describe, expect, it } from 'vitest';
import { postIn } from '../i18n/localizedContent.ts';
import { makePost } from '../lib/testFixtures.ts';
import { makePageContext } from '../pages/testContext.ts';
import { renderNarration } from './narration.ts';
import { renderPostCard } from './postCard.ts';

const en = makePageContext('en');
const es = makePageContext('es');

const english = {
  file: 'clean-hands-en.wav',
  src: '/spoken/clean-hands-en.wav',
  type: 'audio/wav',
};
const spanish = {
  file: 'clean-hands-es.wav',
  src: '/spoken/clean-hands-es.wav',
  type: 'audio/wav',
};

const narrated = makePost({
  slug: '2026-10-08-clean-hands',
  date: '2026-10-08',
  narration: english,
  translations: new Map([
    [
      'es',
      {
        locale: 'es',
        url: '/es/blog/2026-10-08-clean-hands/',
        title: 'Manos limpias',
        summary: 'Lávalas.',
        html: '<p>Hola.</p>',
        headings: [],
        readingMinutes: 1,
        narration: spanish,
      },
    ],
  ]),
});

const quiet = makePost({ slug: '2026-10-09-quiet', date: '2026-10-09' });

describe('renderNarration', () => {
  const html = renderNarration(postIn(narrated, 'en'), en);

  it('ships an open shadow root with scoped styles', () => {
    expect(html).toMatch(/^<kp-narration>/);
    expect(html).toContain('<template shadowrootmode="open">');
    expect(html).toContain('<style>');
    expect(html).toMatch(/<\/kp-narration>$/);
  });

  it('embeds a native player with the recording and its media type', () => {
    expect(html).toContain('<source src="/spoken/clean-hands-en.wav" type="audio/wav" />');
    expect(html).toContain('<audio controls preload="metadata"');
  });

  it('never plays on its own', () => {
    expect(html).not.toContain('autoplay');
  });

  it('names the player after its visible caption', () => {
    expect(html).toContain('<figcaption id="narration-label">Listen to this article</figcaption>');
    expect(html).toContain('aria-labelledby="narration-label"');
  });

  it('declares the language spoken and discloses the AI voice', () => {
    expect(html).toContain('lang="en"');
    expect(html).toContain('AI-generated voice');
  });

  it('plays the Spanish recording, labelled in Spanish, on the Spanish page', () => {
    const spanishHtml = renderNarration(postIn(narrated, 'es'), es);
    expect(spanishHtml).toContain('src="/spoken/clean-hands-es.wav"');
    expect(spanishHtml).toContain('lang="es"');
    expect(spanishHtml).toContain('>Escucha este artículo</figcaption>');
    expect(spanishHtml).toContain('voz generada con IA');
  });

  it('renders nothing for a post without a recording', () => {
    expect(renderNarration(postIn(quiet, 'en'), en)).toBe('');
    expect(renderNarration(postIn(quiet, 'es'), es)).toBe('');
  });

  it('escapes what it embeds', () => {
    const odd = makePost({
      slug: '2026-10-08-odd',
      date: '2026-10-08',
      narration: { file: 'x', src: '/spoken/"x".wav', type: 'audio/wav"' },
    });
    const oddHtml = renderNarration(postIn(odd, 'en'), en);
    expect(oddHtml).toContain('src="/spoken/&quot;x&quot;.wav"');
    expect(oddHtml).toContain('type="audio/wav&quot;"');
  });
});

describe('renderPostCard narration badge', () => {
  it('marks a narrated post in its own language', () => {
    expect(renderPostCard(postIn(narrated, 'en'), en)).toContain(
      '<span class="narrated">with audio</span>',
    );
    expect(renderPostCard(postIn(narrated, 'es'), es)).toContain(
      '<span class="narrated">con audio</span>',
    );
  });

  it('leaves every other card unmarked', () => {
    expect(renderPostCard(postIn(quiet, 'en'), en)).not.toContain('class="narrated"');
    expect(renderPostCard(postIn(quiet, 'es'), es)).not.toContain('class="narrated"');
  });
});
