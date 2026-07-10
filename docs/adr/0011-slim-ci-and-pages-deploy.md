# 11. Slim GitHub Actions: workflows only call scripts/; deploy on every push

Date: 2026-07-09

## Status

Accepted

## Context

The requirements demand that CI stay minimal — checkout, Node, then the same
scripts a developer runs — so local `./check.sh` and CI cannot drift, and
that every push to `main` deploys to GitHub Pages after the full suite.

## Decision

Three workflows, whose steps are limited to `actions/checkout`,
`corepack enable`, `actions/setup-node` (Node 24, yarn cache) and
`./scripts/*.sh` invocations:

- `verify.yml` — reusable (`workflow_call`): bootstrap → format check → lint
  → typecheck → unit tests → build → e2e. The e2e script installs Playwright
  browsers itself when `CI=true`.
- `ci.yml` — `pull_request` → uses `verify.yml`.
- `deploy.yml` — `push` to `main` (+ manual dispatch): job 1 uses
  `verify.yml`; job 2 (`needs: verify`) bootstraps, builds, then
  `configure-pages@v6` → `upload-pages-artifact@v5` (path `dist`) →
  `deploy-pages@v5`, with `pages: write` + `id-token: write` permissions, the
  `github-pages` environment, and a `pages` concurrency group so deploys
  queue instead of racing.

Action versions are the current majors (checkout v7, setup-node v6) per the
always-latest policy. The repository setting **Pages → Source** must be
**GitHub Actions**.

## Consequences

CI changes are script changes, reviewable and locally runnable; the YAML
almost never needs editing. The verify job runs twice on a PR that lands
(PR + push) — accepted for the drift-proofing. Trade-off: no test-report or
coverage artifacts are uploaded from CI; failures are read from logs, and
anything deeper is reproduced locally with the same scripts. The deploy job
rebuilds rather than reusing the verify job's artifact — a few extra seconds
buys workflow-level decoupling.
