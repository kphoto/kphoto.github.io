# 12. Evergreen-browser baseline: DSD, view transitions, modern CSS units

Date: 2026-07-09

## Status

Accepted

## Context

The requirements explicitly target evergreen browsers only. That permission
is what makes the zero-dependency approach pleasant instead of painful: the
platform features this site leans on are all present in current Chrome,
Firefox and Safari, but not in anything older.

## Decision

The baseline is "current evergreen releases" (all four Playwright projects
must pass), and the site freely uses: declarative shadow DOM (ADR 0007),
`@view-transition { navigation: auto }` for cross-document page transitions,
`100svh`/`min()` and CSS nesting-free modern layout, `:focus-visible`,
`prefers-color-scheme` and `prefers-reduced-motion` (which also disables the
view transitions), `loading="lazy"` images, and ES modules with no
transpilation below Vite's `baseline-widely-available` target.

No polyfills, no `@supports` ladders, no graceful-degradation branches:
where a feature is progressive by nature (view transitions simply don't
animate in browsers that lack them), that is the entire fallback story.

## Consequences

The shipped JavaScript stays tiny because it assumes a modern runtime. Users
on old browsers get a functional but unpolished experience (DSD is the one
hard requirement; every evergreen engine has shipped it for years). The
Playwright matrix is the definition of "supported" — if it passes there, it
is supported; if a regression appears in a new browser release, the e2e
suite is where it surfaces.
