# Writing content

Everything the site shows lives under `content/`. The build validates all of
it and fails with file-scoped messages; the dev server shows the same
messages in the browser and reloads when you save.

## Posts — `content/blog/YYYY-MM-DD-name.md`

The file name is the law: `2026-03-22-good-morning.md` publishes at
`/blog/2026-03-22-good-morning/`. Names use lower-case letters, digits and
hyphens. Because the date is part of the URL, a title may repeat on a
different day — the URL stays unique.

```markdown
---
title: Good morning!
date: 2026-03-22
author: kphoto-team
summary: In which I say Good morning to you
tags:
  - introductions
---

## Good morning

It is almost eleven in the morning eastern time as I type this.
Hope you are doing well.
```

Rules the build enforces:

- `date` must be a real calendar date and must equal the file-name date
- `author` must match a file in `content/authors/`
- `summary` is required (it is shown in lists and in the feed)
- `tags` needs at least one entry; tags are shown on lists and detail pages
- unknown keys are rejected (catches typos like `sereis:`)

### Series (optional)

A post may belong to at most one series:

```yaml
series: TypeScript 7 in Practice
episode: 2
```

`episode` must be an integer ≥ 1, unique within the series, and requires
`series` (and vice versa). Series pages list episodes in ascending order;
posts in a series get previous/next navigation. Spell the series name
identically in every episode — conflicting spellings fail the build.

## Authors — `content/authors/author-id.yml`

The file name (lower-case letters, digits, hyphens) is the author id used in
post frontmatter and in the URL `/authors/author-id/`.

```yaml
name: Casey Rivers # required
email: casey@example.com # optional
bio: Writes about CSS. # optional
avatar: images/authors/x.svg # optional, path under public/
socials: # optional; github/bluesky/mastodon become links
  github: casey-rivers-kphoto
```

## Pages — `content/pages/name.md`

Standalone pages like About and Contact. Frontmatter is just `title:`; the
page publishes at `/name/`. Adding a page does **not** add it to the header —
navigation is deliberate, in `src/components/siteHeader.ts`.

## Markdown subset

Headings (`##`–`######`, with generated ids), paragraphs, `**bold**`,
`*emphasis*`, `` `code` ``, fenced code blocks with a language, links and
images (http, https, mailto and relative URLs only — anything else becomes
`#`), blockquotes (nestable), ordered/unordered/nested lists, horizontal
rules. Raw HTML is always escaped and shown as text, never executed.

## Ordering rules (everywhere)

- Lists of posts: newest first; same-day ties break by slug.
- Series pages: episode ascending.
- Tag and series indexes: alphabetical.
