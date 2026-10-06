import { describe, expect, it } from 'vitest';
import { makePageContext } from '../pages/testContext.ts';
import { siteConfig } from './config.ts';
import { buildAtomFeed } from './feed.ts';
import { loadSiteModel } from './content.ts';
import { postFile } from './testFixtures.ts';

const model = loadSiteModel(
  {
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
      '2026-03-22-good-morning.es.md': postFile('title: Buenos días\nsummary: Hola'),
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
  },
  undefined,
  { defaultLocale: 'en', locales: ['en', 'es'] },
);

describe('buildAtomFeed', () => {
  const feed = buildAtomFeed(model, makePageContext('en'));

  it('is a well-formed Atom skeleton', () => {
    expect(feed).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(feed).toContain('<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">');
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

  it('keeps original entries in the default feed', () => {
    expect(feed).not.toContain('Buenos días');
    expect(feed).not.toContain('<entry xml:lang');
  });
});

describe('buildAtomFeed for another locale', () => {
  const feed = buildAtomFeed(model, makePageContext('es'));

  it('lives under the locale prefix', () => {
    expect(feed).toContain(`<link rel="self" href="${siteConfig.url}/es/feed.xml" />`);
    expect(feed).toContain(`<id>${siteConfig.url}/es/</id>`);
    expect(feed).toContain('xml:lang="es"');
  });

  it('uses translations and marks untranslated entries with their language', () => {
    expect(feed).toContain('<title>Buenos días</title>');
    expect(feed).toContain(`<id>${siteConfig.url}/es/blog/2026-03-22-good-morning/</id>`);
    expect(feed).toContain('<entry xml:lang="en">');
  });
});
