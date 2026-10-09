# Architecture

The site is a static site generator plus a small browser runtime, arranged in
layers with dependencies pointing in one direction only.

## Layers

```text
src/lib/         pure logic — no I/O, no DOM, no Date.now()
  yaml.ts          YAML subset parser (line-numbered errors)
  frontmatter.ts   splits --- frontmatter --- from the body
  markdown.ts      markdown → HTML with escaping and URL sanitisation
  content.ts       parsing + validation → SiteModel (aggregated errors)
  narration.ts     narration file names → { src, media type }
  collections.ts   ordering rules (dates desc, episodes asc, tags alpha)
  feed.ts / sitemap.ts / dates.ts / slug.ts / readingTime.ts / html.ts

src/i18n/        pure, shared by build and browser
  locales.ts       locale settings, prefixes, path helpers
  format.ts        plural selection, interpolation, Intl numbers
  translator.ts    per-locale Translator with per-key fallback
  localizedContent.ts  a post or page as seen from one locale; alternates
  messages/        en.ts (source of truth), es.ts, index.ts

src/components/  render-to-string web components (declarative shadow DOM)
src/pages/       full pages composed from components; routes.ts renders
                 the whole site into a list of { path, body } files

src/ssg/         the only code that touches Node APIs and Vite
  loadContent.ts   reads content/ into plain records; lists public/spoken/
  git.ts           the only git call (build provenance)
  vitePlugin.ts    dev middleware, preview middleware, build output

src/client/      the only code that runs in the browser
  storage.ts       versioned, validated localStorage settings
  theme.ts         ThemeController with injected host/media/settings
  themeInit.ts     builds the inline pre-paint script
  liveStats.ts     live-stats types, validation, tracking policy, formatting
  liveStatsApi.ts  PostgREST client (injected fetch + timeout signal)
  circuitBreaker.ts  persisted back-off shared by every page
  livePoller.ts    visibility-gated polling loop (injected clock/timers/lifecycle)
  browser.ts       the real localStorage, clock, timers and lifecycle
  liveStatsElements.ts  upgrades <kp-live-stats> and <kp-live-board>
  locale.ts        chooseSuggestion: stored choice, then navigator.languages
  narration.ts     remembered speed and position against a player port
  narrationElement.ts  upgrades <kp-narration> around its <audio>
  main.ts          wires real browser APIs in; upgrades the theme picker,
                   the language switcher and the narration player

docs/supabase/   SQL applied by hand in the Supabase SQL editor (ADR 0024)
```

## Data flow

1. `readContentInput` reads `content/{blog,authors,pages}` into
   `{ fileName: rawText }` records and lists the recordings in
   `public/spoken/` — the only filesystem access.
2. `loadSiteModel` parses and cross-validates everything, collecting every
   problem into one `ContentValidationError` so authors fix a batch at once.
   It then drops posts dated after the publish cutoff — today's date in the
   site's time zone, computed once per render in the plugin — so every
   derived collection, the feed and the sitemap see published posts only
   (ADR 0021).
3. `renderSite` renders the model once per locale through a `PageContext`
   (translator, `href()` for the locale prefix, build info) into
   `{ path, body, contentType, alternates }` files: every page and feed per
   locale, then one `404.html` and one `sitemap.xml` with hreflang
   alternates (ADRs 0026–0028).
4. In dev, the Vite plugin runs steps 1–3 per request (content is always
   fresh) and injects the Vite client; changes under `content/` full-reload.
5. In build, Vite bundles `src/client/main.ts` and `src/styles/global.css`,
   then the plugin runs steps 1–3 with the hashed asset names from the
   manifest and writes each file into `dist/`.

## Dependency inversion in practice

Anything impure is injected at the edge. Build provenance is
`resolveBuildInfo(env, gitReader)`; the only git call sits in `src/ssg/git.ts`.
The plugin reads the clock once per
render and passes it down as data: the build year rides in `PageContext` and
today's date becomes the publish cutoff for `loadSiteModel`, so renders are
pure functions of (model, context). `ThemeController` receives
`{ settings, host, media }` interfaces, so unit tests flip the OS colour
scheme with a fake instead of jsdom. `SettingsStore` wraps a two-method
`KeyValueStore`, so a throwing store (private browsing) is a test case, not a
crash. The live-statistics client takes the same approach further: `fetch`,
the timeout signal, the clock, timers and page-lifecycle events are all
interfaces, with manual fakes in `src/client/liveTestDoubles.ts`.

## Optional live statistics

When `siteConfig.liveStats` carries a publishable key, the footer renders a
hidden `<kp-live-stats>` line and `/live/` renders a `<kp-live-board>`, each
with its connection details in `data-*` attributes. In the browser, a
`LivePoller` calls one of four PostgREST functions on a Supabase project
while the tab is visible, and reveals the element only after a success
(ADR 0022). Only real visitors on the production origin send heartbeats;
everyone else reads (ADR 0023). Failures feed a `CircuitBreaker` persisted
in localStorage, so a dead backend is abandoned site-wide for ten minutes
(ADR 0025). The database keeps nothing older than 25 hours (ADR 0024).
Operations are in [live-stats.md](live-stats.md).

## Narration

A post or translation naming a recording gets a `<kp-narration>` native
player; everything else renders as before. In the browser,
`connectNarration` applies the remembered speed, resumes the saved position
and keeps both current (ADRs 0034, 0035).

## Styling model

`src/styles/global.css` owns design tokens (`--bg`, `--text`, `--accent`, …)
per theme on `<html data-theme>`, plus layout and prose styles for light-DOM
content. Every component carries its own `<style>` inside a declarative
shadow root; tokens inherit through the shadow boundary, so themes recolour
components without any selector piercing. See ADR 0007 and ADR 0008.
