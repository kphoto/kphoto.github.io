import { describe, expect, it } from 'vitest';
import { escapeAttribute, escapeHtml } from './html';

describe('escapeHtml', () => {
  it('escapes every HTML special character', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('Good morning!')).toBe('Good morning!');
  });
});

describe('escapeAttribute', () => {
  it('is safe inside double-quoted attributes', () => {
    expect(escapeAttribute('a"b&c<d')).toBe('a&quot;b&amp;c&lt;d');
  });
});
