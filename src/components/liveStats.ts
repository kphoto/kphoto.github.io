import { LIVE_MESSAGE_KEYS, type LiveMessages } from '../client/liveStats.ts';
import type { MessageValue } from '../i18n/format.ts';
import { liveStatsEnabled } from '../lib/config.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import type { RenderContext } from './context.ts';

export function liveMessages(context: RenderContext): LiveMessages {
  const messages: Record<string, MessageValue> = {};
  for (const [name, key] of Object.entries(LIVE_MESSAGE_KEYS)) {
    messages[name] = context.t.resolve(key).value;
  }
  return messages as LiveMessages;
}

function connectionAttributes(context: RenderContext): string {
  const { config, t } = context;
  return [
    `data-project-url="${escapeAttribute(config.liveStats.projectUrl)}"`,
    `data-publishable-key="${escapeAttribute(config.liveStats.publishableKey)}"`,
    `data-site-origin="${escapeAttribute(config.url)}"`,
    `data-locale="${escapeAttribute(t.locale.code)}"`,
    `data-messages="${escapeAttribute(JSON.stringify(liveMessages(context)))}"`,
  ].join(' ');
}

export function renderLiveStats(context: RenderContext, currentPath: string): string {
  if (!liveStatsEnabled(context.config)) {
    return '';
  }
  const { t } = context;
  return `<kp-live-stats ${connectionAttributes(context)} data-path="${escapeAttribute(currentPath)}">
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
<p hidden><span class="dot" aria-hidden="true"></span><strong>${t.html('live.label')}</strong> <span class="text"></span> <a href="${escapeAttribute(context.href('/live/'))}">${t.html('live.link')}</a></p>
</template>
</kp-live-stats>`;
}

export function renderLiveBoard(context: RenderContext): string {
  if (!liveStatsEnabled(context.config)) {
    return '';
  }
  const { t } = context;
  const totals = (['live.here', 'live.views1h', 'live.views24h'] as const)
    .map((key) => `<div><dt>${t.html(key)}</dt><dd>${escapeHtml('—')}</dd></div>`)
    .join('');
  return `<kp-live-board ${connectionAttributes(context)}>
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
<p class="status" role="status">${t.html('live.connecting')}</p>
<div class="board" hidden>
<dl class="totals">${totals}</dl>
<div class="table-wrap">
<table>
<caption>${t.html('live.busiest')}</caption>
<thead><tr><th scope="col">${t.html('live.colPage')}</th><th scope="col">${t.html('live.colNow')}</th><th scope="col">${t.html('live.col1h')}</th><th scope="col">${t.html('live.col24h')}</th></tr></thead>
<tbody></tbody>
</table>
</div>
<p class="updated">${t.html('live.updated')} <time></time></p>
</div>
</template>
</kp-live-board>`;
}
