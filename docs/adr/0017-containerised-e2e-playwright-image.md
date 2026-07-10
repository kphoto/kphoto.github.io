# 17. End-to-end tests run in the official Playwright container

Date: 2026-07-10

## Status

Accepted

## Context

Playwright supports a short list of host distributions (Ubuntu and Debian
LTS, macOS, Windows). The development machine runs Fedora 43, which is not
on it: Playwright falls back to `ubuntu24.04` browser builds that
dynamically link libraries Fedora does not ship under those sonames
(libicu74, libjpeg-turbo8, …), and `playwright install --with-deps` requires
`apt-get`. WebKit cannot start at all. Meanwhile CI provisioned browsers its
own way on `ubuntu-latest`, so "works here" and "works in CI" were different
claims about different environments.

## Decision

Run the e2e suite inside the **official Playwright image**, pinned in
`compose.yaml` as `mcr.microsoft.com/playwright:v1.61.1-noble`, which bakes
in the browsers and OS dependencies matching that exact library version plus
Node 24 (satisfying `engines`). Specifics:

- **podman compose** is the primary engine (rootless; the bind mount is
  labelled `:Z` for SELinux hosts like Fedora). `CONTAINER_ENGINE=docker`
  switches to docker compose; the file is plain Compose spec.
- Three services: `e2e` (build + full Playwright suite),
  `dev` (port 5173) and `preview` (port 4173) for containerised serving.
- `init: true` and `ipc: host` follow Playwright's container guidance
  (zombie-process reaping; Chromium shared-memory exhaustion).
- The image presets `PLAYWRIGHT_BROWSERS_PATH` to its baked-in browsers;
  `scripts/test-e2e.sh` detects that and skips downloading anything.
- `corepack enable` runs first inside the container so the Yarn 4 version
  pinned in `package.json` shadows the image's npm-installed classic yarn.
- The CI e2e job (`verify.yml`) runs in the **same image** with the same
  options, so the local container and CI are the same environment;
  `scripts/test-e2e-container.sh` and `./check.sh` (which prefers the
  container when podman is present, `--e2e-host` to opt out) wrap it.
- Playwright only guarantees bundled browsers against the matching library
  version, so the image tag must equal `devDependencies["@playwright/test"]`.
  `src/versionSync.test.ts` fails the unit suite if `package.json`,
  `compose.yaml` and `verify.yml` ever disagree. Upgrading Playwright is
  therefore: bump the dependency, let the unit test fail, update both pins.

## Consequences

E2e results stop depending on the host distribution; Fedora runs all four
browser projects, WebKit included, and a green local run means a green CI
run because they are the same image. The cost is one more tool (a container
engine) for full local verification — `--no-e2e` and `--e2e-host` remain
for environments without one. Rootless podman maps container root back to
the invoking user, so `node_modules/` and `dist/` written through the bind
mount stay owned by the developer; rootful docker would leave root-owned
files (use rootless, or chown afterwards).
