import { describe, expect, it } from 'vitest';
import { loadSiteModel } from '../lib/content';
import { postFile } from '../lib/testFixtures';
import { outputFileFor, renderSite, siteConfig, type PageContext } from './routes';

const context: PageContext = {
  config: siteConfig,
  assets: { scriptSrc: '/assets/main-TEST.js', styleHref: '/assets/styles-TEST.css' },
  buildYear: 2026,
};

const model = loadSiteModel({
  blog: {
    '2026-03-22-good-morning.md': postFile(
      [
        'title: Good morning!',
        'date: 2026-03-22',
        'author: kphoto-team',
        'summary: In which I say Good morning to you',
        'tags:',
        '  - introductions',
      ].join('\n'),
      '\n## Good morning\n\nHope you are doing well.\n',
    ),
    '2026-05-05-one.md': postFile(
      [
        'title: One',
        'date: 2026-05-05',
        'author: casey-rivers',
        'summary: First.',
        'tags:',
        '  - typescript',
        'series: TS7 in Practice',
        'episode: 1',
      ].join('\n'),
    ),
    '2026-05-12-two.md': postFile(
      [
        'title: Two',
        'date: 2026-05-12',
        'author: kphoto-team',
        'summary: Second.',
        'tags:',
        '  - typescript',
        'series: TS7 in Practice',
        'episode: 2',
      ].join('\n'),
    ),
  },
  authors: {
    'kphoto-team.yml': 'name: kphoto team',
    'casey-rivers.yml': 'name: Casey Rivers',
  },
  pages: {
    'about.md': postFile('title: About', '\nHello about.\n'),
    'contact.md': postFile('title: Contact', '\nHello contact.\n'),
  },
});

const files = renderSite(model, context);
const paths = files.map((file) => file.path);
const byPath = new Map(files.map((file) => [file.path, file]));

describe('renderSite', () => {
  it('renders every expected route exactly once', () => {
    expect(paths.sort()).toEqual(
      [
        '/',
        '/blog/',
        '/blog/2026-03-22-good-morning/',
        '/blog/2026-05-05-one/',
        '/blog/2026-05-12-two/',
        '/tags/',
        '/tags/introductions/',
        '/tags/typescript/',
        '/series/',
        '/series/ts7-in-practice/',
        '/authors/',
        '/authors/kphoto-team/',
        '/authors/casey-rivers/',
        '/about/',
        '/contact/',
        '/404.html',
        '/feed.xml',
        '/sitemap.xml',
      ].sort(),
    );
  });

  it('marks XML outputs with the XML content type', () => {
    expect(byPath.get('/feed.xml')?.contentType).toBe('application/xml');
    expect(byPath.get('/sitemap.xml')?.contentType).toBe('application/xml');
    expect(byPath.get('/')?.contentType).toBe('text/html');
  });

  it('gives every HTML page the full document shell', () => {
    for (const file of files.filter((candidate) => candidate.contentType === 'text/html')) {
      expect(file.body.startsWith('<!doctype html>')).toBe(true);
      expect(file.body).toContain('<a class="skip-link" href="#main">');
      expect(file.body).toContain('<kp-header>');
      expect(file.body).toContain('<main id="main" tabindex="-1">');
      expect(file.body).toContain('<kp-footer>');
      expect(file.body).toContain('src="/assets/main-TEST.js"');
      expect(file.body).toContain('href="/assets/styles-TEST.css"');
      expect(file.body).toContain('data-theme="light"');
      expect(file.body).toContain('localStorage.getItem');
    }
  });

  it('renders canonical URLs per page', () => {
    expect(byPath.get('/about/')?.body).toContain(
      `<link rel="canonical" href="${siteConfig.url}/about/" />`,
    );
  });

  it('shows the latest posts on the home page, newest first', () => {
    const home = byPath.get('/')?.body ?? '';
    expect(home).toContain('hero-frontmatter');
    const two = home.indexOf('/blog/2026-05-12-two/');
    const morning = home.indexOf('/blog/2026-03-22-good-morning/');
    expect(two).toBeGreaterThan(-1);
    expect(morning).toBeGreaterThan(two);
  });

  it('orders a tag page newest first', () => {
    const tag = byPath.get('/tags/typescript/')?.body ?? '';
    expect(tag.indexOf('2026-05-12-two')).toBeLessThan(tag.indexOf('2026-05-05-one'));
  });

  it('orders a series page by episode ascending', () => {
    const series = byPath.get('/series/ts7-in-practice/')?.body ?? '';
    expect(series.indexOf('2026-05-05-one')).toBeLessThan(series.indexOf('2026-05-12-two'));
  });

  it('renders series navigation on posts in a series', () => {
    const one = byPath.get('/blog/2026-05-05-one/')?.body ?? '';
    expect(one).toContain('Part 1 of 2');
    expect(one).toContain('rel="next"');
    const loner = byPath.get('/blog/2026-03-22-good-morning/')?.body ?? '';
    expect(loner).not.toContain('<kp-series-nav>');
  });

  it('renders the markdown body and author card on a post page', () => {
    const post = byPath.get('/blog/2026-03-22-good-morning/')?.body ?? '';
    expect(post).toContain('<h2 id="good-morning">Good morning</h2>');
    expect(post).toContain('Written by');
    expect(post).toContain('href="/authors/kphoto-team/"');
  });

  it('lists authors with their post counts', () => {
    const authors = byPath.get('/authors/')?.body ?? '';
    expect(authors).toContain('kphoto team');
    expect(authors).toContain('Casey Rivers');
    const casey = byPath.get('/authors/casey-rivers/')?.body ?? '';
    expect(casey).toContain('2026-05-05-one');
    expect(casey).not.toContain('2026-05-12-two');
  });

  it('explains dated URLs on the 404 page', () => {
    expect(byPath.get('/404.html')?.body).toContain('/blog/2026-03-22-good-morning/');
  });

  it('includes every HTML page in the sitemap but not the 404 or feeds', () => {
    const sitemap = byPath.get('/sitemap.xml')?.body ?? '';
    expect(sitemap).toContain(`<loc>${siteConfig.url}/about/</loc>`);
    expect(sitemap).not.toContain('404.html');
    expect(sitemap).not.toContain('feed.xml');
    expect(sitemap).toContain('<lastmod>2026-05-12T00:00:00Z</lastmod>');
  });
});

describe('outputFileFor', () => {
  it('maps trailing-slash routes to index.html files', () => {
    expect(outputFileFor('/')).toBe('index.html');
    expect(outputFileFor('/blog/2026-03-22-good-morning/')).toBe(
      'blog/2026-03-22-good-morning/index.html',
    );
  });

  it('keeps top-level files as-is', () => {
    expect(outputFileFor('/404.html')).toBe('404.html');
    expect(outputFileFor('/feed.xml')).toBe('feed.xml');
  });
});
