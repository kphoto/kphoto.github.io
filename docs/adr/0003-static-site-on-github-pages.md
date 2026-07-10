# 3. Fully static site deployed to GitHub Pages

Date: 2026-07-09

## Status

Accepted

## Context

A blog needs no server-side computation at request time. The repository name
`kphoto.github.io` already implies GitHub Pages, and Pages serves static
files with a global CDN for free.

## Decision

The build produces a plain directory of files (`dist/`): one `index.html`
per route, `404.html`, `feed.xml`, `sitemap.xml` and hashed assets. GitHub
Actions deploys that directory to GitHub Pages on every push to `main`
(ADR 0011). Routes use trailing-slash directory URLs
(`/blog/2026-03-22-good-morning/` → `blog/…/index.html`) because that is the
canonical shape Pages serves without redirects.

## Consequences

There is no server to operate, patch or pay for; the whole runtime attack
surface is the browser. Anything dynamic (theming, the picker) must be
client-side (ADR 0013). GitHub Pages serves the repository's `404.html` for
unknown paths, which the generator produces.
