# 4. Zero runtime dependencies; hand-rolled parsers and generator

Date: 2026-07-09

## Status

Accepted

## Context

The point of the project is to show how far TypeScript 7 and the platform go
_with nothing added_. A markdown library, a YAML library or a framework would
each dissolve the premise. It also removes an entire class of supply-chain
risk from the shipped site.

## Decision

`package.json` has **no `dependencies` section** — only `devDependencies`.
No CSS framework, no client framework, no external fonts, analytics or CDNs;
the deployed site makes requests only to its own origin. Consequently the
YAML subset parser, frontmatter reader, markdown renderer, feed/sitemap
builders and the static site generator itself are written in this repository,
each behind a small interface with exhaustive unit tests.

The markdown and YAML implementations are deliberate _subsets_ (documented in
`docs/content-authoring.md`): everything this site's content needs, nothing
more. Raw HTML in content is always escaped; link/image URLs are restricted
to http, https, mailto and relative paths.

## Consequences

We own every guarantee (escaping, sanitisation, ordering) and every bug; the
test suite is the real dependency. Exotic markdown/YAML features are
unsupported by design — the validators reject them loudly rather than
half-supporting them. Build tooling (Vite, Vitest, Playwright, ESLint,
TypeScript) remains, as devDependencies only.
