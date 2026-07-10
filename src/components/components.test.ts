import { describe, expect, it } from 'vitest';
import { makeAuthor, makePost } from '../lib/testFixtures';
import { renderAuthorCard } from './authorCard';
import { renderPostCard } from './postCard';
import { renderPostMeta } from './postMeta';
import { renderSeriesNav } from './seriesNav';
import { NAV_ITEMS, renderSiteHeader } from './siteHeader';
import { renderSiteFooter } from './siteFooter';
import { renderThemePicker } from './themePicker';
import { siteConfig } from '../lib/config';
import { THEMES } from '../client/storage';

describe('declarative shadow DOM contract', () => {
  const post = makePost({ slug: '2026-03-22-good-morning', date: '2026-03-22' });
  const renders: [string, string][] = [
    ['kp-theme-picker', renderThemePicker()],
    ['kp-header', renderSiteHeader('/blog/')],
    ['kp-footer', renderSiteFooter(siteConfig, 2026)],
    ['kp-post-card', renderPostCard(post)],
    ['kp-post-meta', renderPostMeta(post, makeAuthor({ id: 'kphoto-team' }))],
    ['kp-author-card', renderAuthorCard(makeAuthor({ id: 'kphoto-team', name: 'kphoto team' }), 2)],
  ];

  it.each(renders)('%s ships an open shadow root with scoped styles', (tag, html) => {
    expect(html).toContain(`<${tag}>`);
    expect(html).toContain('<template shadowrootmode="open">');
    expect(html).toContain('<style>');
    expect(html).toContain(`</${tag}>`);
  });
});

describe('renderThemePicker', () => {
  it('offers every theme with an accessible label', () => {
    const html = renderThemePicker();
    for (const theme of THEMES) {
      expect(html).toContain(`value="${theme}"`);
    }
    expect(html).toContain('<label class="visually-hidden" for="theme-select">Theme</label>');
  });
});

describe('renderSiteHeader', () => {
  it('links every section', () => {
    const html = renderSiteHeader('/');
    for (const item of NAV_ITEMS) {
      expect(html).toContain(`href="${item.href}"`);
    }
  });

  it('marks the current section, including nested paths', () => {
    expect(renderSiteHeader('/blog/2026-03-22-good-morning/')).toContain(
      '<a href="/blog/" aria-current="page">Blog</a>',
    );
    expect(renderSiteHeader('/tags/css/')).toContain(
      '<a href="/tags/" aria-current="page">Tags</a>',
    );
    expect(renderSiteHeader('/')).not.toContain('aria-current="page">Blog');
  });
});

describe('renderSiteFooter', () => {
  const html = renderSiteFooter(siteConfig, 2026);

  it('highlights the GitHub repository', () => {
    expect(html).toContain(`href="${siteConfig.repoUrl}"`);
    expect(html).toContain('on GitHub');
  });

  it('states the license, the AI disclosure and the feed', () => {
    expect(html).toContain('AGPL-3.0-or-later');
    expect(html).toContain('AI/LLM assistance');
    expect(html).toContain('href="/feed.xml"');
    expect(html).toContain('© 2026');
  });
});

describe('renderPostCard', () => {
  const post = makePost({
    slug: '2026-05-05-one',
    date: '2026-05-05',
    title: 'Building <fast>',
    summary: 'A & B',
    tags: ['Type Script'],
    series: { name: 'TS7', slug: 'ts7', episode: 2 },
    readingMinutes: 3,
  });
  const html = renderPostCard(post, 3);

  it('links the post and escapes user text', () => {
    expect(html).toContain('href="/blog/2026-05-05-one/"');
    expect(html).toContain('Building &lt;fast&gt;');
    expect(html).toContain('A &amp; B');
    expect(html).toContain('<h3>');
  });

  it('shows the machine line: date, series episode, reading time', () => {
    expect(html).toContain('datetime="2026-05-05"');
    expect(html).toContain('href="/series/ts7/"');
    expect(html).toContain('ep 2');
    expect(html).toContain('3 min read');
  });

  it('links each tag by slug while showing the display name', () => {
    expect(html).toContain('href="/tags/type-script/"');
    expect(html).toContain('>Type Script</a>');
  });
});

describe('renderPostMeta', () => {
  it('falls back to the raw author id when the author is unknown', () => {
    const post = makePost({ slug: '2026-03-22-a', date: '2026-03-22', author: 'ghost' });
    expect(renderPostMeta(post, undefined)).toContain('ghost');
  });
});

describe('renderSeriesNav', () => {
  const one = makePost({
    slug: '2026-05-05-one',
    date: '2026-05-05',
    title: 'One',
    series: { name: 'TS7', slug: 'ts7', episode: 1 },
  });
  const two = makePost({
    slug: '2026-05-12-two',
    date: '2026-05-12',
    title: 'Two',
    series: { name: 'TS7', slug: 'ts7', episode: 2 },
  });
  const three = makePost({
    slug: '2026-05-19-three',
    date: '2026-05-19',
    title: 'Three',
    series: { name: 'TS7', slug: 'ts7', episode: 3 },
  });
  const series = { name: 'TS7', slug: 'ts7', posts: [one, two, three] };

  it('shows position and both neighbours for a middle episode', () => {
    const html = renderSeriesNav(two, series);
    expect(html).toContain('Part 2 of 3');
    expect(html).toContain('rel="prev"');
    expect(html).toContain('href="/blog/2026-05-05-one/"');
    expect(html).toContain('rel="next"');
    expect(html).toContain('href="/blog/2026-05-19-three/"');
  });

  it('omits the missing neighbour at the edges', () => {
    expect(renderSeriesNav(one, series)).not.toContain('rel="prev"');
    expect(renderSeriesNav(three, series)).not.toContain('rel="next"');
  });

  it('renders nothing for a post without series membership', () => {
    const loner = makePost({ slug: '2026-06-01-x', date: '2026-06-01' });
    expect(renderSeriesNav(loner, series)).toBe('');
  });
});

describe('renderAuthorCard', () => {
  it('renders avatar, bio, mailto and social links', () => {
    const html = renderAuthorCard(
      makeAuthor({
        id: 'casey-rivers',
        name: 'Casey Rivers',
        email: 'casey@example.com',
        bio: 'Writes about CSS.',
        avatar: 'images/authors/casey-rivers.svg',
        socials: { github: 'casey-rivers-kphoto' },
      }),
      4,
      1,
    );
    expect(html).toContain('src="/images/authors/casey-rivers.svg"');
    expect(html).toContain('href="/authors/casey-rivers/"');
    expect(html).toContain('mailto:casey@example.com');
    expect(html).toContain('https://github.com/casey-rivers-kphoto');
    expect(html).toContain('4 posts');
    expect(html).toContain('<h1>');
  });

  it('uses singular wording for one post', () => {
    expect(renderAuthorCard(makeAuthor({ id: 'a' }), 1)).toContain('1 post');
  });
});
