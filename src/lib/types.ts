import type { MarkdownHeading } from './markdown.ts';

export type AuthorSocials = Readonly<Record<string, string>>;

export interface Author {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly bio?: string;
  readonly avatar?: string;
  readonly socials?: AuthorSocials;
}

export interface SeriesMembership {
  readonly name: string;
  readonly slug: string;
  readonly episode: number;
}

export interface Narration {
  readonly file: string;
  readonly src: string;
  readonly type: string;
}

export interface PostTranslation {
  readonly locale: string;
  readonly url: string;
  readonly title: string;
  readonly summary: string;
  readonly html: string;
  readonly headings: readonly MarkdownHeading[];
  readonly readingMinutes: number;
  readonly narration?: Narration;
}

export interface Post {
  readonly slug: string;
  readonly url: string;
  readonly language: string;
  readonly title: string;
  readonly date: string;
  readonly author: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly series?: SeriesMembership;
  readonly html: string;
  readonly headings: readonly MarkdownHeading[];
  readonly readingMinutes: number;
  readonly narration?: Narration;
  readonly translations: ReadonlyMap<string, PostTranslation>;
}

export interface TagCollection {
  readonly name: string;
  readonly slug: string;
  readonly posts: readonly Post[];
}

export interface SeriesCollection {
  readonly name: string;
  readonly slug: string;
  readonly posts: readonly Post[];
}

export interface PageTranslation {
  readonly locale: string;
  readonly title: string;
  readonly html: string;
  readonly headings: readonly MarkdownHeading[];
}

export interface MarkdownPage {
  readonly slug: string;
  readonly language: string;
  readonly title: string;
  readonly html: string;
  readonly headings: readonly MarkdownHeading[];
  readonly translations: ReadonlyMap<string, PageTranslation>;
}

export interface SiteModel {
  readonly posts: readonly Post[];
  readonly authors: ReadonlyMap<string, Author>;
  readonly postsByAuthor: ReadonlyMap<string, readonly Post[]>;
  readonly tags: ReadonlyMap<string, TagCollection>;
  readonly series: ReadonlyMap<string, SeriesCollection>;
  readonly pages: ReadonlyMap<string, MarkdownPage>;
}

export interface ContentInput {
  readonly blog: Readonly<Record<string, string>>;
  readonly authors: Readonly<Record<string, string>>;
  readonly pages: Readonly<Record<string, string>>;
  readonly spoken?: readonly string[];
}

export interface ContentLocales {
  readonly defaultLocale: string;
  readonly locales: readonly string[];
}

export const SINGLE_LOCALE: ContentLocales = { defaultLocale: 'en', locales: ['en'] };
