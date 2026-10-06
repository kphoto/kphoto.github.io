import type { LocaleDefinition, LocaleSettings } from '../i18n/locales.ts';

export interface LiveStatsConfig {
  readonly projectUrl: string;
  readonly publishableKey: string;
}

export interface SiteConfig extends LocaleSettings {
  readonly title: string;
  readonly url: string;
  readonly repoUrl: string;
  readonly postsOnHome: number;
  readonly timeZone: string;
  readonly liveStats: LiveStatsConfig;
}

export const LOCALES: readonly LocaleDefinition[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
];

export const siteConfig: SiteConfig = {
  title: 'kphoto',
  url: 'https://kphoto.github.io',
  repoUrl: 'https://github.com/kphoto/kphoto.github.io',
  defaultLocale: 'en',
  locales: LOCALES,
  postsOnHome: 5,
  timeZone: 'America/New_York',
  liveStats: {
    projectUrl: 'https://wgtvebsxazxfapjtujce.supabase.co',
    publishableKey: 'sb_publishable_WS-YNzbiQffEQ0NS0DIy_w_2Vw6Uw-J',
  },
};

export function liveStatsEnabled(config: SiteConfig): boolean {
  const { projectUrl, publishableKey } = config.liveStats;
  return (
    /^https:\/\/[a-z0-9.-]+$/i.test(projectUrl) &&
    publishableKey.trim() !== '' &&
    !publishableKey.startsWith('sb_secret_')
  );
}

export function contentLocales(config: SiteConfig): {
  readonly defaultLocale: string;
  readonly locales: readonly string[];
} {
  return { defaultLocale: config.defaultLocale, locales: config.locales.map((l) => l.code) };
}
