import { describe, expect, it } from 'vitest';
import { siteConfig } from '../lib/config.ts';
import { loadSiteModel } from '../lib/content.ts';
import { postFile } from '../lib/testFixtures.ts';
import { outputFileFor, renderSite } from './routes.ts';
import { makeSiteContext, withLiveStats } from './testContext.ts';

const singleLocale = {
  ...siteConfig,
  locales: [{ code: 'en', name: 'English', dir: 'ltr' as const }],
};
const context = makeSiteContext({ config: singleLocale });

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
        '/live/',
        '/404.html',
        '/feed.xml',
        '/sitemap.xml',
      ].sort(),
    );
  });

  it('declares no language alternates on a single-locale site', () => {
    expect(byPath.get('/')?.body).not.toContain('hreflang');
    expect(byPath.get('/')?.body).toContain('<html lang="en" dir="ltr"');
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

describe('the /live/ page', () => {
  const withKey = (publishableKey: string) =>
    makeSiteContext({
      config: { ...withLiveStats(publishableKey), locales: singleLocale.locales },
    });
  const on = renderSite(model, withKey('sb_publishable_test')).find((f) => f.path === '/live/');
  const off = renderSite(model, withKey('')).find((f) => f.path === '/live/');

  it('is in the sitemap either way', () => {
    expect(byPath.get('/sitemap.xml')?.body).toContain(`<loc>${siteConfig.url}/live/</loc>`);
  });

  it('shows the board and a noscript note when switched on', () => {
    expect(on?.body).toContain('<kp-live-board ');
    expect(on?.body).toContain('<noscript>');
    expect(on?.body).toContain('<h1>Live statistics</h1>');
  });

  it('says plainly that live statistics are off otherwise', () => {
    expect(off?.body).not.toContain('<kp-live-board');
    expect(off?.body).toContain('switched off in this build');
  });

  it('explains what is and is not collected', () => {
    for (const body of [on?.body, off?.body]) {
      expect(body).toContain('What is collected');
      expect(body).toContain('No IP address');
      expect(body).toContain('Global Privacy Control');
      expect(body).toContain('deleted after 25 hours');
    }
  });

  it('puts the live line in every footer only when switched on', () => {
    const pages = renderSite(model, withKey('sb_publishable_test'));
    const about = pages.find((f) => f.path === '/about/')?.body ?? '';
    expect(about).toContain('data-path="/about/"');
    const missing = renderSite(model, withKey('')).find((f) => f.path === '/about/')?.body ?? '';
    expect(missing).not.toContain('kp-live-stats');
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

describe('renderSite with a second locale', () => {
  const bilingual = loadSiteModel(
    {
      blog: {
        '2026-03-22-good-morning.md': postFile(
          'title: Good morning!\ndate: 2026-03-22\nauthor: kphoto-team\nsummary: Hi\ntags:\n  - introductions',
        ),
        '2026-03-22-good-morning.es.md': postFile('title: ¡Buenos días!\nsummary: Hola'),
        '2026-04-01-later.md': postFile(
          'title: Later\ndate: 2026-04-01\nauthor: kphoto-team\nsummary: Later\ntags:\n  - introductions',
        ),
      },
      authors: { 'kphoto-team.yml': 'name: kphoto team' },
      pages: {
        'about.md': postFile('title: About'),
        'about.es.md': postFile('title: Acerca de'),
        'contact.md': postFile('title: Contact'),
      },
    },
    undefined,
    { defaultLocale: 'en', locales: ['en', 'es'] },
  );
  const rendered = renderSite(bilingual, makeSiteContext());
  const at = new Map(rendered.map((file) => [file.path, file]));

  it('mirrors every section under the locale prefix', () => {
    for (const path of [
      '/es/',
      '/es/blog/',
      '/es/tags/',
      '/es/series/',
      '/es/authors/',
      '/es/live/',
    ]) {
      expect(at.has(path)).toBe(true);
    }
    expect(at.has('/es/feed.xml')).toBe(true);
  });

  it('renders only translated posts and pages in the second locale', () => {
    expect(at.has('/es/blog/2026-03-22-good-morning/')).toBe(true);
    expect(at.has('/es/blog/2026-04-01-later/')).toBe(false);
    expect(at.has('/es/about/')).toBe(true);
    expect(at.has('/es/contact/')).toBe(false);
  });

  it('keeps one 404 page and one sitemap', () => {
    expect(rendered.filter((file) => file.path.endsWith('404.html'))).toHaveLength(1);
    expect(rendered.filter((file) => file.path.endsWith('sitemap.xml'))).toHaveLength(1);
  });

  it('sets the document language and links alternates both ways', () => {
    const spanish = at.get('/es/blog/2026-03-22-good-morning/')?.body ?? '';
    expect(spanish).toContain('<html lang="es" dir="ltr"');
    expect(spanish).toContain('<h1>¡Buenos días!</h1>');
    expect(spanish).toContain(
      `<link rel="alternate" hreflang="en" href="${siteConfig.url}/blog/2026-03-22-good-morning/" />`,
    );
    expect(spanish).toContain('hreflang="x-default"');
    const english = at.get('/blog/2026-03-22-good-morning/')?.body ?? '';
    expect(english).toContain(
      `<link rel="alternate" hreflang="es" href="${siteConfig.url}/es/blog/2026-03-22-good-morning/" />`,
    );
    expect(at.get('/blog/2026-04-01-later/')?.body).not.toContain('hreflang="es"');
  });

  it('lists untranslated posts in the second locale, linking to the original', () => {
    const blog = at.get('/es/blog/')?.body ?? '';
    expect(blog).toContain('href="/blog/2026-04-01-later/" hreflang="en"');
    expect(blog).toContain('href="/es/blog/2026-03-22-good-morning/"');
  });

  it('puts language alternates in the sitemap', () => {
    expect(at.get('/sitemap.xml')?.body).toContain(
      `<xhtml:link rel="alternate" hreflang="es" href="${siteConfig.url}/es/about/" />`,
    );
  });
});
