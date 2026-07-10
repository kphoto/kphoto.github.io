import type { SiteConfig } from './config';
import { toUtcTimestamp } from './dates';
import { escapeHtml } from './html';
import type { SiteModel } from './types';

/** Builds the Atom feed for every post, newest first. */
export function buildAtomFeed(model: SiteModel, config: SiteConfig): string {
  const updated = toUtcTimestamp(model.posts[0]?.date ?? '1970-01-01');
  const entries = model.posts
    .map((post) => {
      const url = `${config.url}${post.url}`;
      const authorName = model.authors.get(post.author)?.name ?? post.author;
      const categories = post.tags
        .map((tag) => `    <category term="${escapeHtml(tag)}" />`)
        .join('\n');
      return [
        '  <entry>',
        `    <title>${escapeHtml(post.title)}</title>`,
        `    <link href="${url}" />`,
        `    <id>${url}</id>`,
        `    <updated>${toUtcTimestamp(post.date)}</updated>`,
        '    <author>',
        `      <name>${escapeHtml(authorName)}</name>`,
        '    </author>',
        `    <summary>${escapeHtml(post.summary)}</summary>`,
        categories,
        `    <content type="html">${escapeHtml(post.html)}</content>`,
        '  </entry>',
      ]
        .filter((line) => line !== '')
        .join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeHtml(config.title)}</title>`,
    `  <subtitle>${escapeHtml(config.description)}</subtitle>`,
    `  <link href="${config.url}/" />`,
    `  <link rel="self" href="${config.url}/feed.xml" />`,
    `  <id>${config.url}/</id>`,
    `  <updated>${updated}</updated>`,
    entries,
    '</feed>',
    '',
  ].join('\n');
}
