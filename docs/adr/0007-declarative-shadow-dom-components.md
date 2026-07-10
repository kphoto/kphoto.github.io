# 7. Components are server-rendered custom elements with declarative shadow DOM

Date: 2026-07-09

## Status

Accepted

## Context

The requirements call for reusable components (header, navbar/nav, footer,
cards) _each with scoped CSS_, but ADR 0004 forbids frameworks and CSS-module
tooling. The platform's own scoping mechanism is shadow DOM, and declarative
shadow DOM (`<template shadowrootmode>`) is supported by every evergreen
browser.

## Decision

Each component is a `renderX(): string` function emitting a custom element
(`<kp-header>`, `<kp-post-card>`, …) whose children are a
`<template shadowrootmode="open">` containing a scoped `<style>` and the
markup. The browser attaches the shadow root **while parsing** — no
JavaScript, no flash of unstyled content. Theming pierces the boundary via
CSS custom properties defined globally per `[data-theme]` (ADR 0008). The
only component with behaviour, the theme picker, is upgraded by
`customElements.define` in `main.ts` and _adopts_ the server-rendered shadow
root instead of re-rendering.

## Consequences

Component styles cannot leak in either direction; global CSS shrinks to
tokens, layout and prose. Pages using components in light DOM declare
`display: block` defaults for the custom-element tags. Duplicate `<style>`
text per component instance is accepted at this scale (it gzips away).
Everything renders and is testable as plain strings.
