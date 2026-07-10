import { describe, expect, it } from 'vitest';
import { siteConfig } from './config';
import { buildAtomFeed } from './feed';
import { loadSiteModel } from './content';
import { postFile } from './testFixtures';

const model = loadSiteModel({
  blog: {
    '2026-03-22-good-morning.md': postFile(
      [
        'title: Good <morning> & you',
        'date: 2026-03-22',
        'author: kphoto-team',
        'summary: A summary with <angles>',
        'tags:',
        '  - introductions',
      ].join('\n'),
    ),
    '2026-04-01-later.md': postFile(
      [
        'title: Later',
        'date: 2026-04-01',
        'author: kphoto-team',
        'summary: s',
        'tags:',
        '  - x',
      ].join('\n'),
    ),
  },
  authors: { 'kphoto-team.yml': 'name: kphoto team' },
  pages: {},
});

describe('buildAtomFeed', () => {
  const feed = buildAtomFeed(model, siteConfig);

  it('is a well-formed Atom skeleton', () => {
    expect(feed).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(feed).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    expect(feed).toContain(`<link rel="self" href="${siteConfig.url}/feed.xml" />`);
  });

  it('lists entries newest first with resolved author names', () => {
    expect(feed.indexOf('2026-04-01-later')).toBeLessThan(feed.indexOf('2026-03-22-good-morning'));
    expect(feed).toContain('<name>kphoto team</name>');
  });

  it('uses the newest post date as the feed updated timestamp', () => {
    expect(feed).toContain('<updated>2026-04-01T00:00:00Z</updated>');
  });

  it('escapes titles, summaries and embedded HTML content', () => {
    expect(feed).toContain('Good &lt;morning&gt; &amp; you');
    expect(feed).toContain('A summary with &lt;angles&gt;');
    expect(feed).not.toContain('<p>Hello.</p>');
    expect(feed).toContain('&lt;p&gt;');
  });

  it('emits a category per tag', () => {
    expect(feed).toContain('<category term="introductions" />');
  });
});
