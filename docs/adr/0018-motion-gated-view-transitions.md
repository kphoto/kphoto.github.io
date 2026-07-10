# 18. View transitions are motion-gated; e2e runs emulate reduced motion

Date: 2026-07-10

## Status

Accepted — amends [ADR 0016](0016-chromium-new-headless-channel.md)

## Context

ADR 0016 moved the chromium e2e projects onto the real Chromium build after
Chrome Headless Shell froze on the site's cross-document view transitions.
That held on the Fedora host, but once the suite ran inside the official
Playwright container (ADR 0017) the identical failure returned on
`chromium` and `mobile-chrome` only: the "header navigation reaches every
section" scenario clicks through a chain of real link navigations, and the
second click sits at "waiting for element to be visible, enabled and
stable" for the full 30 s. `firefox` (no cross-document view-transition
support) and `webkit` pass in the same container. The freeze therefore
tracks the view-transition machinery in the containerised Chromium
environment, not any particular headless build — and it would hit the CI
`e2e` job identically, since it runs the same image.

Two facts about the site's CSS mattered:

1. The opt-in was unconditional: `@view-transition { navigation: auto }`.
2. Reduced-motion handling only zeroed the `::view-transition-*`
   animations. A reduced-motion navigation still opted in, still snapshotted
   the old page, and still entered the reveal pipeline — the part that
   freezes — before any animation would have played. This is why ADR 0016
   correctly measured `reducedMotion: 'reduce'` as ineffective at the time.

The CSS View Transitions Level 2 specification allows `@view-transition`
inside conditional group rules, and gating the opt-in itself behind
`@media (prefers-reduced-motion: no-preference)` is the pattern the Chrome
team's own guidance recommends: a motion-sensitive visitor should not have
the capture/reveal machinery engaged at all, not merely see its animations
suppressed.

## Decision

Two halves, one in the product and one in the test rig:

1. **`src/styles/global.css`** wraps the opt-in:

   ```css
   @media (prefers-reduced-motion: no-preference) {
     @view-transition {
       navigation: auto;
     }
   }
   ```

   The `::view-transition-*` animation-zeroing block is deleted — with the
   opt-in gated there is nothing left to neutralise. Under
   `prefers-reduced-motion: reduce` a navigation never opts in, so no
   snapshot is taken and no transition runs. This strengthens the ADR 0015
   motion commitment for real users independently of testing.

2. **`playwright.config.ts`** sets `reducedMotion: 'reduce'` under the
   shared `use.contextOptions` block — reduced motion is a browser-context
   option, not a first-class test option, and this placement is the usage
   Playwright's own documentation shows. Every context in every browser
   project emulates the reduced-motion preference, so e2e navigations take
   the motion-free path: deterministic clicks, no snapshot pipeline to
   freeze, and the wordmark blink (or any future animation) can never
   destabilise an actionability check. This is Playwright's cross-browser
   media emulation rather than the chromium-only
   `--force-prefers-reduced-motion` flag.

ADR 0016's channel choice stands: the authentic Chromium build remains the
right binary to test against.

Alternatives rejected:

- **Skipping transitions only under automation** (a `pagereveal`/`pageswap`
  listener calling `skipTransition()` when `navigator.webdriver` is set) —
  ships automation-detection into production code and creates a path real
  users never take; the reduced-motion path is one real users do take.
- **`click({ force: true })`, `waitForURL` padding, or per-test timeouts**
  — masks the frozen page; later assertions in the same scenario still meet
  it (the reasoning from ADR 0010 and 0016 unchanged).
- **Exercising transitions in one designated project** — reintroduces the
  freeze in exactly the environment (the container) the suite standardised
  on; the transition remains a progressive enhancement verified manually.

## Consequences

The full suite passes in the container and therefore in CI. The e2e suite
now verifies the reduced-motion experience — a real, shipped configuration
— and no longer exercises the view-transition path in any browser; the
transition itself is treated as an unasserted progressive enhancement,
which matches how the site treats browsers that lack the feature entirely
(ADR 0012). Motion-sensitive visitors get a strictly better behaviour:
their navigations no longer engage the snapshot machinery at all. If a
future Playwright/Chromium pairing runs containerised view transitions
reliably, a dedicated project with `reducedMotion: 'no-preference'` can
reintroduce coverage without touching the site.
