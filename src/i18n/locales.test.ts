import { describe, expect, it } from 'vitest';
import {
  findLocale,
  isLocaleCode,
  localePrefix,
  localizePath,
  requireLocale,
  splitLocalePath,
  validateLocaleSettings,
  type LocaleSettings,
} from './locales.ts';

const settings: LocaleSettings = {
  defaultLocale: 'en',
  locales: [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'es', name: 'Español', dir: 'ltr' },
    { code: 'pt-br', name: 'Português', dir: 'ltr' },
  ],
};

describe('isLocaleCode', () => {
  it('accepts lower-case BCP 47 tags', () => {
    for (const code of ['en', 'es', 'fil', 'pt-br', 'zh-hant']) {
      expect(isLocaleCode(code)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    for (const code of ['', 'EN', 'e', 'en_US', 'en-', 'english-x', 3]) {
      expect(isLocaleCode(code)).toBe(false);
    }
  });
});

describe('validateLocaleSettings', () => {
  it('accepts the configured settings', () => {
    expect(() => {
      validateLocaleSettings(settings);
    }).not.toThrow();
  });

  it('rejects bad codes, duplicates and a missing default', () => {
    const bad =
      (locales: LocaleSettings['locales'], defaultLocale = 'en') =>
      () => {
        validateLocaleSettings({ defaultLocale, locales });
      };
    expect(bad([{ code: 'EN', name: 'x', dir: 'ltr' }], 'EN')).toThrow(/lower-case/);
    expect(
      bad([
        { code: 'en', name: 'x', dir: 'ltr' },
        { code: 'en', name: 'y', dir: 'ltr' },
      ]),
    ).toThrow(/unique/);
    expect(bad([{ code: 'es', name: 'x', dir: 'ltr' }])).toThrow(/default locale/);
  });
});

describe('locale paths', () => {
  it('leaves the default locale unprefixed', () => {
    expect(localePrefix(settings, 'en')).toBe('');
    expect(localizePath(settings, 'en', '/blog/')).toBe('/blog/');
  });

  it('prefixes other locales', () => {
    expect(localePrefix(settings, 'es')).toBe('/es');
    expect(localizePath(settings, 'pt-br', '/')).toBe('/pt-br/');
  });

  it('rejects relative paths', () => {
    expect(() => localizePath(settings, 'es', 'blog/')).toThrow(/site-absolute/);
  });

  it('splits a path into locale and unprefixed path', () => {
    expect(splitLocalePath(settings, '/es/blog/')).toEqual({ locale: 'es', path: '/blog/' });
    expect(splitLocalePath(settings, '/es')).toEqual({ locale: 'es', path: '/' });
    expect(splitLocalePath(settings, '/essays/')).toEqual({ locale: 'en', path: '/essays/' });
    expect(splitLocalePath(settings, '/blog/')).toEqual({ locale: 'en', path: '/blog/' });
  });
});

describe('finding locales', () => {
  it('finds or requires a configured locale', () => {
    expect(findLocale(settings, 'es')?.name).toBe('Español');
    expect(findLocale(settings, 'fr')).toBeUndefined();
    expect(requireLocale(settings, 'en').dir).toBe('ltr');
    expect(() => requireLocale(settings, 'fr')).toThrow(/unknown locale/);
  });
});
