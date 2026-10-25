# 36. A Labs section for interactive explainers

Date: 2026-10-25

## Status

Accepted

## Context

Some lessons need live controls next to the prose: buttons, sliders and a
running animation. Markdown posts escape HTML and cannot host a custom
element, so such a page cannot be a blog post.

## Decision

- Interactive pages live under `/labs/<slug>/`, each rendered by a function in
  `src/pages/labs.ts`; `/labs/` lists them from the `LABS` registry.
- The header gains a "Labs" link. Every lab is localized like any other page
  and appears in the sitemap with hreflang alternates.
- Prose comes from the typed catalogs; code samples are TypeScript constants,
  escaped, in keyboard-focusable `<pre>` blocks.
- A lab's widget is a declarative-shadow-DOM component with scoped styles
  (ADR 0007), upgraded by `src/client/` code with pure, injected logic.

## Consequences

Adding a lab is one render function, one registry entry and its catalog
keys. Lab text must be translated before Spanish is complete; the catalog
test enforces it.
