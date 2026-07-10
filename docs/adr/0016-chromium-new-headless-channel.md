# 16. Chromium e2e projects run the real browser via channel 'chromium'

Date: 2026-07-10

## Status

Accepted

## Context

The e2e scenario "header navigation reaches every section" started timing
out after 30 s — on the `chromium` and `mobile-chrome` projects only, both
locally and in CI, while `firefox` and `webkit` passed. The Playwright log
showed a click on a header link stuck at "waiting for element to be visible,
enabled and stable" after an earlier link click had already navigated once.

Playwright's default headless Chromium is **Chrome Headless Shell**, a
stripped build maintained for backwards compatibility. Reproducing against
the shell build of Chromium 149 (the version Playwright 1.61 pins) isolated
the cause: with the site's cross-document view transitions active
(`@view-transition { navigation: auto }` in `src/styles/global.css`,
ADR 0012), a renderer-initiated navigation — a real link click, not
`page.goto()` — leaves the incoming document's rendering pipeline frozen.
`pagereveal` never fires, `requestAnimationFrame` callbacks never run, and
even Chromium's own four-second view-transition skip timeout never triggers.
Playwright considers an element stable only after two consecutive animation
frames, so every subsequent click waits forever. Only this one scenario
clicks through a chain of navigations, which is why only it failed. Removing
`@view-transition` from the built CSS unfroze the shell, confirming the
interaction; the full Chromium build in "new headless" mode runs the same
transition to completion (`pagereveal` fires with a live `ViewTransition`,
frames keep flowing), matching what real browsers do on the site.

## Decision

Set `channel: 'chromium'` on the `chromium` and `mobile-chrome` projects in
`playwright.config.ts`. Playwright documents this channel as opting headless
runs into the **real Chromium build in "new headless" mode** instead of the
shell — its recommended path when shell behaviour diverges. The view
transition itself stays: it is a showcased platform feature and it is not
the bug; the shell's frozen rendering loop is. Since nothing uses the shell
any more, browser installs pass `--no-shell` (`scripts/test-e2e.sh`).

Alternatives rejected:

- **Removing or build-time-gating `@view-transition`** — sacrifices a
  documented feature of the site to accommodate a test-only browser build.
- **`reducedMotion: 'reduce'` in the Playwright config** — verified
  ineffective: the pipeline freezes before any animation would play, so the
  reduced-motion CSS (which this site ships, ADR 0015) never gets a frame.
- **`click({ force: true })` or added timeouts** — masks the symptom,
  violates the testing rule of waiting for real events instead of padding
  timeouts (ADR 0010), and later assertions still meet a frozen page.

## Consequences

Chromium scenarios now run on the same binary users run, trading the
shell's slightly faster startup for fidelity — the exact trade Playwright's
documentation recommends when the two diverge. The shell is no longer
downloaded anywhere. If a future Chromium fixes the shell's view-transition
handling, reverting is a two-line config change; the config comment points
back to this record.
