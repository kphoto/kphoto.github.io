# 10. Test strategy: co-located Vitest units, Playwright against preview

Date: 2026-07-09

## Status

Accepted

## Context

The requirements ask for maximum practical unit-test coverage plus browser
tests, on a codebase whose whole point is hand-rolled logic (parsers,
renderers, ordering rules) — exactly the kind of code unit tests are best at.

## Decision

Two suites with a hard boundary:

- **Vitest** (147 tests) lives next to the code it tests
  (`src/**/*.test.ts`), runs in Node, and covers all pure logic: every parser
  rule, escaping guarantee, ordering rule, feed/sitemap shape, the settings
  store against fakes (including a throwing store), the ThemeController with
  injected fake media, and the generated pre-paint script evaluated in a
  sandbox. `routes.test.ts` renders the whole site from an in-memory model
  and asserts the complete path inventory.
- **Playwright** (12 scenarios × chromium, firefox, webkit, mobile-chrome)
  drives the _built_ site via `yarn preview` (ADR 0005's preview middleware),
  covering what units cannot: real navigation, DSD rendering, the theme
  picker writing localStorage and surviving reload, `prefers-color-scheme`
  emulation, real 404 status codes, and keyboard skip-link focus.

Coverage is reported (V8) but not gated on a percentage: `src/ssg/vitePlugin.ts`
reads 0 % in unit coverage by design — the e2e suite and every `yarn build`
exercise it. Enforcement is "every rule in `docs/content-authoring.md` has a
failing test if removed", reviewed rather than measured.

## Consequences

Unit tests run in ~2 s with no browser, so they run constantly; e2e is the
slow, honest layer. Fakes at the seams (storage, media, host, time) keep
client logic testable without jsdom. A percentage gate is deliberately
rejected to avoid coverage-shaped tests.

## Amendment (2026-07-13): e2e tests must not depend on editorial content

"navigates from a post card to the post" hard-coded a post title and URL and
assumed that post sat on the home page. Twenty new dated posts later it timed
out in all four browser projects — the post had simply scrolled off. The
lesson generalises: the home page's "latest posts" is a **moving window over
content**, and with scheduled publishing (ADR 0021) it now moves on its own
every day, with no commit at all.

Rule going forward: e2e scenarios assert **behaviour and invariants**, never
the presence of a particular piece of writing. The rewritten test derives the
expected URL and title from the first card in the DOM and asserts the dated
URL shape and the title round-trip; the card count comes from
`siteConfig.postsOnHome` instead of a literal `5`. Tests that intentionally
pin specific posts (the duplicate-title pair, the three-episode series) may
keep doing so — those posts exist _as fixtures for those behaviours_ and are
past-dated, so the publishing clock can never hide them.
