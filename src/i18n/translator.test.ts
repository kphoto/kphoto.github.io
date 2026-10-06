import { describe, expect, it } from 'vitest';
import type { LocaleSettings } from './locales.ts';
import { catalogs, type Catalogs } from './messages/index.ts';
import { rawHtml } from './safeHtml.ts';
import { createTranslator, missingKeys } from './translator.ts';

const settings: LocaleSettings = {
  defaultLocale: 'en',
  locales: [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'es', name: 'Español', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
  ],
};
const partial: Catalogs = { ...catalogs, ar: { 'nav.blog': 'المدونة' } };

describe('createTranslator', () => {
  const en = createTranslator(settings, catalogs, 'en');
  const es = createTranslator(settings, catalogs, 'es');
  const ar = createTranslator(settings, partial, 'ar');

  it('rejects an unknown locale', () => {
    expect(() => createTranslator(settings, catalogs, 'fr')).toThrow(/unknown locale/);
  });

  it('exposes the locale definition', () => {
    expect(ar.locale.dir).toBe('rtl');
    expect(es.defaultLocale).toBe('en');
  });

  it('translates text with parameters and plurals', () => {
    expect(en.text('blog.lede', { count: 1 })).toBe('1 post, newest first.');
    expect(es.text('blog.lede', { count: 2 })).toBe(
      '2 artículos, del más reciente al más antiguo.',
    );
  });

  it('falls back to the default locale per key', () => {
    expect(ar.text('nav.blog')).toBe('المدونة');
    expect(ar.text('nav.tags')).toBe('Tags');
    expect(ar.resolve('nav.tags')).toEqual({ value: 'Tags', locale: 'en' });
  });

  it('marks fallback HTML with the language it is written in', () => {
    expect(ar.html('nav.blog')).toBe('المدونة');
    expect(ar.html('nav.tags')).toBe('<span lang="en">Tags</span>');
  });

  it('escapes the template and text parameters but not trusted HTML', () => {
    expect(en.html('tag.title', { tag: '<b>' })).toBe('Tagged “&lt;b&gt;”');
    expect(en.html('footer.commit', { commit: rawHtml('<code>abc</code>') })).toBe(
      'Built from <code>abc</code>',
    );
    expect(en.html('author.postCount', { count: 1500 })).toBe('1,500 posts');
  });

  it('formats dates and numbers for the locale', () => {
    expect(en.date('2026-03-22')).toBe('March 22, 2026');
    expect(es.date('2026-03-22')).toBe('22 de marzo de 2026');
    expect(es.number(1234567)).toBe('1.234.567');
  });

  it('names languages in the page language', () => {
    expect(en.localeName('es')).toBe('Spanish');
    expect(es.localeName('en')).toBe('inglés');
  });
});

describe('missingKeys', () => {
  it('lists keys a partial catalog still lacks', () => {
    const missing = missingKeys(partial, 'en', 'ar');
    expect(missing).toContain('nav.tags');
    expect(missing).not.toContain('nav.blog');
    expect(missingKeys(partial, 'en', 'fr').length).toBe(Object.keys(catalogs.en ?? {}).length);
  });
});
