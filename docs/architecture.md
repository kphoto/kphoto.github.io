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
  collections.ts   ordering rules (dates desc, episodes asc, tags alpha)
  feed.ts / sitemap.ts / dates.ts / slug.ts / readingTime.ts / html.ts

src/components/  render-to-string web components (declarative shadow DOM)
src/pages/       full pages composed from components; routes.ts renders
                 the whole site into a list of { path, body } files

src/ssg/         the only code that touches Node APIs and Vite
  loadContent.ts   reads content/ into plain records
  vitePlugin.ts    dev middleware, preview middleware, build output

src/client/      the only code that runs in the browser
  storage.ts       versioned, validated localStorage settings
  theme.ts         ThemeController with injected host/media/settings
  themeInit.ts     builds the inline pre-paint script
  main.ts          wires real browser APIs in; upgrades the theme picker
```

## Data flow

1. `readContentInput` reads `content/{blog,authors,pages}` into
   `{ fileName: rawText }` records — the only filesystem access.
2. `loadSiteModel` parses and cross-validates everything, collecting every
   problem into one `ContentValidationError` so authors fix a batch at once.
3. `renderSite` turns the model into `{ path, body, contentType }` files:
   every page, `404.html`, `feed.xml`, `sitemap.xml`.
4. In dev, the Vite plugin runs steps 1–3 per request (content is always
   fresh) and injects the Vite client; changes under `content/` full-reload.
5. In build, Vite bundles `src/client/main.ts` and `src/styles/global.css`,
   then the plugin runs steps 1–3 with the hashed asset names from the
   manifest and writes each file into `dist/`.

## Dependency inversion in practice

Anything impure is injected at the edge. `PageContext` carries the build year
so renders are pure functions of (model, context). `ThemeController` receives
`{ settings, host, media }` interfaces, so unit tests flip the OS colour
scheme with a fake instead of jsdom. `SettingsStore` wraps a two-method
`KeyValueStore`, so a throwing store (private browsing) is a test case, not a
crash.

## Styling model

`src/styles/global.css` owns design tokens (`--bg`, `--text`, `--accent`, …)
per theme on `<html data-theme>`, plus layout and prose styles for light-DOM
content. Every component carries its own `<style>` inside a declarative
shadow root; tokens inherit through the shadow boundary, so themes recolour
components without any selector piercing. See ADR 0007 and ADR 0008.
