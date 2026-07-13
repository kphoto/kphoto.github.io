# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Scheduled publishing (ADR 0021): a post dated in the future is validated
  on every build but excluded from the site — pages, feed and sitemap — until
  its date arrives in the site's time zone (`siteConfig.timeZone`, new). The
  deploy workflow now also runs on a daily cron (05:10 UTC, just past
  midnight US-Eastern) so each scheduled post goes live on its date without
  a commit; `KPHOTO_SHOW_FUTURE=1` lets the dev server preview scheduled
  posts. New pure helper `isoDateInTimeZone` in `src/lib/dates.ts`;
  `loadSiteModel` takes an optional `publishedThrough` cutoff.
- Twenty-episode "Photography Fundamentals" series
  (`content/blog/2026-07-13-…` through `2026-08-01-…`), publishing one
  episode per day via the scheduling above.
- Containerised end-to-end testing: `compose.yaml` (services `e2e`, `dev`,
  `preview`) on the official pinned Playwright image, driven by podman
  compose (docker also works), plus the `scripts/test-e2e-container.sh`
  wrapper and a CI `e2e` job running in the same image (ADR 0017).
- `src/versionSync.test.ts` — unit test that fails when the Playwright
  container image pins in `compose.yaml` or `.github/workflows/verify.yml`
  drift from `devDependencies["@playwright/test"]`.
- `./check.sh --e2e-host` flag; `./check.sh` now prefers the containerised
  e2e run when podman (or `$CONTAINER_ENGINE`) is available.
- `scripts/dev.sh` and `scripts/preview.sh` forward extra arguments to Vite
  (the compose services use this to bind `0.0.0.0`).

### Changed

- The home-page e2e scenarios are content-agnostic (ADR 0010 amendment):
  "navigates from a post card to the post" derives the expected URL and
  title from the first card instead of naming a specific post, and the card
  count comes from `siteConfig.postsOnHome`. Previously the test hard-coded
  a post that new content had displaced from the home page, timing out in
  all four browser projects.
- Routine dependency bumps past the 72-hour quarantine, exactly as ADR 0014
  scheduled: vite 8.1.3 → 8.1.4, prettier 3.9.4 → 3.9.5. eslint 10.7.0 and
  typescript-eslint 8.64.0 remain quarantined at the time of this change
  (yarn refuses them with `YN0016`) and stay at 10.6.0 / 8.63.0 until the
  next routine `yarn up`.
- Reduced-motion visitors no longer engage the view-transition machinery at
  all: the `@view-transition { navigation: auto }` opt-in now lives inside
  `@media (prefers-reduced-motion: no-preference)`, replacing the previous
  approach of zeroing the `::view-transition-*` animations after the
  transition had already started (ADR 0018).
- `repo_root()` in `scripts/lib.sh` derives the repository root from the
  script's own location instead of `git rev-parse`, so it behaves
  identically on the host, under podman, and in CI containers where git's
  dubious-ownership protection previously made it print a spurious
  `[error] not inside a git repository` (ADR 0020).

### Fixed

- `yarn install` is warning-free again: the ADR 0006 packageExtensions realm
  now also gives `typescript-eslint` (the meta package) and
  `@typescript-eslint/utils` the nested `typescript@6.0.3` fallback, which
  satisfies their `typescript` peer edge and removes the `YN0002`/`YN0086`
  post-resolution warnings (ADR 0006 amendment).
- `.yarnrc.yml` carries `npmMinimalAgeGate: 4320` again. ADR 0014 documents
  the 72-hour supply-chain quarantine as accepted policy, but the setting
  itself had been lost from the config; restored and verified (a 2-hour-old
  release is refused with `YN0016: … quarantined`).
- Stale ADR references in `.yarnrc.yml` comments now point at the real
  files (`0006-dual-typescript-toolchain.md`,
  `0014-yarn-and-dependency-policy.md`).
- Containerised chromium and mobile-chrome e2e runs no longer freeze for
  30 s on "header navigation reaches every section": the real Chromium
  build reproduced the Headless Shell's view-transition rendering stall
  inside the Playwright container, so the Playwright config now emulates
  `prefers-reduced-motion: reduce` in every project and — with the opt-in
  motion-gated — navigations under test never enter the transition
  pipeline (ADR 0018, amending ADR 0016).
- Firefox launches again in the CI `e2e` container job: GitHub points
  `$HOME` at `/github/home`, which the job's root user does not own and
  which Firefox refuses to run under; the job now pins `HOME=/root`,
  Playwright's documented workaround (ADR 0019).
- Chromium and mobile-chrome e2e runs no longer time out on "header
  navigation reaches every section": the site's cross-document view
  transitions freeze Chrome Headless Shell's rendering loop after
  link-click navigations, so the chromium projects now run the real
  Chromium build in "new headless" mode via `channel: 'chromium'`
  (ADR 0016). Browser installs skip the now-unused shell (`--no-shell`).

## [0.1.0] - 2026-07-09

### Added

- Static site generator written from scratch in TypeScript 7 as a Vite plugin:
  dev server renders every route live from `content/`, production build writes
  every page, `404.html`, `feed.xml` and `sitemap.xml` with hashed asset names.
- Hand-rolled content pipeline with zero runtime dependencies: YAML subset
  parser, frontmatter reader, markdown renderer with HTML escaping and URL
  sanitisation, reading-time estimator.
- Content model: date-stamped post URLs (unique per day, duplicate titles
  allowed across days), required tags, optional series with validated unique
  episode numbers, authors as YAML files, standalone markdown pages.
- Aggregated build-time content validation with file-scoped error messages
  and a friendly in-browser error page during development.
- Pages: home (hero + latest posts), blog index, post detail with series
  navigation and author card, tag index/detail (newest first), series
  index/detail (episode order), author index/detail, about, contact, 404.
- Reusable components with scoped styles via declarative shadow DOM: header
  (wordmark + nav + theme picker), footer (GitHub repository highlight,
  license and AI-disclosure line), post card, post meta, series nav, author card.
- Theming: light, dark, solarized light, solarized dark and system, resolved
  before first paint, persisted in one versioned localStorage key, following
  the OS while set to system; all colour pairs verified against WCAG AA.
- Accessibility: skip link, focus-visible styles, aria-current navigation,
  labelled controls, reduced-motion handling; cross-document view transitions.
- Atom feed and sitemap generation.
- Test suite: 147 Vitest unit tests co-located with the code, plus a
  Playwright end-to-end suite (chromium, firefox, webkit, mobile) covering
  navigation, ordering rules, theming persistence and 404 behaviour.
- Tooling: TypeScript 7 native compiler for type-checking with a side-by-side
  TypeScript 6 install for typescript-eslint (ADR 0006), ESLint 10 strict
  type-checked config, Prettier, Yarn 4 via corepack, exact-pinned versions.
- `scripts/` suite and root `check.sh` mirroring CI exactly; slim GitHub
  Actions workflows that only call those scripts; GitHub Pages deployment on
  every push to `main`.
- Documentation: README with prominent AI/LLM assistance disclosure,
  architecture and content-authoring guides, and ADRs 0001–0015.
- Ignore generated .pnp files when generating `dump.txt` using `export.sh`

### Fixed

- Corrected the `kphoto-team` author file, which carried a bio and e-mail
  address copy-pasted from an unrelated project.

[Unreleased]: https://github.com/kphoto/kphoto.github.io/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/kphoto/kphoto.github.io/releases/tag/v0.1.0
