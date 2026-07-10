import { compareIsoDatesDesc } from './dates';
import { slugify } from './slug';
import type { Post, SeriesCollection, TagCollection } from './types';

/** Sorts posts newest first; same-day posts sort by slug for determinism. */
export function sortPostsByDateDesc(posts: readonly Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const byDate = compareIsoDatesDesc(a.date, b.date);
    return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
  });
}

export function latestPosts(posts: readonly Post[], count: number): Post[] {
  return sortPostsByDateDesc(posts).slice(0, count);
}

/** Groups posts by tag slug; tags sort alphabetically, posts newest first. */
export function groupPostsByTag(posts: readonly Post[]): Map<string, TagCollection> {
  const groups = new Map<string, { name: string; slug: string; posts: Post[] }>();
  for (const post of sortPostsByDateDesc(posts)) {
    for (const tag of post.tags) {
      const slug = slugify(tag);
      const group = groups.get(slug) ?? { name: tag, slug, posts: [] };
      group.posts.push(post);
      groups.set(slug, group);
    }
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

/** Groups posts by series slug; series sort alphabetically, posts by episode. */
export function groupPostsBySeries(posts: readonly Post[]): Map<string, SeriesCollection> {
  const groups = new Map<string, { name: string; slug: string; posts: Post[] }>();
  for (const post of posts) {
    if (!post.series) {
      continue;
    }
    const { name, slug } = post.series;
    const group = groups.get(slug) ?? { name, slug, posts: [] };
    group.posts.push(post);
    groups.set(slug, group);
  }
  for (const group of groups.values()) {
    group.posts.sort((a, b) => (a.series?.episode ?? 0) - (b.series?.episode ?? 0));
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

/** Groups posts by author id, newest first, keeping every known author. */
export function groupPostsByAuthor(
  posts: readonly Post[],
  authorIds: Iterable<string>,
): Map<string, readonly Post[]> {
  const groups = new Map<string, Post[]>();
  for (const id of authorIds) {
    groups.set(id, []);
  }
  for (const post of sortPostsByDateDesc(posts)) {
    const group = groups.get(post.author);
    if (group) {
      group.push(post);
    }
  }
  return groups;
}
