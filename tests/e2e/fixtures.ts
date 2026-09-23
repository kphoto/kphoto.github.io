import { test as base, expect, type Page, type Request } from '@playwright/test';

/** Any Supabase project's API. */
export const SUPABASE = /^https:\/\/[a-z0-9-]+\.supabase\.co\//;

/**
 * Every test starts with the live-statistics backend unreachable (ADR 0022):
 * the whole suite therefore doubles as proof that the site works with
 * Supabase down, paused or gone. Tests that need data install their own
 * `page.route` for SUPABASE, which takes precedence over this context route.
 */
export const test = base.extend<{ unreachableBackend: undefined }>({
  unreachableBackend: [
    async ({ context }, use) => {
      await context.route(SUPABASE, (route) => route.abort('internetdisconnected'));
      await use(undefined);
    },
    { auto: true },
  ],
});

/** Records every request the page makes to a Supabase project. */
export function recordBackendRequests(page: Page): Request[] {
  const requests: Request[] = [];
  page.on('request', (request) => {
    if (SUPABASE.test(request.url())) {
      requests.push(request);
    }
  });
  return requests;
}

export { expect };
