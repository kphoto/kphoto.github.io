# 25. Visibility-gated polling with a persisted circuit breaker

Date: 2026-09-23

## Status

Accepted

## Context

"Live" can mean pushed updates (Supabase Realtime over WebSocket) or polling. Realtime
needs the SDK or a hand-written Phoenix-channel client, a socket per tab, and counts
against the free tier's 200-connection and message quotas. Whichever transport is used,
a dead backend must not cost readers anything: no hung requests, no retry storms, no
error UI.

## Decision

- **Polling over plain `fetch`.** The footer polls every 30 s (`HEARTBEAT_INTERVAL_MS`)
  and `/live/` every 20 s. `LivePoller` (`src/client/livePoller.ts`) runs one request at a
  time, and only while `document.visibilityState` is `visible`. Hiding the tab cancels
  the timer and sends `kp_leave`. Returning to it re-polls promptly, but never sooner than
  5 s after the previous request. A back/forward-cache restore counts as a new view.
- **The new-view flag survives failure.** `newView` stays true until a request succeeds,
  so a failed first heartbeat is retried as the view it was meant to count, and never
  counted twice.
- **Every request is bounded** by `AbortSignal.timeout(5000)`.
- **Failures are classified by `LiveStatsApi`:**
  - network errors, timeouts, 5xx and 408 are _retryable_;
  - every other 4xx, and any unparseable or wrong-shaped body, is _permanent_. That
    covers 400, a bad or revoked key (401/403), an exhausted free-tier quota (402),
    missing functions (404), 405 and 429.
- **`CircuitBreaker`** (`src/client/circuitBreaker.ts`) opens on the third consecutive
  retryable failure, or at once on a permanent one. It writes a retry-after timestamp to
  `localStorage` (`kphoto:live-stats:retry-after:v1`, ten minutes ahead), so every page on
  that browser skips live statistics until then. A paused project costs a visitor at most
  three failed requests per ten minutes, not one per page view.
- **Rendering bugs are not backend failures.** An exception thrown by the render callback
  is rethrown via `queueMicrotask`, so it surfaces normally without tripping the breaker.
- **All dependencies are injected** (clock, scheduler, lifecycle, storage, `fetch`,
  timeout signal), so the logic is unit-tested with manual fakes (`liveTestDoubles.ts`)
  and mutation-checked. The DOM glue in `liveStatsElements.ts` and `browser.ts` is
  covered end to end instead.

## Consequences

Figures can lag by up to one interval, which is fine for a blog. A tab costs about two
small requests a minute while visible and nothing while hidden. After an outage, a
browser picks the feature back up within ten minutes, with no code change.

Assistive technology is not spammed:

- the footer line has no live region;
- the board's `role="status"` element changes only on connection-state transitions, never
  on each refresh (ADR 0015).
