import type { CircuitBreaker, Clock } from './circuitBreaker';

/** Schedules a callback; returns a function that cancels it. */
export type Schedule = (callback: () => void, delayMs: number) => () => void;

/** The page lifecycle signals the poller reacts to; injected for tests. */
export interface PageLifecycle {
  isVisible(): boolean;
  onVisibilityChange(listener: () => void): void;
  /** The page is being unloaded or frozen into the back/forward cache. */
  onPageHide(listener: () => void): void;
  /** The page was shown; `restored` is true for a back/forward-cache restore. */
  onPageShow(listener: (restored: boolean) => void): void;
}

export interface PollContext {
  /**
   * True until a request for this page view has succeeded — so a heartbeat
   * that failed is retried as the view it was meant to count.
   */
  readonly newView: boolean;
}

export interface LivePollerOptions<T> {
  readonly task: (context: PollContext) => Promise<T>;
  readonly onData: (value: T) => void;
  /** Called after every failure; `tripped` means polling has stopped. */
  readonly onFailure: (tripped: boolean) => void;
  /** Called when the tab stops being "here" (hidden or unloading), or null. */
  readonly onAway: (() => void) | null;
  readonly isRetryable: (error: unknown) => boolean;
  readonly intervalMs: number;
  readonly minGapMs: number;
  readonly schedule: Schedule;
  readonly lifecycle: PageLifecycle;
  readonly clock: Clock;
  readonly breaker: CircuitBreaker;
}

/**
 * Polls only while the tab is visible, one request at a time, and gives up
 * through the shared circuit breaker (ADR 0025). Nothing here can block the
 * page: the task is always async, every failure is caught, and the only
 * outputs are the two callbacks.
 */
export class LivePoller<T> {
  readonly #options: LivePollerOptions<T>;
  #cancel: (() => void) | null = null;
  #inFlight = false;
  #stopped = false;
  #newView = true;
  #lastStartedAt = Number.NEGATIVE_INFINITY;

  constructor(options: LivePollerOptions<T>) {
    this.#options = options;
  }

  start(): void {
    const { lifecycle } = this.#options;
    if (this.#options.breaker.isOpen()) {
      this.#stop();
      this.#options.onFailure(true);
      return;
    }
    lifecycle.onVisibilityChange(() => {
      if (lifecycle.isVisible()) {
        this.#resume();
      } else {
        this.#away();
      }
    });
    lifecycle.onPageHide(() => {
      this.#away();
    });
    lifecycle.onPageShow((restored) => {
      if (restored) {
        // Coming back from the back/forward cache is a fresh view.
        this.#newView = true;
        this.#resume();
      }
    });
    if (lifecycle.isVisible()) {
      void this.#tick();
    }
  }

  /** Stops for good; used when the breaker trips. */
  #stop(): void {
    this.#stopped = true;
    this.#clearTimer();
  }

  #clearTimer(): void {
    this.#cancel?.();
    this.#cancel = null;
  }

  #away(): void {
    this.#clearTimer();
    if (!this.#stopped) {
      this.#options.onAway?.();
    }
  }

  #resume(): void {
    if (this.#stopped || this.#inFlight || this.#cancel !== null) {
      return;
    }
    const sinceLast = this.#options.clock.now() - this.#lastStartedAt;
    const wait = Math.max(0, this.#options.minGapMs - sinceLast);
    this.#scheduleIn(wait);
  }

  #scheduleIn(delayMs: number): void {
    this.#clearTimer();
    this.#cancel = this.#options.schedule(() => {
      this.#cancel = null;
      void this.#tick();
    }, delayMs);
  }

  /**
   * A rendering bug must not look like a backend failure (and trip the
   * breaker), nor be swallowed: rethrow it outside the request's promise so
   * it surfaces as an ordinary uncaught error.
   */
  #deliver(value: T): void {
    try {
      this.#options.onData(value);
    } catch (error) {
      queueMicrotask(() => {
        throw error;
      });
    }
  }

  async #tick(): Promise<void> {
    const { breaker, lifecycle } = this.#options;
    if (this.#stopped || this.#inFlight || !lifecycle.isVisible()) {
      return;
    }
    if (breaker.isOpen()) {
      this.#stop();
      this.#options.onFailure(true);
      return;
    }
    this.#inFlight = true;
    this.#lastStartedAt = this.#options.clock.now();
    let tripped = false;
    try {
      const value = await this.#options.task({ newView: this.#newView });
      this.#newView = false;
      breaker.recordSuccess();
      this.#deliver(value);
    } catch (error) {
      tripped = breaker.recordFailure(this.#options.isRetryable(error));
      if (tripped) {
        this.#stop();
      }
      this.#options.onFailure(tripped);
    } finally {
      this.#inFlight = false;
    }
    if (!tripped && lifecycle.isVisible()) {
      this.#scheduleIn(this.#options.intervalMs);
    }
  }
}
