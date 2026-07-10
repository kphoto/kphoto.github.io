# 5. Vite 8 with a custom plugin as the static site generator

Date: 2026-07-09

## Status

Accepted

## Context

We need hashed asset bundling, a fast dev server with reload, and full
control over HTML generation — without adopting a framework or an SSG product
(which would violate ADR 0004 in spirit: the generator _is_ the demo).

## Decision

Vite 8 runs with `appType: 'custom'` and one project plugin, `kphotoSsg`
(`src/ssg/vitePlugin.ts`):

- **dev** — a post-internal middleware renders every route on request from
  the current `content/`, pipes HTML through `transformIndexHtml` (Vite
  client, HMR), watches `content/` for full reloads, and turns
  `ContentValidationError` into a readable in-browser error page.
- **build** — Vite bundles exactly two inputs (`src/client/main.ts`,
  `src/styles/global.css`) with `build.manifest: true`; in `closeBundle` the
  plugin reads the manifest for the hashed names and writes every rendered
  file into `dist/`.
- **preview** — `appType: 'custom'` disables Vite's own HTML serving, so the
  plugin also implements `configurePreviewServer`: trailing-slash routes map
  to `index.html`, extensionless paths 301-redirect to the slash form, and
  unknown paths serve `404.html` with a real 404 status — matching GitHub
  Pages, which is what the Playwright suite runs against.

## Consequences

The generator is ~200 lines we fully understand. Rendering is per-request in
dev (always fresh, plenty fast at this scale). Vite major upgrades touch one
plugin file. The preview middleware exists because of `appType: 'custom'`;
without it `vite preview` serves only raw assets.
