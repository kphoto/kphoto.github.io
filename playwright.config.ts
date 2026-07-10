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
    // See ADR 0016.
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'], channel: 'chromium' } },
  ],
});
