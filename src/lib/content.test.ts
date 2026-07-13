import { describe, expect, it } from 'vitest';
import {
  ContentValidationError,
  loadSiteModel,
  parseAuthor,
  parseMarkdownPage,
  parsePost,
} from './content';
import { postFile } from './testFixtures';

const GOOD_POST = postFile(
  [
    'title: Good morning!',
    'date: 2026-03-22',
    'author: kphoto-team',
    'summary: In which I say Good morning to you',
    'tags:',
    '  - introductions',
  ].join('\n'),
  '\n## Good morning\n\nHope you are doing well.\n',
);

const GOOD_AUTHOR = 'name: kphoto team\n';

describe('parsePost', () => {
  it('parses the canonical example post', () => {
    const post = parsePost('2026-03-22-good-morning.md', GOOD_POST);
    expect(post.slug).toBe('2026-03-22-good-morning');
    expect(post.url).toBe('/blog/2026-03-22-good-morning/');
    expect(post.title).toBe('Good morning!');
    expect(post.date).toBe('2026-03-22');
    expect(post.author).toBe('kphoto-team');
    expect(post.tags).toEqual(['introductions']);
    expect(post.series).toBeUndefined();
    expect(post.html).toContain('<h2 id="good-morning">Good morning</h2>');
    expect(post.readingMinutes).toBe(1);
  });

  it('parses series membership', () => {
    const post = parsePost(
      '2026-05-05-one.md',
      postFile(
        [
          'title: One',
          'date: 2026-05-05',
          'author: kphoto-team',
          'summary: s',
          'tags:',
          '  - typescript',
          'series: TypeScript 7 in Practice',
          'episode: 1',
        ].join('\n'),
      ),
    );
    expect(post.series).toEqual({
      name: 'TypeScript 7 in Practice',
      slug: 'typescript-7-in-practice',
      episode: 1,
    });
  });

  it('rejects file names without a date stamp', () => {
    expect(() => parsePost('good-morning.md', GOOD_POST)).toThrow(/YYYY-MM-DD/);
  });

  it('rejects file names with an impossible date', () => {
    expect(() => parsePost('2026-02-30-bad.md', GOOD_POST)).toThrow(/calendar/);
  });

  it('rejects a frontmatter date that disagrees with the file name', () => {
    expect(() => parsePost('2026-03-23-good-morning.md', GOOD_POST)).toThrow(/match the file name/);
  });

  it('requires at least one tag', () => {
    const noTags = postFile(
      ['title: t', 'date: 2026-03-22', 'author: a', 'summary: s', 'tags:'].join('\n'),
    );
    expect(() => parsePost('2026-03-22-x.md', noTags)).toThrow(/tags/);
  });

  it('rejects an episode without a series', () => {
    const bad = postFile(
      [
        'title: t',
        'date: 2026-03-22',
        'author: a',
        'summary: s',
        'tags:',
        '  - x',
        'episode: 1',
      ].join('\n'),
    );
    expect(() => parsePost('2026-03-22-x.md', bad)).toThrow(/series/);
  });

  it('rejects a series without an integer episode of 1 or more', () => {
    for (const episode of ['episode: 0', 'episode: 1.5', 'episode: one', '']) {
      const bad = postFile(
        [
          'title: t',
          'date: 2026-03-22',
          'author: a',
          'summary: s',
          'tags:',
          '  - x',
          'series: S',
          episode,
        ]
          .filter((line) => line !== '')
          .join('\n'),
      );
      expect(() => parsePost('2026-03-22-x.md', bad)).toThrow(/episode/);
    }
  });

  it('rejects unknown frontmatter keys to catch typos', () => {
    const bad = postFile(
      [
        'title: t',
        'date: 2026-03-22',
        'author: a',
        'summary: s',
        'tags:',
        '  - x',
        'sereis: oops',
      ].join('\n'),
    );
    expect(() => parsePost('2026-03-22-x.md', bad)).toThrow(/unknown key "sereis"/);
  });
});

describe('parseAuthor', () => {
  it('derives the id from the file name', () => {
    expect(parseAuthor('kphoto-team.yml', GOOD_AUTHOR)).toEqual({
      id: 'kphoto-team',
      name: 'kphoto team',
    });
  });

  it('accepts .yaml as well as .yml', () => {
    expect(parseAuthor('casey-rivers.yaml', 'name: Casey').id).toBe('casey-rivers');
  });

  it('parses the optional fields', () => {
    const author = parseAuthor(
      'casey-rivers.yml',
      [
        'name: Casey Rivers',
        'email: casey@example.com',
        'bio: Writes about CSS.',
        'avatar: images/authors/casey-rivers.svg',
        'socials:',
        '  github: casey-rivers-kphoto',
      ].join('\n'),
    );
    expect(author.email).toBe('casey@example.com');
    expect(author.socials).toEqual({ github: 'casey-rivers-kphoto' });
  });

  it('requires a name', () => {
    expect(() => parseAuthor('x.yml', 'bio: hi')).toThrow(/name/);
  });

  it('rejects bad file names', () => {
    expect(() => parseAuthor('Casey Rivers.yml', GOOD_AUTHOR)).toThrow(/file names/);
  });
});

describe('parseMarkdownPage', () => {
  it('parses a page with only a title', () => {
    const page = parseMarkdownPage('about.md', postFile('title: About', '\nHello.\n'));
    expect(page.slug).toBe('about');
    expect(page.title).toBe('About');
    expect(page.html).toBe('<p>Hello.</p>');
  });

  it('rejects unknown keys', () => {
    expect(() => parseMarkdownPage('about.md', postFile('title: About\ndraft: true'))).toThrow(
      /unknown key/,
    );
  });
});

describe('loadSiteModel', () => {
  const input = {
    blog: { '2026-03-22-good-morning.md': GOOD_POST },
    authors: { 'kphoto-team.yml': GOOD_AUTHOR },
    pages: { 'about.md': postFile('title: About') },
  };

  it('builds a model from valid content', () => {
    const model = loadSiteModel(input);
    expect(model.posts).toHaveLength(1);
    expect(model.authors.get('kphoto-team')?.name).toBe('kphoto team');
    expect(model.tags.get('introductions')?.posts).toHaveLength(1);
    expect(model.pages.get('about')?.title).toBe('About');
    expect(model.postsByAuthor.get('kphoto-team')).toHaveLength(1);
  });

  it('reports an unknown author with the offending file', () => {
    const broken = { ...input, authors: {} };
    try {
      loadSiteModel(broken);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      const issues = (error as ContentValidationError).issues;
      expect(issues).toHaveLength(1);
      expect(issues[0]?.file).toBe('content/blog/2026-03-22-good-morning.md');
      expect(issues[0]?.message).toContain('unknown author "kphoto-team"');
    }
  });

  it('rejects duplicate episode numbers within a series', () => {
    const seriesPost = (day: string): string =>
      postFile(
        [
          'title: t',
          `date: 2026-05-${day}`,
          'author: kphoto-team',
          'summary: s',
          'tags:',
          '  - x',
          'series: S',
          'episode: 1',
        ].join('\n'),
      );
    const broken = {
      ...input,
      blog: { '2026-05-05-a.md': seriesPost('05'), '2026-05-12-b.md': seriesPost('12') },
    };
    expect(() => loadSiteModel(broken)).toThrow(/episode 1 of "S" is already taken/);
  });

  it('rejects conflicting spellings of the same series name', () => {
    const seriesPost = (day: string, name: string): string =>
      postFile(
        [
          'title: t',
          `date: 2026-05-${day}`,
          'author: kphoto-team',
          'summary: s',
          'tags:',
          '  - x',
          `series: ${name}`,
          `episode: ${day === '05' ? '1' : '2'}`,
        ].join('\n'),
      );
    const broken = {
      ...input,
      blog: {
        '2026-05-05-a.md': seriesPost('05', 'My Series'),
        '2026-05-12-b.md': seriesPost('12', 'my series'),
      },
    };
    expect(() => loadSiteModel(broken)).toThrow(/conflicts with earlier spelling/);
  });

  it('aggregates issues from many files instead of stopping at the first', () => {
    const broken = {
      blog: {
        '2026-03-22-a.md': 'no frontmatter at all',
        'bad-name.md': GOOD_POST,
      },
      authors: { 'kphoto-team.yml': 'bio: missing name' },
      pages: {},
    };
    try {
      loadSiteModel(broken);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      expect((error as ContentValidationError).issues.length).toBeGreaterThanOrEqual(3);
      expect((error as ContentValidationError).message).toContain(
        'content/authors/kphoto-team.yml',
      );
    }
  });

  it('allows two posts with the same title on different days', () => {
    const other = GOOD_POST.replace('date: 2026-03-22', 'date: 2026-04-01');
    const model = loadSiteModel({
      ...input,
      blog: {
        '2026-03-22-good-morning.md': GOOD_POST,
        '2026-04-01-good-morning.md': other,
      },
    });
    expect(model.posts.map((post) => post.url)).toEqual([
      '/blog/2026-04-01-good-morning/',
      '/blog/2026-03-22-good-morning/',
    ]);
  });
});

describe('loadSiteModel scheduled publishing (ADR 0021)', () => {
  const datedPost = (date: string, episode?: number): string =>
    postFile(
      [
        `title: Post of ${date}`,
        `date: ${date}`,
        'author: kphoto-team',
        'summary: s',
        'tags:',
        '  - fundamentals',
        ...(episode === undefined ? [] : ['series: Drip', `episode: ${String(episode)}`]),
      ].join('\n'),
    );

  const input = {
    blog: {
      '2026-07-12-yesterday.md': datedPost('2026-07-12', 1),
      '2026-07-13-today.md': datedPost('2026-07-13', 2),
      '2026-07-14-tomorrow.md': datedPost('2026-07-14', 3),
    },
    authors: { 'kphoto-team.yml': GOOD_AUTHOR },
    pages: {},
  };

  it('publishes posts dated on or before the cutoff and hides the rest everywhere', () => {
    const model = loadSiteModel(input, '2026-07-13');
    expect(model.posts.map((post) => post.date)).toEqual(['2026-07-13', '2026-07-12']);
    expect(model.tags.get('fundamentals')?.posts).toHaveLength(2);
    expect(model.series.get('drip')?.posts.map((post) => post.series?.episode)).toEqual([1, 2]);
    expect(model.postsByAuthor.get('kphoto-team')).toHaveLength(2);
  });

  it('includes everything when no cutoff is given (future preview)', () => {
    const model = loadSiteModel(input);
    expect(model.posts).toHaveLength(3);
  });

  it('still validates unpublished posts so a broken future post fails the build', () => {
    const broken = {
      ...input,
      blog: { ...input.blog, '2026-08-01-broken.md': 'no frontmatter at all' },
    };
    expect(() => loadSiteModel(broken, '2026-07-13')).toThrow(ContentValidationError);
  });

  it('still rejects series conflicts among unpublished posts', () => {
    const broken = {
      ...input,
      blog: { ...input.blog, '2026-08-02-duplicate.md': datedPost('2026-08-02', 3) },
    };
    expect(() => loadSiteModel(broken, '2026-07-13')).toThrow(/episode 3 of "Drip"/);
  });

  it('rejects a malformed cutoff date', () => {
    expect(() => loadSiteModel(input, 'someday')).toThrow(/valid YYYY-MM-DD/);
  });
});
