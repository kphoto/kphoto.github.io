# kphoto

**A demonstration of what is possible with TypeScript 7 and the modern web.**

A complete blog — markdown posts, tags, series, authors, five themes, an Atom
feed — with **zero runtime dependencies**. No framework, no CSS library, no
markdown or YAML package, no external resources of any kind. Everything the
browser receives was written in this repository and compiled by the
TypeScript 7 **native compiler**.

Live site: **<https://kphoto.github.io>** · License: **AGPL-3.0-or-later**

---

## 🤖 AI/LLM assistance disclosure

**This project is developed with substantial AI/LLM assistance.** The large
majority of the source code, tests, styles, content, scripts, workflows and
documentation in this repository — including this README — was written by
large language models (Anthropic's Claude) working under human direction and
review. Prompts set the requirements and constraints; the models wrote and
iterated on the implementation; a human reviews, runs `./check.sh`, and
commits. The same disclosure appears in the footer of every page on the site.
If you are evaluating this repository — as a reader, contributor, employer or
researcher — please weigh it with that provenance in mind.

---

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
optionally `series` + `episode`. Authors live in `content/authors/*.yml`;
standalone pages in `content/pages/*.md`. Every rule is validated at build
time with file-scoped error messages — see
[docs/content-authoring.md](docs/content-authoring.md).

## Architecture in one paragraph

`src/lib/` is pure logic (parsers, model, feed, sitemap) with no I/O;
`src/components/` and `src/pages/` render strings from that model;
`src/ssg/` is the only code that touches the filesystem and Vite;
`src/client/` is the only code that runs in the browser. Time (the footer
year and the publish cutoff) and storage (localStorage) are injected, so
every layer is unit-testable with fakes. The longer version is in [docs/architecture.md](docs/architecture.md),
and every non-obvious decision has an ADR in [docs/adr/](docs/adr/).

## Toolchain

TypeScript **7.0** (native compiler) for type-checking, with a side-by-side
TypeScript **6.0** install that exists only so typescript-eslint can keep
using the classic compiler API — the how and why is
[ADR 0006](docs/adr/0006-dual-typescript-toolchain.md). Vite 8, Vitest 4,
Playwright 1.61, ESLint 10 + typescript-eslint 8 (strict type-checked),
Prettier 3, Yarn 4 via corepack, Node 24. Dependencies are exact-pinned;
deviations from "absolute latest" are quarantine holds documented in
[ADR 0014](docs/adr/0014-yarn-and-dependency-policy.md).

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
