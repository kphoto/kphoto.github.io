import { describeTotals } from '../client/liveStats';
import { liveStatsEnabled, type SiteConfig } from '../lib/config';
import { escapeAttribute, escapeHtml } from '../lib/html';

/** Connection details the client reads back from `data-*` attributes. */
function connectionAttributes(config: SiteConfig): string {
  return [
    `data-project-url="${escapeAttribute(config.liveStats.projectUrl)}"`,
    `data-publishable-key="${escapeAttribute(config.liveStats.publishableKey)}"`,
    `data-site-origin="${escapeAttribute(config.url)}"`,
    `data-locale="${escapeAttribute(config.language)}"`,
  ].join(' ');
}

/**
 * The footer's live line (ADR 0022). It ships `hidden` and stays hidden until
 * a request succeeds, so with the backend down — or JavaScript off — the
 * footer is exactly what it was before the feature existed. It deliberately
 * has no `aria-live`: re-announcing numbers every 30 s would be noise
 * (ADR 0015). Renders nothing when live statistics are switched off.
 */
export function renderLiveStats(config: SiteConfig, currentPath: string): string {
  if (!liveStatsEnabled(config)) {
    return '';
  }
  return `<kp-live-stats ${connectionAttributes(config)} data-path="${escapeAttribute(currentPath)}">
<template shadowrootmode="open">
<style>
:host { display: block; }
[hidden] { display: none !important; }
p {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.5rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--muted);
}
.dot {
  inline-size: 0.5rem;
  block-size: 0.5rem;
  border-radius: 50%;
  background: var(--accent);
  align-self: center;
}
@media (prefers-reduced-motion: no-preference) {
  .dot { animation: kp-pulse 2.4s ease-in-out infinite; }
  @keyframes kp-pulse { 50% { opacity: 0.35; } }
}
strong { color: var(--text); font-weight: 600; }
a { color: inherit; }
a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
</style>
<p hidden><span class="dot" aria-hidden="true"></span><strong>Live</strong> <span class="text"></span> <a href="/live/">Live stats →</a></p>
</template>
</kp-live-stats>`;
}

const PLACEHOLDER_TOTALS = describeTotals(
  { siteNow: 0, siteViews1h: 0, siteViews24h: 0 },
  () => '—',
);

/**
 * The `/live/` board: headline totals and the busiest pages. The status line
 * is the only live region, and it only changes when the connection state
 * changes (connecting → shown → unavailable), never on each refresh.
 */
export function renderLiveBoard(config: SiteConfig): string {
  if (!liveStatsEnabled(config)) {
    return '';
  }
  const totals = PLACEHOLDER_TOTALS.map(
    ([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`,
  ).join('');
  return `<kp-live-board ${connectionAttributes(config)}>
<template shadowrootmode="open">
<style>
:host { display: block; }
[hidden] { display: none !important; }
.status {
  margin: 0 0 1.5rem;
  color: var(--muted);
}
.totals {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem;
  margin: 0 0 2rem;
}
.totals div {
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background: var(--surface);
}
dt {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}
dd {
  margin: 0.35rem 0 0;
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}
.table-wrap { overflow-x: auto; }
table {
  inline-size: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
caption {
  text-align: start;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  padding-block-end: 0.5rem;
}
th, td {
  padding: 0.5rem 0.75rem;
  border-block-end: 1px solid var(--border);
  text-align: end;
}
th:first-child, td:first-child {
  text-align: start;
  overflow-wrap: anywhere;
}
th {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 600;
}
td a { color: var(--text); }
td a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.empty { text-align: start; color: var(--muted); }
.updated {
  margin: 1rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--muted);
}
</style>
<p class="status" role="status">Connecting to live statistics…</p>
<div class="board" hidden>
<dl class="totals">${totals}</dl>
<div class="table-wrap">
<table>
<caption>Busiest pages</caption>
<thead><tr><th scope="col">Page</th><th scope="col">Here now</th><th scope="col">Views, 1 h</th><th scope="col">Views, 24 h</th></tr></thead>
<tbody></tbody>
</table>
</div>
<p class="updated">Updated <time></time></p>
</div>
</template>
</kp-live-board>`;
}
