---
title: About
---

kphoto is a demonstration of what is possible with **TypeScript 7 and the
modern web** — a complete blog with no runtime dependencies, no framework and
no external resources, apart from one optional statistics API the site never
waits for.

## What "nothing added" means here

- the static site generator, YAML parser, frontmatter reader and markdown
  renderer are written from scratch in TypeScript
- `tsc` is the TypeScript 7 **native compiler**
- components (header, footer, cards, theme picker) scope their own CSS with
  declarative shadow DOM
- theming, view transitions and persistence use only what evergreen browsers
  ship today

## Live statistics, without tracking

The footer can show how many people are reading right now, and
[the live page](/live/) lists what was read today. No IP addresses, cookies
or stored identifiers are involved, nothing is kept longer than 25 hours,
and visits are not counted if your browser sends Global Privacy Control. If
the statistics server is ever unreachable, the figures quietly disappear and
nothing else changes. [The live page](/live/) spells out exactly what is
collected.

This site stores two things in your browser's local storage: your theme,
and, only if the statistics server was unreachable, when to try it again.

## Built in the open, with AI

The whole project — source, tests, CI and this very page — lives in
[one public repository](https://github.com/kphoto/kphoto.github.io) under
AGPL-3.0-or-later. It is developed with substantial AI/LLM assistance; the
README describes exactly how.

## The stack, in one breath

TypeScript 7 · Vite · Vitest · Playwright · GitHub Actions · GitHub Pages —
and at runtime, none of the above.
