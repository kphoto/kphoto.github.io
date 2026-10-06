import { describe, expect, it } from 'vitest';
import {
  formatMessage,
  formatNumber,
  interpolate,
  isMessageValue,
  selectTemplate,
} from './format.ts';

describe('isMessageValue', () => {
  it('accepts strings and plural maps with an other form', () => {
    expect(isMessageValue('x')).toBe(true);
    expect(isMessageValue({ one: 'a', other: 'b' })).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isMessageValue(3)).toBe(false);
    expect(isMessageValue(null)).toBe(false);
    expect(isMessageValue(['a'])).toBe(false);
    expect(isMessageValue({ one: 'a' })).toBe(false);
    expect(isMessageValue({ one: 1, other: 'b' })).toBe(false);
  });
});

describe('selectTemplate', () => {
  const forms = { zero: 'none', one: 'single', few: 'few', other: 'many' };

  it('uses the locale plural rules', () => {
    expect(selectTemplate('en', forms, 1)).toBe('single');
    expect(selectTemplate('en', forms, 2)).toBe('many');
    expect(selectTemplate('pl', forms, 3)).toBe('few');
  });

  it('prefers an explicit zero form for zero', () => {
    expect(selectTemplate('en', forms, 0)).toBe('none');
    expect(selectTemplate('en', { one: 'a', other: 'b' }, 0)).toBe('b');
  });

  it('falls back to other without a count or a matching form', () => {
    expect(selectTemplate('en', forms)).toBe('many');
    expect(selectTemplate('pl', { one: 'a', other: 'b' }, 3)).toBe('b');
    expect(selectTemplate('en', 'plain', 5)).toBe('plain');
  });
});

describe('interpolate', () => {
  it('replaces known placeholders and leaves unknown ones', () => {
    expect(interpolate('{a} and {b}', { a: 'x' })).toBe('x and {b}');
  });

  it('never resolves inherited object keys', () => {
    expect(interpolate('{toString}', {})).toBe('{toString}');
  });
});

describe('formatMessage', () => {
  it('formats numbers for the locale and selects plurals by count', () => {
    expect(
      formatMessage('en', { one: '{count} post', other: '{count} posts' }, { count: 1200 }),
    ).toBe('1,200 posts');
    expect(formatMessage('de', '{n} Leser', { n: 1200 })).toBe('1.200 Leser');
  });

  it('ignores a non-numeric count for plural selection', () => {
    expect(formatMessage('en', { one: 'one', other: 'other {count}' }, { count: 'x' })).toBe(
      'other x',
    );
  });

  it('formats without parameters', () => {
    expect(formatMessage('en', 'plain')).toBe('plain');
    expect(formatNumber('en', 1234.6)).toBe('1,235');
  });
});
