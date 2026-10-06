import type { Author, Post } from './types.ts';

export function makePost(overrides: Partial<Post> & Pick<Post, 'slug' | 'date'>): Post {
  const base: Post = {
    slug: overrides.slug,
    url: `/blog/${overrides.slug}/`,
    language: 'en',
    title: 'A post',
    date: overrides.date,
    author: 'kphoto-team',
    summary: 'A summary.',
    tags: ['site-notes'],
    html: '<p>Body.</p>',
    headings: [],
    readingMinutes: 1,
    translations: new Map(),
  };
  return { ...base, ...overrides };
}

export function makeAuthor(overrides: Partial<Author> & Pick<Author, 'id'>): Author {
  return { name: 'Someone', ...overrides };
}

export function postFile(frontmatter: string, body = '\nHello.\n'): string {
  return `---\n${frontmatter}\n---\n${body}`;
}
