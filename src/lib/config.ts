/**
 * Optional live statistics backend (ADR 0022). Both values are public by
 * design: a Supabase project URL and its *publishable* key, which only grants
 * what the database's `anon` role may do — here, calling the four `kp_*`
 * functions in `docs/supabase/live-stats.sql`. Never put a secret key here.
 */
export interface LiveStatsConfig {
  /** `https://<project-ref>.supabase.co`, without a trailing slash. */
  readonly projectUrl: string;
  /**
   * The project's publishable key (`sb_publishable_…`, Dashboard → Settings →
   * API Keys). An empty string switches the feature off: no markup, no
   * requests, and `/live/` explains that live statistics are off.
   */
  readonly publishableKey: string;
}

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
  /**
   * IANA time zone that decides when a dated post counts as published: a post
   * goes live on the build whose local date in this zone reaches the post's
   * date (ADR 0021).
   */
  readonly timeZone: string;
  /** Live statistics backend; see {@link LiveStatsConfig} and ADR 0022. */
  readonly liveStats: LiveStatsConfig;
}

export const siteConfig: SiteConfig = {
  title: 'kphoto',
  description: 'A demonstration of what is possible with TypeScript 7 and the modern web.',
  url: 'https://kphoto.github.io',
  repoUrl: 'https://github.com/kphoto/kphoto.github.io',
  language: 'en',
  postsOnHome: 5,
  timeZone: 'America/New_York',
  liveStats: {
    // Supabase project "colorado" (us-east-2).
    projectUrl: 'https://wgtvebsxazxfapjtujce.supabase.co',
    // Paste the project's sb_publishable_… key here to switch live stats on.
    publishableKey: 'sb_publishable_WS-YNzbiQffEQ0NS0DIy_w_2Vw6Uw-J',
  },
};

/**
 * True when the build should ship live statistics at all: an https project
 * URL without a trailing slash and a non-blank publishable key. Anything else
 * renders the site exactly as it was before the feature existed.
 */
export function liveStatsEnabled(config: SiteConfig): boolean {
  const { projectUrl, publishableKey } = config.liveStats;
  return (
    /^https:\/\/[a-z0-9.-]+$/i.test(projectUrl) &&
    publishableKey.trim() !== '' &&
    !publishableKey.startsWith('sb_secret_')
  );
}
