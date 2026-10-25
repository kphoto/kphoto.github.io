# kphoto

**A demonstration of what is possible with TypeScript 7 and the modern web.**

A complete blog — markdown posts, tags, series, authors, five themes, an Atom
feed, two languages, narrated posts, interactive labs and optional live
readership statistics — with **zero runtime dependencies**. No framework, no CSS library, no markdown or YAML package, no
SDK, no external resources beyond one optional, non-blocking statistics API.
Everything the browser receives was written in this repository and compiled
by the TypeScript 7 **native compiler**.

Live site: **<https://kphoto.github.io>** · License: **AGPL-3.0-or-later**

---

## 🤖 AI/LLM assistance disclosure

**This project is developed with substantial AI/LLM assistance.** The large
majority of the source code, tests, styles, content, scripts, workflows and
documentation in this repository — including this README — was written by
large language models (Anthropic's Claude) working under human direction and
review. The Spanish interface text and translations are AI-written too.
The narrations in `public/spoken/` are AI-generated speech. Prompts set the
requirements and constraints; the models wrote and
iterated on the implementation; a human reviews, runs `./check.sh`, and
commits. The same disclosure appears in the footer of every page on the site.
If you are evaluating this repository — as a reader, contributor, employer or
researcher — please weigh it with that provenance in mind.

---

**Contents:** [Zero runtime dependencies](#what-zero-runtime-dependencies-means) ·
[Quick start](#quick-start-fedora-43-and-friends) · [Scripts](#scripts) ·
[E2E in a container](#end-to-end-tests-in-a-container) ·
[Writing content](#writing-content) · [Narrated posts](#narrated-posts) ·
[Labs](#labs-how-the-flapping-airplane-flies) ·
[Live statistics](#live-statistics-optional-never-blocking) ·
[Languages](#languages) · [Architecture](#architecture-in-one-paragraph) ·
[Toolchain](#toolchain) · [Deployment](#deployment) · [License](#license)

## What "zero runtime dependencies" means

`package.json` has a `devDependencies` section and **no `dependencies`
section**. Vite, Vitest, Playwright, ESLint, Prettier and TypeScript exist at
build time only. At runtime the site is static HTML, one hand-written CSS
file and one small hand-written script. That required writing from scratch:

- a YAML subset parser (`src/lib/yaml.ts`) and frontmatter reader
- a markdown renderer with escaping and URL sanitisation (`src/lib/markdown.ts`)
- a static site generator as a Vite plugin (`src/ssg/vitePlugin.ts`)
- web components scoped with declarative shadow DOM (`src/components/`)
- a theme system persisted in localStorage with a pre-paint script (`src/client/`)
- internationalization: typed message catalogs, `Intl` plurals and dates,
  locale-prefixed routes, hreflang alternates (`src/i18n/`)
- a live-statistics client — PostgREST over plain `fetch`, visibility-gated
  polling, a persisted circuit breaker — instead of the Supabase SDK
- an animation explainer that plays the same flipbook with `<img>`, canvas
  and pure CSS, instead of React and WebGL

## Quick start (Fedora 43 and friends)

```bash
sudo dnf install nodejs        # Node 24+ ships corepack
sudo corepack enable           # provides yarn 4 (pinned in package.json)

git clone https://github.com/kphoto/kphoto.github.io.git
cd kphoto.github.io
./scripts/bootstrap.sh         # yarn install --immutable
./scripts/dev.sh               # http://localhost:5173 — edit content/, it reloads
```

Before pushing, run everything CI runs:

```bash
./check.sh             # full suite; e2e runs in the Playwright container if podman is available
./check.sh --e2e-host  # force the browser tests onto the host instead
./check.sh --no-e2e    # skip the browser tests
```

## Scripts

Every script works from any directory and does exactly one thing. CI calls
these same scripts, so local and CI behaviour cannot drift.

| Script                            | What it does                                                 |
| --------------------------------- | ------------------------------------------------------------ |
| `./scripts/bootstrap.sh`          | Verify Node 24+, enable corepack, `yarn install --immutable` |
| `./scripts/dev.sh`                | Dev server; every route renders live from `content/`         |
| `./scripts/format.sh`             | Prettier write mode (`--check` to verify only)               |
| `./scripts/lint.sh`               | ESLint, type-aware rules, zero warnings allowed              |
| `./scripts/typecheck.sh`          | `tsc --noEmit` with the TypeScript 7 native compiler         |
| `./scripts/typecheck-next.sh`     | Same with the pinned TypeScript 7.1 preview                  |
| `./scripts/test-unit.sh`          | Vitest unit suite with V8 coverage                           |
| `./scripts/build.sh`              | Static build into `dist/` (pages + feed + sitemap)           |
| `./scripts/test-e2e.sh`           | Playwright suite against a preview of `dist/`                |
| `./scripts/test-e2e-container.sh` | Same suite inside the official Playwright image (podman)     |
| `./scripts/preview.sh`            | Serve `dist/` the way GitHub Pages will                      |
| `./scripts/clean.sh`              | Remove build and test artifacts                              |
| `./check.sh`                      | All of the above in CI order, then `./export.sh`             |
| `./export.sh`                     | Dump all tracked files to `docs/llm/dump.txt` for LLM use    |

## End-to-end tests in a container

Playwright supports only a handful of host distributions — Fedora is not one
of them — so the e2e suite runs inside the **official Playwright image**,
the exact image the CI `e2e` job uses
([ADR 0017](docs/adr/0017-containerised-e2e-playwright-image.md)):

```bash
sudo dnf install podman podman-compose   # once
./scripts/test-e2e-container.sh          # = podman compose run --rm e2e
podman compose up dev                    # containerised dev server on :5173
podman compose up preview                # containerised built site on :4173
```

Docker works too: `CONTAINER_ENGINE=docker ./scripts/test-e2e-container.sh`.
The image tag in `compose.yaml` and `.github/workflows/verify.yml` must match
`@playwright/test` in `package.json` exactly; the unit suite
(`src/versionSync.test.ts`) fails the moment they drift. The chromium
projects run the real Chromium build in "new headless" mode instead of the
Chrome Headless Shell
([ADR 0016](docs/adr/0016-chromium-new-headless-channel.md)), and every
project emulates `prefers-reduced-motion: reduce`: the site motion-gates its
cross-document view-transition opt-in, so navigations under test skip the
transition machinery that froze containerised Chromium
([ADR 0018](docs/adr/0018-motion-gated-view-transitions.md)). The CI job
additionally pins `HOME=/root`, without which Firefox refuses to launch in
GitHub's job containers
([ADR 0019](docs/adr/0019-ci-container-home-override.md)).

## Writing content

Posts live in `content/blog/` as `YYYY-MM-DD-name.md`; the date in the file
name **is** the URL prefix, so two posts may share a title as long as they
were published on different days. The date also **schedules** the post: a
post dated in the future is validated on every build but stays out of the
site — pages, feed and sitemap alike — until its date arrives in the site's
time zone, at which point the daily rebuild publishes it
([ADR 0021](docs/adr/0021-scheduled-publishing-and-daily-rebuild.md)).
Frontmatter carries `title`, `date`, `author`, `summary`, a `tags` list, and
optionally `series` + `episode`, `lang` and `narration`. A translation is a
sibling file, `YYYY-MM-DD-name.es.md`, with only `title`, `summary`, optional
`narration` and the body — nothing is written twice. Authors live in `content/authors/*.yml`;
standalone pages in `content/pages/*.md`. Every rule is validated at build
time with file-scoped error messages — see
[docs/content-authoring.md](docs/content-authoring.md).

## Narrated posts

A post opts in with `narration: name-en.wav`, a file in `public/spoken/`;
each translation names its own. The page gets a native audio player, the
card says "with audio", and every other post is untouched. Speed and
position are remembered in localStorage. The narrations are AI-generated
voices, and the page says so. A missing file fails the build
([ADR 0034](docs/adr/0034-narration-audio.md),
[ADR 0035](docs/adr/0035-remembered-listening.md)).

## Labs: how the flapping airplane flies

[`/labs/flapping-airplane/`](https://kphoto.github.io/labs/flapping-airplane/)
takes apart the animation on flappingairplanes.com. It turns out to be a
flipbook: 28 drawings, shown 12 times a second, with the frame picked by
`floor(t × fps) mod 28`. The page plays them and teaches each step:

- **controls** — play/pause, single-frame steps, a frame scrubber, 1–60 fps,
  and a live readout of `t`, `t × fps`, the frame index and its file name;
- **three techniques** — swap an `<img>` source, paint `ImageBitmap`s on a
  canvas, or let CSS `@keyframes` with `step-end` do it; the CSS version
  plays with JavaScript off, and script steers it through the Web
  Animations API;
- **the original's extras** explained — the WebGL fluid simulation is
  described, and its scroll tilt (up to 14°) and fade are reproduced on a
  "Climb" slider with the same curves;
- **polite by default** — preloaded and decoded before the first flap,
  paused off-screen, paused at start under reduced motion, and the ink
  recoloured for every theme with two CSS tokens.

Speed, technique and play state are remembered in `kphoto:flipbook:v1`.
Decisions: ADRs [0036](docs/adr/0036-labs-section.md)–[0038](docs/adr/0038-third-party-demonstration-assets.md).

> **Image disclaimer.** The drawings in `public/images/flapping-airplanes/`
> belong to [Flapping Airplanes](https://flappingairplanes.com/). They are
> used here for educational and demonstration purposes only, are **not**
> covered by this repository's AGPL license, and this project is not
> affiliated with or endorsed by Flapping Airplanes. Do not reuse them
> without the rights holder's permission; they will be removed on request.

## Live statistics (optional, never blocking)

The footer can show how many people are reading right now, and
[`/live/`](https://kphoto.github.io/live/) shows the busiest pages of the
last 24 hours. The numbers come from a free-tier Supabase project, reached
with plain `fetch`. The feature is built so that it **cannot break the
site**:

- nothing is shown until a request succeeds;
- every request times out after 5 s;
- after repeated failures every page on that browser stops trying for
  ten minutes.

A paused, over-quota or deleted project looks exactly like the feature not
existing. The e2e suite runs every test with the backend unreachable.

Privacy is designed in rather than promised:

- no IP addresses, cookies or stored identifiers — each open tab uses a
  random id held in memory;
- views are kept only as per-minute counts, deleted after 25 hours;
- visits are never counted for automated browsers, for browsers sending
  Global Privacy Control, or anywhere but the production origin.

It is off until `publishableKey` is set in `src/lib/config.ts`. The database
side is one idempotent SQL file,
[`docs/supabase/live-stats.sql`](docs/supabase/live-stats.sql), pasted into
the Supabase SQL editor. Setup, costs and removal are in
[docs/live-stats.md](docs/live-stats.md); the decisions are in ADRs
[0022](docs/adr/0022-optional-live-statistics-backend.md)–[0025](docs/adr/0025-visibility-gated-polling-with-circuit-breaker.md).

## Languages

English is the default and keeps every existing URL; Spanish lives under
`/es/`. Interface text comes from typed catalogs in `src/i18n/messages/`
(missing keys fall back to English, marked `lang="en"`). Untranslated posts
stay listed in every language and link to the original. The switcher
remembers your choice in localStorage and suggests, never redirects. How to
add a language: [docs/i18n.md](docs/i18n.md); decisions: ADRs 0026–0029.

## Build provenance

Every footer links the exact commit it was built from: `GITHUB_SHA` in
Actions, `git rev-parse HEAD` locally (flagged when the tree has local
changes) — [ADR 0030](docs/adr/0030-build-provenance-in-footer.md).

## No comments

The codebase has no comments; ESLint and a unit test enforce it
([ADR 0033](docs/adr/0033-no-comments.md)). Rationale lives in `docs/`.

## Architecture in one paragraph

`src/lib/` is pure logic (parsers, model, feed, sitemap) with no I/O;
`src/components/` and `src/pages/` render strings from that model;
`src/ssg/` is the only code that touches the filesystem and Vite;
`src/client/` is the only code that runs in the browser; `src/i18n/` is
pure and shared by both sides. Time (the footer year, the publish cutoff,
the flipbook clock) and storage (localStorage) are injected, so every layer
is unit-testable with fakes. The longer version is in [docs/architecture.md](docs/architecture.md),
and every non-obvious decision has an ADR in [docs/adr/](docs/adr/).

## Toolchain

| Tool                         | Version                                 | Role                                            |
| ---------------------------- | --------------------------------------- | ----------------------------------------------- |
| TypeScript (native compiler) | 7.0.2                                   | Every type-check and the editor                 |
| TypeScript 7.1 preview gate  | 7.1.0-beta                              | Second type-check so 7.1 never surprises us     |
| `@typescript/typescript6`    | 6.0.2                                   | API facade for typescript-eslint only           |
| Vite                         | 8.3.5                                   | Dev server, bundler (Rolldown), SSG plugin host |
| Vitest + coverage-v8         | 5.0.5                                   | Unit tests with V8 coverage                     |
| Playwright                   | 1.64.1                                  | E2E in the `v1.64.1-noble` image                |
| ESLint + typescript-eslint   | 10.13.0 / 8.72.0                        | Strict type-checked linting, zero warnings      |
| Prettier                     | 3.9.10                                  | Formatting                                      |
| Yarn (corepack)              | 4.18.1                                  | Package manager, 72-hour minimal-age gate       |
| Node                         | 24 LTS                                  | Build runtime only                              |
| GitHub Actions               | checkout v7, setup-node v7, Pages v6/v5 | CI and deployment                               |

typescript-eslint cannot load TypeScript 7 until 7.1's API ships, so the
package named `typescript` is the official `@typescript/typescript6` facade,
used by the linter alone
([ADR 0031](docs/adr/0031-typescript-7-only-compiler.md)). The 7.1 gate pins
the newest 7.1 milestone past the quarantine
([ADR 0032](docs/adr/0032-explicit-ts-extensions-and-7-1-gate.md)). VS Code:
install the recommended _TypeScript (Native Preview)_ extension.

Dependencies are exact-pinned and `yarn.lock` is committed. "Latest" means
latest that has been public for 72 hours
([ADR 0014](docs/adr/0014-yarn-and-dependency-policy.md)). To upgrade:

```bash
npx npm-check-updates          # respects npmMinimalAgeGate from .yarnrc.yml
yarn up <package>@<version>    # one deliberate bump at a time
./check.sh
```

The `npm:` aliases (`typescript-native`, `typescript-native-next`,
`typescript`) are not reported by npm-check-updates; check
`npm view typescript dist-tags` by hand. When `@playwright/test` moves, the
image tag in `compose.yaml` and `.github/workflows/verify.yml` moves with it.

## Deployment

Every push to `main` runs the full verification suite and, if green, deploys
`dist/` to GitHub Pages (`.github/workflows/deploy.yml`). The same workflow
also runs on a **daily schedule** (05:10 UTC ≈ just past midnight US-Eastern)
so scheduled posts go live on their date without a commit
([ADR 0021](docs/adr/0021-scheduled-publishing-and-daily-rebuild.md)). The
repository setting **Pages → Source** must be **GitHub Actions**.

## License

[AGPL-3.0-or-later](LICENSE). All dependencies are free software with
AGPL-compatible licenses ([ADR 0002](docs/adr/0002-agpl-license-and-dependency-policy.md)).
The one exception is content, not code: the Flapping Airplanes drawings in
`public/images/flapping-airplanes/` are third-party and used for
demonstration only (see the disclaimer above and
[ADR 0038](docs/adr/0038-third-party-demonstration-assets.md)).
