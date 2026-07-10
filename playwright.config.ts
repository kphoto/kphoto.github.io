import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the production build served by `vite preview`.
 * Run `yarn build` (or `scripts/build.sh`) before `yarn test:e2e`.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    // Every context emulates `prefers-reduced-motion: reduce` (this is a
    // browser-context option, so it lives under contextOptions — the exact
    // usage Playwright's own documentation shows; note a project-level
    // `contextOptions` would replace, not merge with, this one). Because
    // the site motion-gates its cross-document view-transition opt-in
    // (ADR 0018), navigations under test never engage the snapshot/reveal
    // machinery whose rendering stall froze Chromium-engine runs inside
    // the Playwright container. This also pins down the wordmark blink and
    // any future animation, in every browser project, and exercises the
    // same path a motion-sensitive visitor gets.
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
  webServer: {
    command: 'yarn preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    // channel 'chromium' runs the real Chromium build in "new headless" mode
    // instead of the default Chrome Headless Shell, whose rendering loop
    // freezes after link-click navigations when the site's cross-document
    // view transitions (`@view-transition` in global.css) are active.
    // See ADR 0016 — amended by ADR 0018 after the real build showed the
    // same freeze inside the Playwright container.
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'], channel: 'chromium' } },
  ],
});
