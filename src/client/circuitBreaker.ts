import type { KeyValueStore } from './storage';

/** Wall-clock reader; injected so tests control time. */
export interface Clock {
  now(): number;
}

export interface CircuitBreakerOptions {
  readonly store: KeyValueStore;
  readonly clock: Clock;
  /** localStorage key holding the "retry after" epoch milliseconds. */
  readonly key: string;
  /** Consecutive retryable failures that open the breaker. */
  readonly maxFailures: number;
  /** How long the breaker stays open once tripped. */
  readonly cooldownMs: number;
}

/**
 * Stops the site from hammering a backend that is down (ADR 0025). The open
 * state is persisted, so once a page trips it, every page on this browser
 * skips live statistics for the cool-down — a paused Supabase project costs a
 * visitor at most a handful of failed requests, not one per page view.
 * A non-retryable failure (bad key, missing functions, quota exhausted) trips
 * it immediately.
 */
export class CircuitBreaker {
  readonly #options: CircuitBreakerOptions;
  #failures = 0;

  constructor(options: CircuitBreakerOptions) {
    this.#options = options;
  }

  /** True while requests should not be attempted. */
  isOpen(): boolean {
    const raw = this.#options.store.get(this.#options.key);
    if (raw === null) {
      return false;
    }
    const retryAfter = Number(raw);
    return Number.isFinite(retryAfter) && this.#options.clock.now() < retryAfter;
  }

  recordSuccess(): void {
    this.#failures = 0;
  }

  /** Records a failure; returns true when this failure opened the breaker. */
  recordFailure(retryable: boolean): boolean {
    this.#failures += 1;
    if (retryable && this.#failures < this.#options.maxFailures) {
      return false;
    }
    this.#failures = 0;
    const retryAfter = this.#options.clock.now() + this.#options.cooldownMs;
    this.#options.store.set(this.#options.key, String(retryAfter));
    return true;
  }
}
