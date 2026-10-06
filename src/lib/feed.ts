import type { RenderContext } from '../components/context.ts';
import { postIn } from '../i18n/localizedContent.ts';
import { toUtcTimestamp } from './dates.ts';
import { escapeAttribute, escapeHtml } from './html.ts';
import type { SiteModel } from './types.ts';

export function buildAtomFeed(model: SiteModel, context: RenderContext): string {
  const { config, t } = context;
  const locale = t.locale.code;
  const updated = toUtcTimestamp(model.posts[0]?.date ?? '1970-01-01');
  const entries = model.posts
    .map((post) => {
      const view = postIn(post, locale);
      const url = `${config.url}${view.url}`;
      const lang = view.language === locale ? '' : ` xml:lang="${escapeAttribute(view.language)}"`;
      const authorName = model.authors.get(post.author)?.name ?? post.author;
      const categories = post.tags
        .map((tag) => `    <category term="${escapeHtml(tag)}" />`)
        .join('\n');
      return [
        `  <entry${lang}>`,
        `    <title>${escapeHtml(view.title)}</title>`,
        `    <link href="${url}" />`,
        `    <id>${url}</id>`,
        `    <updated>${toUtcTimestamp(post.date)}</updated>`,
        '    <author>',
        `      <name>${escapeHtml(authorName)}</name>`,
        '    </author>',
        `    <summary>${escapeHtml(view.summary)}</summary>`,
        categories,
        `    <content type="html">${escapeHtml(view.html)}</content>`,
        '  </entry>',
      ]
        .filter((line) => line !== '')
        .join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${escapeAttribute(locale)}">`,
    `  <title>${escapeHtml(config.title)}</title>`,
    `  <subtitle>${escapeHtml(t.text('site.description'))}</subtitle>`,
    `  <link href="${config.url}${context.href('/')}" />`,
    `  <link rel="self" href="${config.url}${context.href('/feed.xml')}" />`,
    `  <id>${config.url}${context.href('/')}</id>`,
    `  <updated>${updated}</updated>`,
    entries,
    '</feed>',
    '',
  ].join('\n');
}
