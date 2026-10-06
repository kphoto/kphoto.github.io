import { describe, expect, it } from 'vitest';
import { THEMES } from '../client/storage.ts';
import { postIn } from '../i18n/localizedContent.ts';
import { siteConfig } from '../lib/config.ts';
import { makeAuthor, makePost } from '../lib/testFixtures.ts';
import { makePageContext, TEST_COMMIT, withLiveStats } from '../pages/testContext.ts';
import { renderAuthorCard } from './authorCard.ts';
import { orderedAlternates, renderLanguageSwitcher } from './languageSwitcher.ts';
import { liveMessages, renderLiveBoard, renderLiveStats } from './liveStats.ts';
import { renderPostCard } from './postCard.ts';
import { renderPostMeta } from './postMeta.ts';
import { renderSeriesNav } from './seriesNav.ts';
import { NAV_KEYS, navItems, renderSiteHeader } from './siteHeader.ts';
import { renderBuildLine, renderSiteFooter } from './siteFooter.ts';
import { renderThemePicker } from './themePicker.ts';

const en = makePageContext('en');
const es = makePageContext('es');
const liveEn = makePageContext('en', { config: withLiveStats('sb_publishable_test"<key>') });
const liveEs = makePageContext('es', { config: withLiveStats('sb_publishable_test') });
const offEn = makePageContext('en', { config: withLiveStats('') });
const bothLocales = [
  { locale: 'es', path: '/es/' },
  { locale: 'en', path: '/' },
];

describe('declarative shadow DOM contract', () => {
  const post = makePost({ slug: '2026-03-22-good-morning', date: '2026-03-22' });
  const renders: [string, string][] = [
    ['kp-theme-picker', renderThemePicker(en.t)],
    ['kp-header', renderSiteHeader(en, '/blog/', bothLocales)],
    ['kp-language-switcher', renderLanguageSwitcher(en, bothLocales)],
    ['kp-footer', renderSiteFooter(en, '/')],
    ['kp-live-stats', renderLiveStats(liveEn, '/blog/')],
    ['kp-live-board', renderLiveBoard(liveEn)],
    ['kp-post-card', renderPostCard(postIn(post, 'en'), en)],
    ['kp-post-meta', renderPostMeta(postIn(post, 'en'), makeAuthor({ id: 'kphoto-team' }), en)],
    ['kp-author-card', renderAuthorCard(makeAuthor({ id: 'kphoto-team' }), 2, en)],
  ];

  it.each(renders)('%s ships an open shadow root with scoped styles', (tag, html) => {
    expect(html).toMatch(new RegExp(`<${tag}[ >]`));
    expect(html).toContain('<template shadowrootmode="open">');
    expect(html).toContain('<style>');
    expect(html).toContain(`</${tag}>`);
  });
});

describe('renderThemePicker', () => {
  it('offers every theme with an accessible label', () => {
    const html = renderThemePicker(en.t);
    for (const theme of THEMES) {
      expect(html).toContain(`value="${theme}"`);
    }
    expect(html).toContain('<label class="visually-hidden" for="theme-select">Theme</label>');
  });

  it('speaks the page language', () => {
    const html = renderThemePicker(es.t);
    expect(html).toContain('for="theme-select">Tema</label>');
    expect(html).toContain('>Oscuro</option>');
  });
});

describe('renderSiteHeader', () => {
  it('links every section', () => {
    const html = renderSiteHeader(en, '/', []);
    for (const item of navItems(en)) {
      expect(html).toContain(`href="${item.href}"`);
    }
    expect(navItems(en)).toHaveLength(NAV_KEYS.length);
  });

  it('marks the current section, including nested paths', () => {
    expect(renderSiteHeader(en, '/blog/2026-03-22-good-morning/', [])).toContain(
      '<a href="/blog/" aria-current="page">Blog</a>',
    );
    expect(renderSiteHeader(en, '/tags/css/', [])).toContain(
      '<a href="/tags/" aria-current="page">Tags</a>',
    );
    expect(renderSiteHeader(en, '/', [])).not.toContain('aria-current="page">Blog');
  });

  it('localizes sections and links pages that are not translated to the original', () => {
    const html = renderSiteHeader(es, '/es/blog/', []);
    expect(html).toContain('<a href="/es/blog/" aria-current="page">Blog</a>');
    expect(html).toContain('<a href="/es/tags/">Etiquetas</a>');
    expect(html).toContain('<a href="/about/">Acerca de</a>');
    expect(html).toContain('class="wordmark" href="/es/"');
    expect(html).toContain('aria-label="Principal"');
  });
});

describe('renderLanguageSwitcher', () => {
  it('lists alternates in configured order with endonyms and marks the current one', () => {
    const html = renderLanguageSwitcher(en, bothLocales);
    expect(html.indexOf('>English<')).toBeLessThan(html.indexOf('>Español<'));
    expect(html).toContain(
      '<a href="/" lang="en" hreflang="en" data-locale="en" aria-current="page">English</a>',
    );
    expect(html).toContain('aria-label="Language"');
  });

  it('ships a hidden suggestion written in the target language', () => {
    const html = renderLanguageSwitcher(en, bothLocales);
    expect(html).toContain('<p class="suggest" data-locale="es" hidden>');
    expect(html).toContain('Lee esta página en español');
    expect(html).not.toContain('data-locale="en" hidden');
  });

  it('renders nothing without a second language for this page', () => {
    expect(renderLanguageSwitcher(en, [{ locale: 'en', path: '/x/' }])).toBe('');
    const single = makePageContext('en', {
      config: { ...siteConfig, locales: [{ code: 'en', name: 'English', dir: 'ltr' }] },
    });
    expect(renderLanguageSwitcher(single, bothLocales)).toBe('');
  });

  it('drops alternates for locales the site does not build', () => {
    expect(orderedAlternates(en, [{ locale: 'fr', path: '/fr/' }, ...bothLocales])).toEqual([
      { locale: 'en', path: '/' },
      { locale: 'es', path: '/es/' },
    ]);
  });
});

describe('renderSiteFooter', () => {
  const html = renderSiteFooter(en, '/');

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

  it('links the exact commit the site was built from', () => {
    expect(html).toContain(
      `Built from <a class="commit" href="${siteConfig.repoUrl}/commit/${TEST_COMMIT}"><code>0123456</code></a>`,
    );
  });

  it('localizes the footer and its feed link', () => {
    const spanish = renderSiteFooter(es, '/es/');
    expect(spanish).toContain('href="/es/feed.xml"');
    expect(spanish).toContain('Compilado desde');
    expect(spanish).toContain('en GitHub');
  });
});

describe('renderBuildLine', () => {
  it('flags local changes', () => {
    const modified = makePageContext('en', { build: { commit: TEST_COMMIT, modified: true } });
    expect(renderBuildLine(modified)).toContain('(with local changes)');
  });

  it('is empty when the commit is unknown', () => {
    const unknown = makePageContext('en', { build: { commit: null, modified: false } });
    expect(renderBuildLine(unknown)).toBe('');
    expect(renderSiteFooter(unknown, '/')).not.toContain('class="commit"');
  });
});

describe('renderSiteFooter with live statistics', () => {
  it('carries the live line for the current page when switched on', () => {
    const html = renderSiteFooter(liveEn, '/blog/2026-03-22-good-morning/');
    expect(html).toContain('<kp-live-stats ');
    expect(html).toContain('data-path="/blog/2026-03-22-good-morning/"');
  });

  it('is unchanged when switched off', () => {
    expect(renderSiteFooter(offEn, '/')).not.toContain('kp-live-stats');
  });
});

describe('renderLiveStats', () => {
  const html = renderLiveStats(liveEn, '/tags/css/');

  it('passes connection details and messages as escaped data attributes', () => {
    expect(html).toContain('data-project-url="https://example-ref.supabase.co"');
    expect(html).toContain('data-publishable-key="sb_publishable_test&quot;&lt;key&gt;"');
    expect(html).toContain(`data-site-origin="${siteConfig.url}"`);
    expect(html).toContain('data-locale="en"');
    expect(html).toContain('data-path="/tags/css/"');
    expect(html).toContain('data-messages="{&quot;readers&quot;:');
  });

  it('hands the client the messages of the page language', () => {
    expect(liveMessages(liveEs).readers).toEqual({
      one: '{count} lector',
      other: '{count} lectores',
    });
    expect(renderLiveStats(liveEs, '/es/')).toContain('href="/es/live/"');
  });

  it('ships hidden, so a dead backend leaves no trace', () => {
    expect(html).toContain('<p hidden>');
    expect(html).toContain('[hidden] { display: none !important; }');
  });

  it('does not re-announce numbers to assistive technology', () => {
    expect(html).not.toContain('aria-live');
    expect(html).not.toContain('role="status"');
  });

  it('keeps its pulse behind the reduced-motion gate and links to /live/', () => {
    expect(html).toMatch(/@media \(prefers-reduced-motion: no-preference\)[^}]*animation/);
    expect(html).toContain('href="/live/"');
  });

  it('renders nothing when switched off', () => {
    expect(renderLiveStats(offEn, '/')).toBe('');
  });
});

describe('renderLiveBoard', () => {
  const html = renderLiveBoard(liveEn);

  it('starts in the connecting state with the board hidden', () => {
    expect(html).toContain('<p class="status" role="status">Connecting to live statistics…</p>');
    expect(html).toContain('<div class="board" hidden>');
  });

  it('labels the three totals with placeholders', () => {
    expect(html).toContain('<dt>Here right now</dt><dd>—</dd>');
    expect(html).toContain('<dt>Views, last hour</dt><dd>—</dd>');
    expect(html).toContain('<dt>Views, last 24 hours</dt><dd>—</dd>');
  });

  it('has an accessible table with column headers', () => {
    expect(html).toContain('<caption>Busiest pages</caption>');
    expect(html.match(/<th scope="col">/g)).toHaveLength(4);
  });

  it('is localized', () => {
    expect(renderLiveBoard(liveEs)).toContain('<caption>Páginas más visitadas</caption>');
  });

  it('renders nothing when switched off', () => {
    expect(renderLiveBoard(offEn)).toBe('');
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
  const html = renderPostCard(postIn(post, 'en'), en, 3);

  it('links the post and escapes user text', () => {
    expect(html).toContain('href="/blog/2026-05-05-one/"');
    expect(html).toContain('Building &lt;fast&gt;');
    expect(html).toContain('A &amp; B');
    expect(html).toContain('<h3>');
  });

  it('shows the machine line: date, series episode, reading time', () => {
    expect(html).toContain('datetime="2026-05-05"');
    expect(html).toContain('May 5, 2026');
    expect(html).toContain('href="/series/ts7/"');
    expect(html).toContain('ep 2');
    expect(html).toContain('3 min read');
  });

  it('links each tag by slug while showing the display name', () => {
    expect(html).toContain('href="/tags/type-script/"');
    expect(html).toContain('>Type Script</a>');
  });

  it('marks an untranslated post with its language and links the original', () => {
    const spanish = renderPostCard(postIn(post, 'es'), es, 2);
    expect(spanish).toContain('<span class="language">En inglés</span>');
    expect(spanish).toContain('<h2 lang="en"><a href="/blog/2026-05-05-one/" hreflang="en">');
    expect(spanish).toContain('<p class="summary" lang="en">');
    expect(spanish).toContain('href="/es/tags/type-script/"');
    expect(spanish).toContain('5 de mayo de 2026');
    expect(spanish).toContain('3 min de lectura');
  });

  it('uses the translation when there is one', () => {
    const translated = makePost({
      slug: '2026-05-05-one',
      date: '2026-05-05',
      translations: new Map([
        [
          'es',
          {
            locale: 'es',
            url: '/es/blog/2026-05-05-one/',
            title: 'Uno',
            summary: 'Primero.',
            html: '<p>Hola.</p>',
            headings: [],
            readingMinutes: 1,
          },
        ],
      ]),
    });
    const spanish = renderPostCard(postIn(translated, 'es'), es, 2);
    expect(spanish).toContain('<h2><a href="/es/blog/2026-05-05-one/">Uno</a></h2>');
    expect(spanish).not.toContain('class="language"');
  });
});

describe('renderPostMeta', () => {
  it('falls back to the raw author id when the author is unknown', () => {
    const post = makePost({ slug: '2026-03-22-a', date: '2026-03-22', author: 'ghost' });
    expect(renderPostMeta(postIn(post, 'en'), undefined, en)).toContain('ghost');
  });

  it('points a translation back to its original', () => {
    const post = makePost({
      slug: '2026-03-22-a',
      date: '2026-03-22',
      translations: new Map([
        [
          'es',
          {
            locale: 'es',
            url: '/es/blog/2026-03-22-a/',
            title: 'A',
            summary: 'S',
            html: '',
            headings: [],
            readingMinutes: 1,
          },
        ],
      ]),
    });
    const html = renderPostMeta(postIn(post, 'es'), makeAuthor({ id: 'kphoto-team' }), es);
    expect(html).toContain('Traducido del inglés.');
    expect(html).toContain('<a href="/blog/2026-03-22-a/" hreflang="en">Leer el original</a>');
    expect(html).toContain('href="/es/authors/kphoto-team/"');
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
    const html = renderSeriesNav(two, series, en);
    expect(html).toContain('Part 2 of 3');
    expect(html).toContain('rel="prev"');
    expect(html).toContain('href="/blog/2026-05-05-one/"');
    expect(html).toContain('rel="next"');
    expect(html).toContain('href="/blog/2026-05-19-three/"');
  });

  it('omits the missing neighbour at the edges', () => {
    expect(renderSeriesNav(one, series, en)).not.toContain('rel="prev"');
    expect(renderSeriesNav(three, series, en)).not.toContain('rel="next"');
  });

  it('localizes the position and marks untranslated neighbours', () => {
    const html = renderSeriesNav(two, series, es);
    expect(html).toContain('Parte 2 de 3 de <a href="/es/series/ts7/">TS7</a>');
    expect(html).toContain('<span lang="en">One</span>');
  });

  it('renders nothing for a post without series membership', () => {
    const loner = makePost({ slug: '2026-06-01-x', date: '2026-06-01' });
    expect(renderSeriesNav(loner, series, en)).toBe('');
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
      en,
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
    expect(renderAuthorCard(makeAuthor({ id: 'a' }), 1, en)).toContain('1 post');
    expect(renderAuthorCard(makeAuthor({ id: 'a' }), 1, es)).toContain('1 artículo');
  });
});
