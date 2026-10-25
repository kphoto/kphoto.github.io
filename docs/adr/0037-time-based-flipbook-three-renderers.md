# 37. Time-based flipbook drawn three ways, without WebGL or a framework

Date: 2026-10-25

## Status

Accepted

## Context

flappingairplanes.com animates a hand-drawn airplane with React and regl
(WebGL): 29 PNG frames become textures, `floor(time × 12) % 29` picks one, a
fluid simulation flows around a luminance mask of the drawing, and scrolling
tilts the airplane up to 14° before fading it out. The lab must teach how the
flapping works with zero runtime dependencies.

## Decision

- Reproduce the flipbook only: 28 frames (`frame_001.png`–`frame_028.png`),
  12 fps by default, adjustable from 1 to 60.
- The frame comes from elapsed time, never from counting refreshes.
  `FlipbookTimeline` (`src/lib/flipbook.ts`) keeps a fractional anchor so
  play, pause, seek, step and rate changes never jump; time is injected.
- Every frame is fetched and `decode()`d before playback; the canvas gets
  `ImageBitmap`s.
- Three interchangeable surfaces behind one `FrameSurface` port: `<img>`
  source swap, 2D canvas `drawImage`, and CSS `@keyframes` with `step-end`.
  The CSS surface is the server-rendered default, so the drawing plays
  without JavaScript; with script, the Web Animations API sets its
  `currentTime` and play state.
- `FlipbookController` is DOM-free and unit-tested with fakes;
  `flipbookElement.ts` is the only DOM code. A `requestAnimationFrame` loop
  runs only while the flipbook is on screen (`IntersectionObserver`) and
  paints only when the frame changes.
- The scroll tilt and fade are reproduced as pure functions and driven by a
  "Climb" slider instead of the page scroll.
- Theme tokens `--ink-filter` and `--ink-blend` turn the cream paper into the
  page colour: grayscale and contrast, then `multiply`; dark themes add
  `invert(1)` and use `screen`.
- Reduced motion starts paused unless the reader chose otherwise; rate,
  technique and play state persist in `kphoto:flipbook:v1` (ADR 0013).

## Consequences

The motion looks identical in all three techniques, which is the lesson.
The fluid simulation is explained, not reproduced. The client bundle grows
by a few kilobytes on every page because the site ships one script.
