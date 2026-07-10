import { describe, expect, it } from 'vitest';
import { extractFrontmatter } from './frontmatter';

describe('extractFrontmatter', () => {
  it('splits data from body', () => {
    const { data, body } = extractFrontmatter('---\ntitle: Hi\n---\n\n## Heading\n\nText.\n');
    expect(data).toEqual({ title: 'Hi' });
    expect(body).toBe('\n## Heading\n\nText.\n');
  });

  it('requires the opening fence on the first line', () => {
    expect(() => extractFrontmatter('\n---\ntitle: Hi\n---\nbody')).toThrow(/must start/i);
  });

  it('requires a closing fence', () => {
    expect(() => extractFrontmatter('---\ntitle: Hi\nbody')).toThrow(/closing/i);
  });

  it('handles an empty body', () => {
    const { body } = extractFrontmatter('---\ntitle: Hi\n---');
    expect(body).toBe('');
  });
});
