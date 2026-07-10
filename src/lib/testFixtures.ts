import type { Author, Post } from './types';

/** Builds a minimal valid post for tests; override any field. */
export function makePost(overrides: Partial<Post> & Pick<Post, 'slug' | 'date'>): Post {
  const base: Post = {
    slug: overrides.slug,
    url: `/blog/${overrides.slug}/`,
    title: 'A post',
    date: overrides.date,
    author: 'kphoto-team',
    summary: 'A summary.',
    tags: ['site-notes'],
    html: '<p>Body.</p>',
    headings: [],
    readingMinutes: 1,
  };
  return { ...base, ...overrides };
}

export function makeAuthor(overrides: Partial<Author> & Pick<Author, 'id'>): Author {
  return { name: 'Someone', ...overrides };
}

/** A minimal valid post file body for content-parsing tests. */
export function postFile(frontmatter: string, body = '\nHello.\n'): string {
  return `---\n${frontmatter}\n---\n${body}`;
}
