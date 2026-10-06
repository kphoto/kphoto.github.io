import type { CircuitBreaker, Clock } from './circuitBreaker.ts';

export type Schedule = (callback: () => void, delayMs: number) => () => void;

export interface PageLifecycle {
  isVisible(): boolean;
  onVisibilityChange(listener: () => void): void;

  onPageHide(listener: () => void): void;

  onPageShow(listener: (restored: boolean) => void): void;
}

export interface PollContext {
  readonly newView: boolean;
}

export interface LivePollerOptions<T> {
  readonly task: (context: PollContext) => Promise<T>;
  readonly onData: (value: T) => void;

  readonly onFailure: (tripped: boolean) => void;

  readonly onAway: (() => void) | null;
  readonly isRetryable: (error: unknown) => boolean;
  readonly intervalMs: number;
  readonly minGapMs: number;
  readonly schedule: Schedule;
  readonly lifecycle: PageLifecycle;
  readonly clock: Clock;
  readonly breaker: CircuitBreaker;
}

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
        this.#newView = true;
        this.#resume();
      }
    });
    if (lifecycle.isVisible()) {
      void this.#tick();
    }
  }

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
