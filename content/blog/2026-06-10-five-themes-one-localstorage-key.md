---
title: Five themes, one localStorage key
date: 2026-06-10
author: casey-rivers
summary: How the theme system resolves “system”, persists your choice, and repaints before the first frame.
tags:
  - css
  - web-platform
  - site-notes
---

## The moving parts

The picker in the header offers _system_, _light_, _dark_, _solarized light_
and _solarized dark_. Your choice lands in one versioned localStorage key:

```json
{ "theme": "solarized-dark" }
```

## No flash of the wrong theme

A tiny inline script in `<head>` reads that key and sets `data-theme` on
`<html>` **before the first paint**. The stylesheet only ever paints from
tokens, so the very first frame is already correct.

## Following the OS

Choosing _system_ keeps a `prefers-color-scheme` listener alive: flip your OS
between light and dark and the page follows, without touching your saved
preference. Every colour pair in every theme was checked against WCAG AA —
the solarized values are lightly adjusted where the classic palette falls
short on contrast.
