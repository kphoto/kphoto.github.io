import { rawHtml } from '../i18n/safeHtml.ts';
import { commitUrl, shortCommit, type BuildInfo } from '../lib/buildInfo.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import type { RenderContext } from './context.ts';
import { renderLiveStats } from './liveStats.ts';

const GITHUB_ICON_PATH =
  'M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.786-7.844Z';

export interface FooterContext extends RenderContext {
  readonly buildYear: number;
  readonly build: BuildInfo;
}

export function renderBuildLine(context: FooterContext): string {
  const { commit, modified } = context.build;
  if (commit === null) {
    return '';
  }
  const link = rawHtml(
    `<a class="commit" href="${escapeAttribute(commitUrl(context.config.repoUrl, commit))}"><code>${escapeHtml(shortCommit(commit))}</code></a>`,
  );
  const suffix = modified ? ` (${context.t.html('footer.modified')})` : '';
  return ` · ${context.t.html('footer.commit', { commit: link })}${suffix}`;
}

export function renderSiteFooter(context: FooterContext, currentPath: string): string {
  const { t, config } = context;
  return `<kp-footer>
<template shadowrootmode="open">
<style>
:host { display: block; }
footer {
  max-inline-size: var(--measure-wide);
  margin-inline: auto;
  padding: 2rem var(--gutter) 2.5rem;
  border-block-start: 1px solid var(--border);
  display: grid;
  gap: 1.25rem;
}
.repo {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  justify-self: start;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
}
.repo:hover {
  border-color: var(--accent);
}
.repo:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.repo svg {
  inline-size: 1.6rem;
  block-size: 1.6rem;
  fill: currentColor;
  flex-shrink: 0;
}
.repo strong {
  display: block;
  font-size: 0.95rem;
}
.repo span {
  display: block;
  font-size: 0.8rem;
  color: var(--muted);
}
.meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--muted);
}
.meta a {
  color: inherit;
}
.meta a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
code {
  font-family: var(--font-mono);
}
</style>
<footer>
<a class="repo" href="${escapeAttribute(config.repoUrl)}">
<svg viewBox="0 0 19 19" aria-hidden="true"><path fill-rule="evenodd" d="${GITHUB_ICON_PATH}"/></svg>
<span><strong>${t.html('footer.repoTitle', { title: config.title })}</strong><span>${t.html('footer.repoTagline')}</span></span>
</a>
${renderLiveStats(context, currentPath)}
<p class="meta">© ${String(context.buildYear)} · <a href="https://www.gnu.org/licenses/agpl-3.0.html">AGPL-3.0-or-later</a> · ${t.html('footer.builtWith')} · ${t.html('footer.aiDisclosure')} · <a href="${escapeAttribute(context.href('/feed.xml'))}">${t.html('footer.feed')}</a>${renderBuildLine(context)}</p>
</footer>
</template>
</kp-footer>`;
}
