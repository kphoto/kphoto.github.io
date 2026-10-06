import { formatMessage } from '../i18n/format.ts';
import {
  browserClock,
  browserLifecycle,
  browserSchedule,
  browserStore,
  sendsGlobalPrivacyControl,
} from './browser.ts';
import { CircuitBreaker } from './circuitBreaker.ts';
import { LivePoller } from './livePoller.ts';
import {
  BOARD_INTERVAL_MS,
  boardRowViews,
  BREAKER_COOLDOWN_MS,
  BREAKER_KEY,
  chooseTrackingMode,
  describeSummary,
  parseLiveMessages,
  totalsValues,
  type LiveMessages,
  HEARTBEAT_INTERVAL_MS,
  isSafePath,
  makeCountFormatter,
  MAX_CONSECUTIVE_FAILURES,
  MIN_POLL_GAP_MS,
  type LiveBoard,
} from './liveStats.ts';
import { isRetryable, LiveStatsApi } from './liveStatsApi.ts';

const breaker = new CircuitBreaker({
  store: browserStore,
  clock: browserClock,
  key: BREAKER_KEY,
  maxFailures: MAX_CONSECUTIVE_FAILURES,
  cooldownMs: BREAKER_COOLDOWN_MS,
});

const pollerEnvironment = {
  isRetryable,
  minGapMs: MIN_POLL_GAP_MS,
  schedule: browserSchedule,
  lifecycle: browserLifecycle,
  clock: browserClock,
  breaker,
} as const;

interface Connection {
  readonly api: LiveStatsApi;
  readonly siteOrigin: string;
  readonly locale: string;
  readonly messages: LiveMessages;
}

function readConnection(element: HTMLElement): Connection | null {
  const { projectUrl, publishableKey, siteOrigin, locale } = element.dataset;
  const messages = parseLiveMessages(element.dataset.messages);
  if (
    projectUrl === undefined ||
    publishableKey === undefined ||
    publishableKey === '' ||
    siteOrigin === undefined ||
    messages === null
  ) {
    return null;
  }
  return {
    api: new LiveStatsApi({
      projectUrl,
      publishableKey,
      fetch: (url, init) => fetch(url, init),
      timeoutSignal: (ms) => AbortSignal.timeout(ms),
    }),
    siteOrigin,
    locale: locale ?? 'en',
    messages,
  };
}

class LiveStatsElement extends HTMLElement {
  connectedCallback(): void {
    const panel = this.shadowRoot?.querySelector('p');
    const text = this.shadowRoot?.querySelector('.text');
    const connection = readConnection(this);
    const path = this.dataset.path;
    if (!panel || !text || connection === null || !isSafePath(path)) {
      return;
    }
    const { api } = connection;
    const mode = chooseTrackingMode({
      pageOrigin: location.origin,
      siteOrigin: connection.siteOrigin,
      webdriver: navigator.webdriver,
      globalPrivacyControl: sendsGlobalPrivacyControl(),
    });

    const viewerId = crypto.randomUUID();

    new LivePoller({
      ...pollerEnvironment,
      intervalMs: HEARTBEAT_INTERVAL_MS,
      task: ({ newView }) =>
        mode === 'track' ? api.heartbeat(viewerId, path, newView) : api.summary(path),
      onData: (summary) => {
        text.textContent = describeSummary(summary, connection.messages, connection.locale);
        panel.hidden = false;
      },
      onFailure: () => {
        panel.hidden = true;
      },
      onAway:
        mode === 'track'
          ? () => {
              void api.leave(viewerId);
            }
          : null,
    }).start();
  }
}

class LiveBoardElement extends HTMLElement {
  connectedCallback(): void {
    const root = this.shadowRoot;
    const status = root?.querySelector<HTMLElement>('.status');
    const board = root?.querySelector<HTMLElement>('.board');
    const tbody = root?.querySelector('tbody');
    const values = root ? [...root.querySelectorAll('dd')] : [];
    const updated = root?.querySelector('time');
    const connection = readConnection(this);
    if (!status || !board || !tbody || !updated || connection === null) {
      return;
    }
    const format = makeCountFormatter(connection.locale);
    const clock = new Intl.DateTimeFormat(connection.locale, { timeStyle: 'medium' });
    let hasData = false;

    const setStatus = (message: string | null): void => {
      const next = message ?? '';
      if (status.textContent !== next) {
        status.textContent = next;
      }
      status.hidden = message === null;
    };

    const render = (data: LiveBoard): void => {
      totalsValues(data, format).forEach((value, index) => {
        const cell = values[index];
        if (cell) {
          cell.textContent = value;
        }
      });
      const rows = boardRowViews(data, format).map((row) => {
        const tr = document.createElement('tr');
        const page = document.createElement('td');
        const link = document.createElement('a');
        link.href = row.path;
        link.textContent = row.path;
        page.append(link);
        tr.append(page);
        for (const value of row.cells) {
          const td = document.createElement('td');
          td.textContent = value;
          tr.append(td);
        }
        return tr;
      });
      if (rows.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.className = 'empty';
        td.textContent = formatMessage(connection.locale, connection.messages.empty);
        tr.append(td);
        rows.push(tr);
      }
      tbody.replaceChildren(...rows);
      const now = new Date();
      updated.dateTime = now.toISOString();
      updated.textContent = clock.format(now);
    };

    new LivePoller({
      ...pollerEnvironment,
      intervalMs: BOARD_INTERVAL_MS,
      task: () => connection.api.board(),
      onData: (data) => {
        render(data);
        hasData = true;
        board.hidden = false;
        setStatus(null);
      },
      onFailure: (tripped) => {
        if (tripped) {
          board.hidden = true;
          setStatus(formatMessage(connection.locale, connection.messages.unavailable));
        } else {
          setStatus(
            formatMessage(
              connection.locale,
              hasData ? connection.messages.reconnecting : connection.messages.stillTrying,
            ),
          );
        }
      },
      onAway: null,
    }).start();
  }
}

export function defineLiveStatsElements(): void {
  customElements.define('kp-live-stats', LiveStatsElement);
  customElements.define('kp-live-board', LiveBoardElement);
}
