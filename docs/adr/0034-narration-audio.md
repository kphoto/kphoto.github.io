# 34. Narrated posts: explicit frontmatter, native player

Date: 2026-10-09

## Status

Accepted

## Context

Two posts, in English and Spanish, have AI-generated narrations in
`public/spoken/`. Every other post must stay exactly as it was. Opening a
recording's URL directly made the browser download it instead of playing it.

## Decision

- A post or post translation opts in with `narration: <file>` — a bare file
  name under `public/spoken/`. The file name must use lower-case letters,
  digits and hyphens and a known audio extension (`.wav`, `.mp3`, `.m4a`,
  `.ogg`, `.opus`, `.flac`, `.webm`).
- No naming convention. `good-morning` exists on two dates, so a
  slug-derived file name would be ambiguous.
- `readContentInput` lists `public/spoken/`; `loadSiteModel` fails the build,
  naming the markdown file, when a named recording is missing. Unscheduled
  posts are checked too. Unreferenced recordings are ignored.
- Each language plays its own recording. A translation never inherits the
  original's.
- The post page renders `<kp-narration>`: a captioned native
  `<audio controls preload="metadata">` with a typed `<source>`, the spoken
  `lang`, and a note that the voice is AI-generated and the article is its
  transcript. No autoplay, no custom controls. Post cards say "with audio".
- Recordings ship as the maintainer provided them (16-bit PCM WAV).
  `preload="metadata"` fetches the header only; GitHub Pages serves ranges,
  so seeking works.

## Consequences

Readers never need the raw URL. GitHub Pages already sends `audio/wav`
without `Content-Disposition`; whether a bare WAV URL plays or downloads is
the browser's own choice and is out of the site's control. WAV is large
(about 1 MB per 20 s at 24 kHz mono); converting to Opus later is a file
rename plus one frontmatter line.
