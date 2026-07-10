---
title: A markdown renderer from scratch
date: 2026-05-12
author: kphoto-team
summary: Zero runtime dependencies means writing your own markdown pipeline — here is the subset, the escaping rules, and the tests.
tags:
  - typescript
  - parsers
series: TypeScript 7 in Practice
episode: 2
---

## Why hand-roll it

This site has a rule: _no runtime dependencies at all_. No markdown library,
no YAML library, no framework. That sounds extreme until you scope it: a blog
needs a well-defined **subset** of markdown, not all of CommonMark.

## The subset

- ATX headings with generated, de-duplicated ids
- paragraphs, `inline code`, **bold**, _emphasis_
- links and images with URL sanitisation
- fenced code blocks, blockquotes, nested lists, horizontal rules

Everything else is escaped, never passed through:

```ts
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_REPLACEMENTS[c] ?? c);
}
```

## What you get for free

Owning the parser means owning the guarantees. Raw HTML in a post becomes
text. A `javascript:` URL collapses to `#`. And every one of those guarantees
is a unit test, which is the real dependency you want.
