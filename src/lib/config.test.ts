import { describe, expect, it } from 'vitest';
import { liveStatsEnabled, siteConfig, type SiteConfig } from './config';

function withLiveStats(projectUrl: string, publishableKey: string): SiteConfig {
  return { ...siteConfig, liveStats: { projectUrl, publishableKey } };
}

describe('siteConfig', () => {
  it('points live statistics at the colorado Supabase project', () => {
    expect(siteConfig.liveStats.projectUrl).toBe('https://wgtvebsxazxfapjtujce.supabase.co');
  });

  it('never ships a secret key', () => {
    expect(siteConfig.liveStats.publishableKey.startsWith('sb_secret_')).toBe(false);
  });
});

describe('liveStatsEnabled', () => {
  it('is on with an https project URL and a publishable key', () => {
    expect(liveStatsEnabled(withLiveStats('https://abc.supabase.co', 'sb_publishable_xyz'))).toBe(
      true,
    );
  });

  it('is off without a key, including a blank one', () => {
    expect(liveStatsEnabled(withLiveStats('https://abc.supabase.co', ''))).toBe(false);
    expect(liveStatsEnabled(withLiveStats('https://abc.supabase.co', '   '))).toBe(false);
  });

  it('is off for insecure, malformed or trailing-slash project URLs', () => {
    expect(liveStatsEnabled(withLiveStats('http://abc.supabase.co', 'k'))).toBe(false);
    expect(liveStatsEnabled(withLiveStats('https://abc.supabase.co/', 'k'))).toBe(false);
    expect(liveStatsEnabled(withLiveStats('', 'k'))).toBe(false);
    expect(liveStatsEnabled(withLiveStats('https://abc.supabase.co/rest', 'k'))).toBe(false);
  });

  it('refuses to run with a secret key even if one is pasted by mistake', () => {
    expect(liveStatsEnabled(withLiveStats('https://abc.supabase.co', 'sb_secret_oops'))).toBe(
      false,
    );
  });
});
