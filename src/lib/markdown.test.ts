import { describe, expect, it } from 'vitest';
import { renderMarkdown, sanitizeUrl } from './markdown';

describe('sanitizeUrl', () => {
  it('allows http, https, mailto and relative URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('mailto:hi@example.com')).toBe('mailto:hi@example.com');
    expect(sanitizeUrl('/blog/2026-03-22-good-morning/')).toBe('/blog/2026-03-22-good-morning/');
    expect(sanitizeUrl('#section')).toBe('#section');
    expect(sanitizeUrl('images/pic.png')).toBe('images/pic.png');
  });

  it('collapses dangerous schemes to #', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('#');
    expect(sanitizeUrl(' javascript:alert(1)')).toBe('#');
    expect(sanitizeUrl('data:text/html,x')).toBe('#');
    expect(sanitizeUrl('vbscript:x')).toBe('#');
  });
});

describe('renderMarkdown', () => {
  it('renders paragraphs, joining wrapped lines with a space', () => {
    expect(renderMarkdown('It is almost eleven.\nHope you are doing well.').html).toBe(
      '<p>It is almost eleven. Hope you are doing well.</p>',
    );
  });

  it('renders ATX headings with generated ids', () => {
    const { html, headings } = renderMarkdown('## Good morning');
    expect(html).toBe('<h2 id="good-morning">Good morning</h2>');
    expect(headings).toEqual([{ level: 2, text: 'Good morning', id: 'good-morning' }]);
  });

  it('de-duplicates repeated heading ids', () => {
    const { html } = renderMarkdown('## Same\n\n## Same');
    expect(html).toContain('id="same"');
    expect(html).toContain('id="same-2"');
  });

  it('renders emphasis, strong and inline code', () => {
    expect(renderMarkdown('*em* **strong** `code`').html).toBe(
      '<p><em>em</em> <strong>strong</strong> <code>code</code></p>',
    );
  });

  it('does not format inside code spans', () => {
    expect(renderMarkdown('`**not bold**`').html).toBe('<p><code>**not bold**</code></p>');
  });

  it('renders links with sanitised URLs', () => {
    expect(renderMarkdown('[hi](/about/)').html).toBe('<p><a href="/about/">hi</a></p>');
    expect(renderMarkdown('[bad](javascript:alert(1))').html).toBe('<p><a href="#">bad</a></p>');
  });

  it('renders images with alt text', () => {
    expect(renderMarkdown('![an avatar](/images/a.svg)').html).toBe(
      '<p><img src="/images/a.svg" alt="an avatar" loading="lazy" /></p>',
    );
  });

  it('escapes raw HTML instead of passing it through', () => {
    expect(renderMarkdown('<script>alert(1)</script>').html).toBe(
      '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>',
    );
  });

  it('escapes HTML inside emphasis and link text', () => {
    expect(renderMarkdown('**<b>x</b>**').html).toBe(
      '<p><strong>&lt;b&gt;x&lt;/b&gt;</strong></p>',
    );
  });

  it('renders fenced code blocks verbatim and escaped', () => {
    const { html } = renderMarkdown('```ts\nconst a: string = "<hi>";\n```');
    expect(html).toBe(
      '<pre><code class="language-ts">const a: string = &quot;&lt;hi&gt;&quot;;</code></pre>',
    );
  });

  it('does not treat markdown inside fences as markup', () => {
    const { html } = renderMarkdown('```\n## not a heading\n```');
    expect(html).toBe('<pre><code>## not a heading</code></pre>');
  });

  it('renders blockquotes, including nested ones', () => {
    expect(renderMarkdown('> outer\n> > inner').html).toBe(
      '<blockquote><p>outer</p>\n<blockquote><p>inner</p></blockquote></blockquote>',
    );
  });

  it('renders unordered lists', () => {
    expect(renderMarkdown('- one\n- two').html).toBe('<ul><li>one</li><li>two</li></ul>');
  });

  it('renders ordered lists', () => {
    expect(renderMarkdown('1. one\n2. two').html).toBe('<ol><li>one</li><li>two</li></ol>');
  });

  it('renders nested lists', () => {
    expect(renderMarkdown('- one\n  - inner\n- two').html).toBe(
      '<ul><li>one<ul><li>inner</li></ul></li><li>two</li></ul>',
    );
  });

  it('renders horizontal rules', () => {
    expect(renderMarkdown('above\n\n---\n\nbelow').html).toBe('<p>above</p>\n<hr />\n<p>below</p>');
  });

  it('renders a realistic post body end to end', () => {
    const body = [
      '## Good morning',
      '',
      'It is almost eleven in the morning eastern time as I type this.',
      'Hope you are doing well.',
    ].join('\n');
    expect(renderMarkdown(body).html).toBe(
      '<h2 id="good-morning">Good morning</h2>\n' +
        '<p>It is almost eleven in the morning eastern time as I type this. Hope you are doing well.</p>',
    );
  });
});
