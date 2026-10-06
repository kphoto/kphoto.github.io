import { test as base, expect, type Page, type Request } from '@playwright/test';

export const SUPABASE = /^https:\/\/[a-z0-9-]+\.supabase\.co\//;

export const test = base.extend<{ unreachableBackend: undefined }>({
  unreachableBackend: [
    async ({ context }, use) => {
      await context.route(SUPABASE, (route) => route.abort('internetdisconnected'));
      await use(undefined);
    },
    { auto: true },
  ],
});

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
