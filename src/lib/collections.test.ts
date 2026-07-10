import { describe, expect, it } from 'vitest';
import {
  groupPostsByAuthor,
  groupPostsBySeries,
  groupPostsByTag,
  latestPosts,
  sortPostsByDateDesc,
} from './collections';
import { makePost } from './testFixtures';

const march = makePost({ slug: '2026-03-22-good-morning', date: '2026-03-22' });
const april = makePost({ slug: '2026-04-01-good-morning', date: '2026-04-01' });
const may = makePost({ slug: '2026-05-05-native', date: '2026-05-05', tags: ['typescript'] });

describe('sortPostsByDateDesc', () => {
  it('puts the newest post first', () => {
    expect(sortPostsByDateDesc([march, may, april]).map((post) => post.slug)).toEqual([
      '2026-05-05-native',
      '2026-04-01-good-morning',
      '2026-03-22-good-morning',
    ]);
  });

  it('breaks same-day ties by slug for a stable order', () => {
    const a = makePost({ slug: '2026-06-01-alpha', date: '2026-06-01' });
    const b = makePost({ slug: '2026-06-01-beta', date: '2026-06-01' });
    expect(sortPostsByDateDesc([b, a]).map((post) => post.slug)).toEqual([
      '2026-06-01-alpha',
      '2026-06-01-beta',
    ]);
  });

  it('does not mutate its input', () => {
    const input = [march, april];
    sortPostsByDateDesc(input);
    expect(input[0]?.slug).toBe('2026-03-22-good-morning');
  });
});

describe('latestPosts', () => {
  it('takes the newest N', () => {
    expect(latestPosts([march, april, may], 2).map((post) => post.slug)).toEqual([
      '2026-05-05-native',
      '2026-04-01-good-morning',
    ]);
  });
});

describe('groupPostsByTag', () => {
  it('sorts tags alphabetically and posts newest first', () => {
    const tagged = [
      makePost({ slug: '2026-01-01-a', date: '2026-01-01', tags: ['zeta', 'alpha'] }),
      makePost({ slug: '2026-02-01-b', date: '2026-02-01', tags: ['alpha'] }),
    ];
    const groups = groupPostsByTag(tagged);
    expect([...groups.keys()]).toEqual(['alpha', 'zeta']);
    expect(groups.get('alpha')?.posts.map((post) => post.slug)).toEqual([
      '2026-02-01-b',
      '2026-01-01-a',
    ]);
  });

  it('slugifies display names while keeping the original for display', () => {
    const groups = groupPostsByTag([
      makePost({ slug: '2026-01-01-a', date: '2026-01-01', tags: ['Site Notes'] }),
    ]);
    expect(groups.get('site-notes')?.name).toBe('Site Notes');
  });
});

describe('groupPostsBySeries', () => {
  it('orders episodes ascending regardless of publication order', () => {
    const ep2 = makePost({
      slug: '2026-05-12-two',
      date: '2026-05-12',
      series: { name: 'TS7', slug: 'ts7', episode: 2 },
    });
    const ep1 = makePost({
      slug: '2026-05-05-one',
      date: '2026-05-05',
      series: { name: 'TS7', slug: 'ts7', episode: 1 },
    });
    const groups = groupPostsBySeries([ep2, ep1]);
    expect(groups.get('ts7')?.posts.map((post) => post.series?.episode)).toEqual([1, 2]);
  });

  it('skips posts without a series', () => {
    expect(groupPostsBySeries([march]).size).toBe(0);
  });
});

describe('groupPostsByAuthor', () => {
  it('keeps authors with no posts and sorts posts newest first', () => {
    const groups = groupPostsByAuthor([march, april], ['kphoto-team', 'casey-rivers']);
    expect(groups.get('casey-rivers')).toEqual([]);
    expect(groups.get('kphoto-team')?.map((post) => post.slug)).toEqual([
      '2026-04-01-good-morning',
      '2026-03-22-good-morning',
    ]);
  });
});
