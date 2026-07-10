---
title: Scoped styles with declarative shadow DOM
date: 2026-05-19
author: casey-rivers
summary: Every component on this site scopes its own CSS with declarative shadow DOM — no build-time CSS modules, just the platform.
tags:
  - css
  - web-platform
series: TypeScript 7 in Practice
episode: 3
---

## Components without a framework

The header, footer, post cards and theme picker on this page are custom
elements rendered as strings on the server. Each one carries its styles in a
declarative shadow root:

```html
<kp-post-card>
  <template shadowrootmode="open">
    <style>
      /* scoped to this component */
    </style>
    <article>…</article>
  </template>
</kp-post-card>
```

The browser attaches the shadow root **during parsing** — no JavaScript
required, no flash of unstyled content.

## How theming pierces the boundary

Shadow DOM blocks outside selectors, but _CSS custom properties inherit
through it_. The global stylesheet defines tokens like `--accent` per theme;
each component consumes them from inside its own scope. Change
`data-theme` on `<html>` and every shadow tree recolours itself.

## The one JavaScript exception

The theme picker upgrades from static markup to a live control in
`main.ts` — it adopts the server-rendered shadow root instead of re-rendering
it. That is the whole hydration story.
