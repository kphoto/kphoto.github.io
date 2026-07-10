/**
 * Central site configuration. Everything that identifies the site lives here so
 * templates, feeds and tests share a single source of truth.
 */
export interface SiteConfig {
  readonly title: string;
  readonly description: string;
  /** Absolute origin of the deployed site, without a trailing slash. */
  readonly url: string;
  readonly repoUrl: string;
  readonly language: string;
  /** How many of the latest posts the home page showcases. */
  readonly postsOnHome: number;
}

export const siteConfig: SiteConfig = {
  title: 'kphoto',
  description: 'A demonstration of what is possible with TypeScript 7 and the modern web.',
  url: 'https://kphoto.github.io',
  repoUrl: 'https://github.com/kphoto/kphoto.github.io',
  language: 'en',
  postsOnHome: 5,
};
