# 42. An optional handwriting font, remembered like the theme

Date: 2026-11-17

## Status

Accepted. Amends ADRs 0008 and 0013.

## Context

The repository gained a custom handwriting font, "My Hand", made with
Ductus, as `public/fonts/regular.woff2` (and a TTF copy of the same font).
Readers should be able to switch to it, switch back, and have the browser
remember the choice. The font is a proof of concept: 106 code points, basic
ASCII plus a little typographic punctuation, no accented letters, no bold or
italic, and a low, narrow x-height.

## Decision

- **A setting, not a theme.** `font: 'standard' | 'handwriting'` is an
  optional field of `kphoto:settings:v1`, validated by `isFontName` and
  dropped when unrecognised. Font and theme are independent, so any theme
  can be read in either font. `FontController` (`src/client/font.ts`) reads,
  writes and applies it through an injected `FontHost`.
- **Applied before first paint.** The inline pre-paint script (ADR 0008)
  reads the same key once and sets `data-font` next to `data-theme`; the
  server renders `data-font="standard"`. For the handwriting choice it also
  injects `<link rel="preload" as="font" crossorigin>` so the file is
  requested before the stylesheet asks for it. `FONT_FILES` is the single
  source of that URL; a unit test checks that `global.css` declares the
  same URL and that the file exists in `public/`.
- **Only body text changes.** `[data-font='handwriting']` redefines
  `--font-body` as the handwriting face over `--font-sans`. `--font-mono`
  is untouched, so code, metadata and labels stay monospace.
- **WOFF2 only, loaded only when used.** Every supported browser reads
  WOFF2 (ADR 0012); `@font-face` downloads nothing until a reader picks the
  font. `font-display: swap` keeps text visible; `size-adjust: 115%`
  compensates for the small x-height.
- **Missing glyphs fall back per character.** Accented letters, `¿`, `¡`
  and symbols render in the system font. That is visible in Spanish and
  accepted: extending the font is outside the generator's scope, and the
  standard font is always one choice away.
- **One picker component.** `renderSettingSelect` renders both the theme and
  font pickers with the same scoped styles; `defineSettingSelect` upgrades
  both in the browser.

## Consequences

Readers who never choose the font never download it. The TTF is not
referenced and should not be in `public/`, which is copied verbatim into
every deployment. Adding another font is one entry in `FONTS`, one in
`FONT_FILES`, one `@font-face`, two message keys and one CSS rule. The font
is the project owner's own handwriting and ships under the repository
license.
