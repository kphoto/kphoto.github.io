import { describe, expect, it } from 'vitest';
import {
  ContentValidationError,
  loadSiteModel,
  parsePost,
  parsePostTranslation,
} from './content.ts';
import { postFile } from './testFixtures.ts';
import type { ContentInput } from './types.ts';

const bilingual = { defaultLocale: 'en', locales: ['en', 'es'] };

const englishPost = (narration?: string): string =>
  postFile(
    [
      'title: Clean hands',
      'date: 2026-10-08',
      'author: kphoto-team',
      'summary: Wash them.',
      'tags:',
      '  - food-safety',
      ...(narration === undefined ? [] : [`narration: ${narration}`]),
    ].join('\n'),
  );

const spanishPost = (narration?: string): string =>
  postFile(
    [
      'title: Manos limpias',
      'summary: Lávalas.',
      ...(narration === undefined ? [] : [`narration: ${narration}`]),
    ].join('\n'),
  );

const input = (overrides: Partial<ContentInput>): ContentInput => ({
  blog: {
    '2026-10-08-clean-hands.md': englishPost('clean-hands-en.wav'),
    '2026-10-08-clean-hands.es.md': spanishPost('clean-hands-es.wav'),
    '2026-10-09-quiet.md': englishPost().replace('2026-10-08', '2026-10-09'),
  },
  authors: { 'kphoto-team.yml': 'name: kphoto team\n' },
  pages: {},
  spoken: ['clean-hands-en.wav', 'clean-hands-es.wav'],
  ...overrides,
});

describe('narration frontmatter', () => {
  it('attaches a narration to a post', () => {
    const post = parsePost('2026-10-08-clean-hands.md', englishPost('clean-hands-en.wav'));
    expect(post.narration).toEqual({
      file: 'clean-hands-en.wav',
      src: '/spoken/clean-hands-en.wav',
      type: 'audio/wav',
    });
  });

  it('leaves a post without the key exactly as before', () => {
    const post = parsePost('2026-10-08-clean-hands.md', englishPost());
    expect(post).not.toHaveProperty('narration');
  });

  it('attaches a narration to a translation', () => {
    const { translation } = parsePostTranslation(
      '2026-10-08-clean-hands.es.md',
      spanishPost('clean-hands-es.wav'),
      bilingual,
    );
    expect(translation.narration?.src).toBe('/spoken/clean-hands-es.wav');
  });

  it('leaves a translation without the key exactly as before', () => {
    const { translation } = parsePostTranslation(
      '2026-10-08-clean-hands.es.md',
      spanishPost(),
      bilingual,
    );
    expect(translation).not.toHaveProperty('narration');
  });

  it('rejects an unsafe file name on a post', () => {
    expect(() =>
      parsePost('2026-10-08-clean-hands.md', englishPost('../secrets/clean-hands-en.wav')),
    ).toThrow(/"narration" must be a file name/);
  });

  it('rejects an unsupported file type on a translation', () => {
    expect(() =>
      parsePostTranslation('2026-10-08-clean-hands.es.md', spanishPost('x.aiff'), bilingual),
    ).toThrow(/"\.aiff" is not supported/);
  });
});

describe('narration in the site model', () => {
  it('keeps each language with its own recording and every other post silent', () => {
    const model = loadSiteModel(input({}), undefined, bilingual);
    const narrated = model.posts.find((post) => post.slug === '2026-10-08-clean-hands');
    const quiet = model.posts.find((post) => post.slug === '2026-10-09-quiet');
    expect(narrated?.narration?.src).toBe('/spoken/clean-hands-en.wav');
    expect(narrated?.translations.get('es')?.narration?.src).toBe('/spoken/clean-hands-es.wav');
    expect(quiet).not.toHaveProperty('narration');
  });

  it('ignores recordings no post names', () => {
    const model = loadSiteModel(
      input({ spoken: ['clean-hands-en.wav', 'clean-hands-es.wav', 'stray-en.wav'] }),
      undefined,
      bilingual,
    );
    expect(model.posts.filter((post) => post.narration)).toHaveLength(1);
  });

  it('fails the build, naming the post, when its recording is missing', () => {
    expect(() =>
      loadSiteModel(input({ spoken: ['clean-hands-es.wav'] }), undefined, bilingual),
    ).toThrow(
      'content/blog/2026-10-08-clean-hands.md: narration "clean-hands-en.wav" not found (expected public/spoken/clean-hands-en.wav)',
    );
  });

  it('fails the build, naming the translation, when its recording is missing', () => {
    expect(() =>
      loadSiteModel(input({ spoken: ['clean-hands-en.wav'] }), undefined, bilingual),
    ).toThrow(
      'content/blog/2026-10-08-clean-hands.es.md: narration "clean-hands-es.wav" not found (expected public/spoken/clean-hands-es.wav)',
    );
  });

  it('treats an absent recordings list as empty, reporting every narration', () => {
    const { blog, authors, pages } = input({});
    try {
      loadSiteModel({ blog, authors, pages }, undefined, bilingual);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      expect((error as ContentValidationError).issues.map((issue) => issue.file)).toEqual([
        'content/blog/2026-10-08-clean-hands.md',
        'content/blog/2026-10-08-clean-hands.es.md',
      ]);
    }
  });

  it('validates the recordings of posts that are not published yet', () => {
    expect(() =>
      loadSiteModel(input({ spoken: ['clean-hands-es.wav'] }), '2026-10-01', bilingual),
    ).toThrow(ContentValidationError);
  });
});
