/**
 * Test doubles for the live-statistics client: a manual clock, a manual
 * scheduler and a scriptable page lifecycle. Test-only (imported only by
 * *.test.ts), in the same spirit as src/lib/testFixtures.ts.
 */
import type { Clock } from './circuitBreaker';
import type { PageLifecycle, Schedule } from './livePoller';
import type { KeyValueStore } from './storage';

export class MemoryStore implements KeyValueStore {
  readonly values = new Map<string, string>();

  get(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.values.set(key, value);
  }
}

export class ManualClock implements Clock {
  current: number;

  constructor(start = 1_000_000) {
    this.current = start;
  }

  now(): number {
    return this.current;
  }
}

interface Timer {
  readonly at: number;
  readonly callback: () => void;
  cancelled: boolean;
}

/** Timers fire only when a test advances time. */
export class ManualScheduler {
  readonly #clock: ManualClock;
  readonly #timers: Timer[] = [];

  constructor(clock: ManualClock) {
    this.#clock = clock;
  }

  readonly schedule: Schedule = (callback, delayMs) => {
    const timer: Timer = { at: this.#clock.now() + delayMs, callback, cancelled: false };
    this.#timers.push(timer);
    return () => {
      timer.cancelled = true;
    };
  };

  /** Pending (not cancelled, not yet fired) timers' delays from now. */
  pendingDelays(): number[] {
    return this.#timers
      .filter((timer) => !timer.cancelled)
      .map((timer) => timer.at - this.#clock.now());
  }

  /** Moves time forward, firing due timers in order. */
  advance(ms: number): void {
    const target = this.#clock.now() + ms;
    for (;;) {
      const due = this.#timers
        .filter((timer) => !timer.cancelled && timer.at <= target)
        .sort((a, b) => a.at - b.at)[0];
      if (!due) {
        break;
      }
      due.cancelled = true;
      this.#clock.current = due.at;
      due.callback();
    }
    this.#clock.current = target;
  }
}

export class FakeLifecycle implements PageLifecycle {
  visible = true;
  readonly #visibility: (() => void)[] = [];
  readonly #hide: (() => void)[] = [];
  readonly #show: ((restored: boolean) => void)[] = [];

  isVisible(): boolean {
    return this.visible;
  }

  onVisibilityChange(listener: () => void): void {
    this.#visibility.push(listener);
  }

  onPageHide(listener: () => void): void {
    this.#hide.push(listener);
  }

  onPageShow(listener: (restored: boolean) => void): void {
    this.#show.push(listener);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    for (const listener of this.#visibility) {
      listener();
    }
  }

  hide(): void {
    for (const listener of this.#hide) {
      listener();
    }
  }

  show(restored: boolean): void {
    for (const listener of this.#show) {
      listener(restored);
    }
  }
}

/** Lets pending promise callbacks (the poller's awaited task) run. */
export async function flush(): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
}
