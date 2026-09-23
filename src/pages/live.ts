import { renderLiveBoard } from '../components/liveStats';
import { liveStatsEnabled } from '../lib/config';
import { escapeAttribute } from '../lib/html';
import { renderDocument, type PageContext } from './layout';

/**
 * `/live/`: live readership, plus a plain-language account of exactly what is
 * collected. The page always exists (stable sitemap, stable links); what it
 * shows depends on whether this build has live statistics switched on and,
 * at runtime, on whether the backend answers (ADR 0022).
 */
export function renderLivePage(context: PageContext): string {
  const enabled = liveStatsEnabled(context.config);
  const board = enabled
    ? `${renderLiveBoard(context.config)}
<noscript><p>Live statistics need JavaScript. Everything else on this site works without it.</p></noscript>`
    : '<p class="lede">Live statistics are switched off in this build. Everything else on the site works exactly the same.</p>';
  const main = `<header class="page-header">
<p class="eyebrow">Live</p>
<h1>Live statistics</h1>
<p class="lede">Who is reading right now, and what was read in the last day. Nothing older than 25 hours exists anywhere.</p>
</header>
${board}
<section class="prose" aria-labelledby="live-privacy">
<h2 id="live-privacy">What is collected</h2>
<p>While a page is open and visible, your browser checks in every 30 seconds with three things: a random identifier it made up when the page loaded (held only in memory — never in a cookie or in storage), the page's path, and whether this is a new page view. Hiding or closing the tab removes the identifier straight away; if that message is lost, it stops counting 90 seconds later and is deleted within minutes.</p>
<p>Page views are kept only as a count per page per minute, and those counts are deleted after 25 hours. No IP address, browser details, referrer or account is stored — the database has nowhere to put them.</p>
<p>Visits are not counted at all if your browser sends <a href="https://globalprivacycontrol.org/">Global Privacy Control</a>, or for automated browsers. The numbers come from an optional free-tier <a href="https://supabase.com/">Supabase</a> database; if it is ever unavailable, the live figures simply disappear and the rest of the site is unaffected. The whole design, including the database schema, is in the <a href="${escapeAttribute(context.config.repoUrl)}">public repository</a>.</p>
</section>`;
  return renderDocument(
    context,
    {
      title: 'Live statistics',
      description: 'Live, privacy-preserving readership statistics for this site.',
      path: '/live/',
    },
    main,
  );
}
