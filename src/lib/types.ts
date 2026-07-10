import type { MarkdownHeading } from './markdown';

export type AuthorSocials = Readonly<Record<string, string>>;

export interface Author {
  /** File-name derived identifier, e.g. `kphoto-team`. */
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly bio?: string;
  /** Path relative to the site root, e.g. `images/authors/kphoto-team.png`. */
  readonly avatar?: string;
  readonly socials?: AuthorSocials;
}

export interface SeriesMembership {
  readonly name: string;
  readonly slug: string;
  /** 1-based position inside the series. */
  readonly episode: number;
}

export interface Post {
  /** Date-stamped slug derived from the file name, e.g. `2026-03-22-good-morning`. */
  readonly slug: string;
  /** Site-absolute URL with a trailing slash, e.g. `/blog/2026-03-22-good-morning/`. */
  readonly url: string;
  readonly title: string;
  /** ISO `YYYY-MM-DD` publication date. */
  readonly date: string;
  /** Author id referencing a file in `content/authors/`. */
  readonly author: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly series?: SeriesMembership;
  readonly html: string;
  readonly headings: readonly MarkdownHeading[];
  readonly readingMinutes: number;
}

export interface TagCollection {
  readonly name: string;
  readonly slug: string;
  /** Newest first. */
  readonly posts: readonly Post[];
}

export interface SeriesCollection {
  readonly name: string;
  readonly slug: string;
  /** Lowest episode first. */
  readonly posts: readonly Post[];
}

export interface MarkdownPage {
  readonly slug: string;
  readonly title: string;
  readonly html: string;
  readonly headings: readonly MarkdownHeading[];
}

export interface SiteModel {
  /** Newest first. */
  readonly posts: readonly Post[];
  readonly authors: ReadonlyMap<string, Author>;
  readonly postsByAuthor: ReadonlyMap<string, readonly Post[]>;
  /** Keyed by tag slug, sorted alphabetically. */
  readonly tags: ReadonlyMap<string, TagCollection>;
  /** Keyed by series slug, sorted alphabetically. */
  readonly series: ReadonlyMap<string, SeriesCollection>;
  /** Keyed by page slug (`about`, `contact`, …). */
  readonly pages: ReadonlyMap<string, MarkdownPage>;
}

/** Raw content keyed by file name; the only input the model builder needs. */
export interface ContentInput {
  readonly blog: Readonly<Record<string, string>>;
  readonly authors: Readonly<Record<string, string>>;
  readonly pages: Readonly<Record<string, string>>;
}
