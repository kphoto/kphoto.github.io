# 15. Accessibility commitments: AA contrast, keyboard-first, reduced motion

Date: 2026-07-09

## Status

Accepted

## Context

The requirements state the site should be accessible. On a hand-rolled site
nothing comes for free from a component library, so the commitments need to
be explicit enough to test and review against.

## Decision

The site commits to, and the code enforces:

- **Contrast**: every text/background token pair in every theme meets WCAG
  AA (≥ 4.5:1), verified numerically when palettes change (ADR 0008 records
  the adjusted Solarized values).
- **Keyboard**: a skip link is the first focusable element and moves focus
  to `<main id="main" tabindex="-1">`; all interactive elements are native
  (`<a>`, `<select>`) with visible `:focus-visible` outlines drawn from the
  `--focus` token; nothing requires a pointer.
- **Semantics**: one `<h1>` per page and a sane heading outline; landmarks
  via `<header>`, `<nav aria-label>`, `<main>`, `<footer>`; the current nav
  section carries `aria-current="page"`; the theme picker is a labelled
  `<select>` (visually hidden label), not a custom widget; images carry alt
  text and author avatars describe the person.
- **Motion**: under `prefers-reduced-motion: reduce` the page never opts
  into cross-document view transitions (the snapshot machinery does not
  engage at all — ADR 0018) and the wordmark's cursor-blink animation is
  disabled.
- **Testing**: the Playwright suite exercises the skip link, `aria-current`
  and picker semantics in all four browser projects; markdown-generated
  heading ids give stable in-page anchors.

## Consequences

Custom-styled form controls are off the table unless they preserve native
semantics — a real constraint on future design ideas, accepted. Palette
tweaks carry a contrast-check burden. There is no automated axe-style audit
in CI yet; if one is added, a new ADR will record the tool and its gate.
