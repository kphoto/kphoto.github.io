# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

### Fixed

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
