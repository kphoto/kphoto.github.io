import { describe, expect, it } from 'vitest';
import { readingMinutes } from './readingTime';

describe('readingMinutes', () => {
  it('never reports less than one minute', () => {
    expect(readingMinutes('short')).toBe(1);
    expect(readingMinutes('')).toBe(1);
  });

  it('rounds up at 220 words per minute', () => {
    expect(readingMinutes(Array.from({ length: 220 }, () => 'word').join(' '))).toBe(1);
    expect(readingMinutes(Array.from({ length: 221 }, () => 'word').join(' '))).toBe(2);
    expect(readingMinutes(Array.from({ length: 660 }, () => 'word').join(' '))).toBe(3);
  });

  it('ignores whitespace runs', () => {
    expect(readingMinutes('a   b\n\nc\t d')).toBe(1);
  });
});
