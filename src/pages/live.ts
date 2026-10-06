import { renderLiveBoard } from '../components/liveStats.ts';
import { rawHtml } from '../i18n/safeHtml.ts';
import { liveStatsEnabled } from '../lib/config.ts';
import { escapeAttribute } from '../lib/html.ts';
import { renderDocument, type PageContext } from './layout.ts';

export function renderLivePage(context: PageContext): string {
  const { t } = context;
  const enabled = liveStatsEnabled(context.config);
  const board = enabled
    ? `${renderLiveBoard(context)}
<noscript><p>${t.html('live.noscript')}</p></noscript>`
    : `<p class="lede">${t.html('live.off')}</p>`;
  const gpc = rawHtml('<a href="https://globalprivacycontrol.org/">Global Privacy Control</a>');
  const supabase = rawHtml('<a href="https://supabase.com/">Supabase</a>');
  const repo = rawHtml(
    `<a href="${escapeAttribute(context.config.repoUrl)}">${t.html('live.repoLink')}</a>`,
  );
  const main = `<header class="page-header">
<p class="eyebrow">${t.html('live.eyebrow')}</p>
<h1>${t.html('live.title')}</h1>
<p class="lede">${t.html('live.lede')}</p>
</header>
${board}
<section class="prose" aria-labelledby="live-privacy">
<h2 id="live-privacy">${t.html('live.privacyHeading')}</h2>
<p>${t.html('live.privacy1')}</p>
<p>${t.html('live.privacy2')}</p>
<p>${t.html('live.privacy3', { gpc, supabase, repo })}</p>
</section>`;
  return renderDocument(
    context,
    {
      title: t.text('live.title'),
      description: t.text('live.description'),
      path: context.href('/live/'),
      alternates: context.everyLocale('/live/'),
    },
    main,
  );
}
