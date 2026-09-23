import { describe, expect, it } from 'vitest';
import { CircuitBreaker } from './circuitBreaker';
import { LivePoller, type PollContext } from './livePoller';
import { isRetryable, LiveStatsRequestError } from './liveStatsApi';
import { FakeLifecycle, flush, ManualClock, ManualScheduler, MemoryStore } from './liveTestDoubles';

const INTERVAL = 30_000;
const MIN_GAP = 5_000;

type Outcome = 'ok' | 'network' | 'fatal';

function setup(options: { visible?: boolean; store?: MemoryStore; away?: boolean } = {}) {
  const clock = new ManualClock();
  const scheduler = new ManualScheduler(clock);
  const lifecycle = new FakeLifecycle();
  lifecycle.visible = options.visible ?? true;
  const store = options.store ?? new MemoryStore();
  const breaker = new CircuitBreaker({
    store,
    clock,
    key: 'k',
    maxFailures: 3,
    cooldownMs: 600_000,
  });
  const contexts: PollContext[] = [];
  const data: number[] = [];
  const failures: boolean[] = [];
  let aways = 0;
  const outcomes: Outcome[] = [];
  let pending: (() => void) | null = null;
  let hold = false;

  const poller = new LivePoller<number>({
    task: (context) => {
      contexts.push(context);
      const outcome = outcomes.shift() ?? 'ok';
      const settle = (): Promise<number> =>
        outcome === 'ok'
          ? Promise.resolve(contexts.length)
          : Promise.reject(
              outcome === 'network'
                ? new TypeError('Failed to fetch')
                : new LiveStatsRequestError('HTTP 404', 404, false),
            );
      if (!hold) {
        return settle();
      }
      return new Promise<number>((resolve, reject) => {
        pending = () => {
          settle().then(resolve, reject);
        };
      });
    },
    onData: (value) => data.push(value),
    onFailure: (tripped) => failures.push(tripped),
    onAway:
      options.away === false
        ? null
        : () => {
            aways += 1;
          },
    isRetryable,
    intervalMs: INTERVAL,
    minGapMs: MIN_GAP,
    schedule: scheduler.schedule,
    lifecycle,
    clock,
    breaker,
  });

  return {
    poller,
    clock,
    scheduler,
    lifecycle,
    store,
    contexts,
    data,
    failures,
    outcomes,
    aways: () => aways,
    holdRequests: () => {
      hold = true;
    },
    release: async () => {
      const release = pending;
      pending = null;
      release?.();
      await flush();
    },
    async tickAfter(ms: number) {
      scheduler.advance(ms);
      await flush();
    },
  };
}

describe('LivePoller start-up', () => {
  it('polls immediately when visible, then every interval', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    expect(t.contexts).toHaveLength(1);
    expect(t.data).toEqual([1]);
    expect(t.scheduler.pendingDelays()).toEqual([INTERVAL]);
    await t.tickAfter(INTERVAL);
    expect(t.contexts).toHaveLength(2);
  });

  it('does nothing while a background tab stays hidden', async () => {
    const t = setup({ visible: false });
    t.poller.start();
    await t.tickAfter(10 * INTERVAL);
    expect(t.contexts).toHaveLength(0);
  });

  it('starts once a hidden tab becomes visible', async () => {
    const t = setup({ visible: false });
    t.poller.start();
    t.lifecycle.setVisible(true);
    await t.tickAfter(0);
    expect(t.contexts).toHaveLength(1);
  });

  it('never starts while the persisted breaker is open', async () => {
    const store = new MemoryStore();
    store.set('k', String(Number.MAX_SAFE_INTEGER));
    const t = setup({ store });
    t.poller.start();
    await t.tickAfter(10 * INTERVAL);
    expect(t.contexts).toHaveLength(0);
    expect(t.failures).toEqual([true]);
  });
});

describe('LivePoller new-view flag', () => {
  it('is true for the first request only', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    await t.tickAfter(INTERVAL);
    expect(t.contexts.map((c) => c.newView)).toEqual([true, false]);
  });

  it('stays true until a request succeeds, so a failed view is retried as a view', async () => {
    const t = setup();
    t.outcomes.push('network');
    t.poller.start();
    await flush();
    await t.tickAfter(INTERVAL);
    await t.tickAfter(INTERVAL);
    expect(t.contexts.map((c) => c.newView)).toEqual([true, true, false]);
  });

  it('is true again after a back/forward-cache restore', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    t.lifecycle.hide();
    await t.tickAfter(60_000);
    t.lifecycle.show(true);
    await t.tickAfter(0);
    expect(t.contexts.map((c) => c.newView)).toEqual([true, true]);
  });

  it('ignores an ordinary (non-restored) pageshow', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    t.lifecycle.show(false);
    await t.tickAfter(MIN_GAP);
    expect(t.contexts).toHaveLength(1);
  });
});

describe('LivePoller visibility', () => {
  it('stops polling and reports away when hidden', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    t.lifecycle.setVisible(false);
    expect(t.aways()).toBe(1);
    expect(t.scheduler.pendingDelays()).toEqual([]);
    await t.tickAfter(10 * INTERVAL);
    expect(t.contexts).toHaveLength(1);
  });

  it('reports away on pagehide', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    t.lifecycle.hide();
    expect(t.aways()).toBe(1);
  });

  it('tolerates a null away handler', async () => {
    const t = setup({ away: false });
    t.poller.start();
    await flush();
    expect(() => {
      t.lifecycle.setVisible(false);
    }).not.toThrow();
  });

  it('re-polls promptly on return, but never faster than the minimum gap', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    await t.tickAfter(1_000);
    t.lifecycle.setVisible(false);
    t.lifecycle.setVisible(true);
    expect(t.scheduler.pendingDelays()).toEqual([MIN_GAP - 1_000]);
    await t.tickAfter(MIN_GAP - 1_000);
    expect(t.contexts).toHaveLength(2);
  });

  it('re-polls immediately after a long absence', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    t.lifecycle.setVisible(false);
    await t.tickAfter(5 * 60_000);
    t.lifecycle.setVisible(true);
    expect(t.scheduler.pendingDelays()).toEqual([0]);
  });

  it('does not stack a second timer when already scheduled', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    t.lifecycle.setVisible(true);
    expect(t.scheduler.pendingDelays()).toEqual([INTERVAL]);
  });

  it('never runs two requests at once', async () => {
    const t = setup();
    t.holdRequests();
    t.poller.start();
    await flush();
    t.lifecycle.setVisible(false);
    t.lifecycle.setVisible(true);
    await t.tickAfter(INTERVAL);
    expect(t.contexts).toHaveLength(1);
    await t.release();
    expect(t.scheduler.pendingDelays()).toEqual([INTERVAL]);
  });

  it('does not reschedule if the tab was hidden while a request was in flight', async () => {
    const t = setup();
    t.holdRequests();
    t.poller.start();
    await flush();
    t.lifecycle.setVisible(false);
    await t.release();
    expect(t.scheduler.pendingDelays()).toEqual([]);
  });
});

describe('LivePoller failures', () => {
  it('keeps trying after isolated network failures', async () => {
    const t = setup();
    t.outcomes.push('network', 'network', 'ok', 'network');
    t.poller.start();
    await flush();
    for (let i = 0; i < 3; i += 1) {
      await t.tickAfter(INTERVAL);
    }
    expect(t.failures).toEqual([false, false, false]);
    expect(t.data).toHaveLength(1);
    expect(t.scheduler.pendingDelays()).toEqual([INTERVAL]);
  });

  it('stops for good on the third consecutive failure and persists it', async () => {
    const t = setup();
    t.outcomes.push('network', 'network', 'network');
    t.poller.start();
    await flush();
    await t.tickAfter(INTERVAL);
    await t.tickAfter(INTERVAL);
    expect(t.failures).toEqual([false, false, true]);
    expect(t.scheduler.pendingDelays()).toEqual([]);
    expect(t.store.get('k')).not.toBeNull();
    await t.tickAfter(10 * INTERVAL);
    expect(t.contexts).toHaveLength(3);
  });

  it('stops immediately on a permanent failure', async () => {
    const t = setup();
    t.outcomes.push('fatal');
    t.poller.start();
    await flush();
    expect(t.failures).toEqual([true]);
    expect(t.scheduler.pendingDelays()).toEqual([]);
  });

  it('sends no away notice once stopped', async () => {
    const t = setup();
    t.outcomes.push('fatal');
    t.poller.start();
    await flush();
    t.lifecycle.setVisible(false);
    t.lifecycle.hide();
    expect(t.aways()).toBe(0);
  });

  it('does not resume after being stopped', async () => {
    const t = setup();
    t.outcomes.push('fatal');
    t.poller.start();
    await flush();
    t.lifecycle.setVisible(false);
    t.lifecycle.setVisible(true);
    t.lifecycle.show(true);
    await t.tickAfter(10 * INTERVAL);
    expect(t.contexts).toHaveLength(1);
  });

  it('stops when another page opened the breaker meanwhile', async () => {
    const t = setup();
    t.poller.start();
    await flush();
    t.store.set('k', String(Number.MAX_SAFE_INTEGER));
    await t.tickAfter(INTERVAL);
    expect(t.contexts).toHaveLength(1);
    expect(t.failures).toEqual([true]);
  });
});

describe('LivePoller rendering errors', () => {
  it('rethrows outside the request instead of counting a backend failure', async () => {
    const clock = new ManualClock();
    const scheduler = new ManualScheduler(clock);
    const failures: boolean[] = [];
    const thrown: unknown[] = [];
    const original = globalThis.queueMicrotask;
    globalThis.queueMicrotask = (callback) => {
      try {
        callback();
      } catch (error) {
        thrown.push(error);
      }
    };
    try {
      new LivePoller<number>({
        task: () => Promise.resolve(1),
        onData: () => {
          throw new Error('render bug');
        },
        onFailure: (tripped) => failures.push(tripped),
        onAway: null,
        isRetryable,
        intervalMs: INTERVAL,
        minGapMs: MIN_GAP,
        schedule: scheduler.schedule,
        lifecycle: new FakeLifecycle(),
        clock,
        breaker: new CircuitBreaker({
          store: new MemoryStore(),
          clock,
          key: 'k',
          maxFailures: 1,
          cooldownMs: 1,
        }),
      }).start();
      await flush();
    } finally {
      globalThis.queueMicrotask = original;
    }
    expect(failures).toEqual([]);
    expect(thrown).toEqual([new Error('render bug')]);
    expect(scheduler.pendingDelays()).toEqual([INTERVAL]);
  });
});
