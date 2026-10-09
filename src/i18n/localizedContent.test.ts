import { describe, expect, it } from 'vitest';
import { makePost } from '../lib/testFixtures.ts';
import type { MarkdownPage } from '../lib/types.ts';
import {
  hasPageIn,
  hasPostIn,
  pageIn,
  pageLocales,
  postAlternates,
  postIn,
} from './localizedContent.ts';

const post = makePost({
  slug: '2026-03-22-good-morning',
  date: '2026-03-22',
  title: 'Good morning!',
  translations: new Map([
    [
      'es',
      {
        locale: 'es',
        url: '/es/blog/2026-03-22-good-morning/',
        title: '¡Buenos días!',
        summary: 'Hola',
        html: '<p>Hola.</p>',
        headings: [],
        readingMinutes: 2,
      },
    ],
  ]),
});

const page: MarkdownPage = {
  slug: 'about',
  language: 'en',
  title: 'About',
  html: '<p>About.</p>',
  headings: [],
  translations: new Map([
    ['es', { locale: 'es', title: 'Acerca de', html: '<p>A.</p>', headings: [] }],
  ]),
};

describe('posts in a locale', () => {
  it('knows where a post exists', () => {
    expect(hasPostIn(post, 'en')).toBe(true);
    expect(hasPostIn(post, 'es')).toBe(true);
    expect(hasPostIn(post, 'fr')).toBe(false);
  });

  it('serves the translation where there is one', () => {
    const view = postIn(post, 'es');
    expect(view).toMatchObject({
      url: '/es/blog/2026-03-22-good-morning/',
      language: 'es',
      title: '¡Buenos días!',
      readingMinutes: 2,
      translated: true,
    });
  });

  it('serves the original, in its own language, everywhere else', () => {
    expect(postIn(post, 'en')).toMatchObject({ language: 'en', translated: false });
    expect(postIn(post, 'fr')).toMatchObject({
      url: '/blog/2026-03-22-good-morning/',
      language: 'en',
      title: 'Good morning!',
      translated: false,
    });
  });

  it('lists the original and every translation as alternates', () => {
    expect(postAlternates(post)).toEqual([
      { locale: 'en', path: '/blog/2026-03-22-good-morning/' },
      { locale: 'es', path: '/es/blog/2026-03-22-good-morning/' },
    ]);
  });
});

describe('narration in a locale', () => {
  const english = { file: 'gm-en.wav', src: '/spoken/gm-en.wav', type: 'audio/wav' };
  const spanish = { file: 'gm-es.wav', src: '/spoken/gm-es.wav', type: 'audio/wav' };
  const spanishOnly = post.translations.get('es');
  const narrated = makePost({
    slug: '2026-03-22-good-morning',
    date: '2026-03-22',
    narration: english,
    translations: new Map(spanishOnly ? [['es', { ...spanishOnly, narration: spanish }]] : []),
  });

  it('gives each language its own recording', () => {
    expect(postIn(narrated, 'en').narration).toEqual(english);
    expect(postIn(narrated, 'es').narration).toEqual(spanish);
  });

  it('falls back to the original recording with the original text', () => {
    expect(postIn(narrated, 'fr').narration).toEqual(english);
  });

  it('never borrows the original recording for a translation without one', () => {
    const englishOnly = makePost({ ...post, narration: english });
    expect(postIn(englishOnly, 'es')).not.toHaveProperty('narration');
  });

  it('stays silent for a post without a recording', () => {
    expect(postIn(post, 'en')).not.toHaveProperty('narration');
    expect(postIn(post, 'es')).not.toHaveProperty('narration');
  });
});

describe('pages in a locale', () => {
  it('knows where a page exists and what it says there', () => {
    expect(hasPageIn(page, 'es')).toBe(true);
    expect(hasPageIn(page, 'fr')).toBe(false);
    expect(pageIn(page, 'es')).toMatchObject({ title: 'Acerca de', translated: true });
    expect(pageIn(page, 'fr')).toMatchObject({ title: 'About', language: 'en', translated: false });
    expect(pageLocales(page)).toEqual(['en', 'es']);
  });
});
