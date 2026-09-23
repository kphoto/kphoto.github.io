# 23. Live statistics privacy model: no IPs, no identifiers on the device

Date: 2026-09-23

## Status

Accepted

## Context

Counting "people here now" needs some way to tell one open tab from another. The
requirements rule out raw IP addresses and any personally identifiable information, and
there is no authentication. Browser storage could hold a visitor id, but a persistent
identifier on the device is exactly what cookie-consent law and ordinary decency both
object to.

## Decision

- **Per-page-view identifier in memory only.** Each page load creates a random UUID with
  `crypto.randomUUID()`. It is never written to cookies or to any storage, and it is
  never reused: the next page gets a new one.
- **Presence is short-lived.** While the tab is visible it checks in every 30 s. When the
  tab is hidden or unloaded, it sends `kp_leave` with `keepalive`. If that request is
  lost, the server stops counting the tab 90 s after its last check-in, and pg_cron
  deletes the row within five minutes (ADR 0024).
- **Views are aggregate from the start.** A page view is only `+1` on a per-path,
  per-UTC-minute counter. No row ever links a view to a visitor, and counters are deleted
  after 25 hours.
- **The database cannot hold personal data.** The tables have no column for an IP
  address, user agent, referrer or account. PostgREST sees the caller's IP, as every web
  server does, but nothing stores it.
- **The path comes from the page, not the URL bar.** The server-rendered `data-path` is
  sent, never `location.pathname`, so the 404 page reports `/404.html` rather than
  whatever URL someone typed. Paths are validated identically on both ends
  (`isSafePath` and `kphoto_stats.valid_path`).
- **Counting is opt-out by default.** A visit is counted (`track` mode) only when all of
  these hold:
  - the page is on the production origin (`siteConfig.url`);
  - `navigator.webdriver` is false;
  - the browser does not send Global Privacy Control.

  Every other visitor gets read-only `observe` mode. That covers the dev server,
  `vite preview`, forks, Playwright and GPC users, who still see the numbers but add none.

- `/live/` explains all of this in plain language.

## Consequences

"Here now" counts tabs rather than people: two open tabs count twice. Opening a page in a
background tab counts nothing until it is first shown. Local development and the e2e suite
can never pollute production numbers. Nothing here needs a consent banner, because
nothing is stored on the device except the breaker's retry-after time (ADR 0025), which
identifies no one.
