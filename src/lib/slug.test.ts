import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lower-cases and hyphenates', () => {
    expect(slugify('TypeScript 7 in Practice')).toBe('typescript-7-in-practice');
  });

  it('strips diacritics via NFKD', () => {
    expect(slugify('Café Décor')).toBe('cafe-decor');
  });

  it('collapses punctuation runs into single hyphens', () => {
    expect(slugify('a --  b!!c')).toBe('a-b-c');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  ~hello~  ')).toBe('hello');
  });

  it('never returns an empty slug', () => {
    expect(slugify('!!!')).toBe('untitled');
  });
});
