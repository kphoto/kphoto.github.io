import type { MarkdownHeading } from '../lib/markdown.ts';
import type { MarkdownPage, Post } from '../lib/types.ts';

export interface Alternate {
  readonly locale: string;
  readonly path: string;
}

export interface LocalizedPost {
  readonly post: Post;
  readonly url: string;
  readonly language: string;
  readonly title: string;
  readonly summary: string;
  readonly html: string;
  readonly headings: readonly MarkdownHeading[];
  readonly readingMinutes: number;
  readonly translated: boolean;
}

export function hasPostIn(post: Post, locale: string): boolean {
  return post.language === locale || post.translations.has(locale);
}

export function postIn(post: Post, locale: string): LocalizedPost {
  const translation = post.language === locale ? undefined : post.translations.get(locale);
  if (translation) {
    return {
      post,
      url: translation.url,
      language: translation.locale,
      title: translation.title,
      summary: translation.summary,
      html: translation.html,
      headings: translation.headings,
      readingMinutes: translation.readingMinutes,
      translated: true,
    };
  }
  return {
    post,
    url: post.url,
    language: post.language,
    title: post.title,
    summary: post.summary,
    html: post.html,
    headings: post.headings,
    readingMinutes: post.readingMinutes,
    translated: false,
  };
}

export function postAlternates(post: Post): Alternate[] {
  return [
    { locale: post.language, path: post.url },
    ...[...post.translations.values()].map((translation) => ({
      locale: translation.locale,
      path: translation.url,
    })),
  ];
}

export interface LocalizedPage {
  readonly page: MarkdownPage;
  readonly language: string;
  readonly title: string;
  readonly html: string;
  readonly translated: boolean;
}

export function hasPageIn(page: MarkdownPage, locale: string): boolean {
  return page.language === locale || page.translations.has(locale);
}

export function pageIn(page: MarkdownPage, locale: string): LocalizedPage {
  const translation = page.language === locale ? undefined : page.translations.get(locale);
  return translation
    ? {
        page,
        language: translation.locale,
        title: translation.title,
        html: translation.html,
        translated: true,
      }
    : { page, language: page.language, title: page.title, html: page.html, translated: false };
}

export function pageLocales(page: MarkdownPage): string[] {
  return [page.language, ...page.translations.keys()];
}
