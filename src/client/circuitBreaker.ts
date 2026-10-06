import type { KeyValueStore } from './storage.ts';

export interface Clock {
  now(): number;
}

export interface CircuitBreakerOptions {
  readonly store: KeyValueStore;
  readonly clock: Clock;

  readonly key: string;

  readonly maxFailures: number;

  readonly cooldownMs: number;
}

export class CircuitBreaker {
  readonly #options: CircuitBreakerOptions;
  #failures = 0;

  constructor(options: CircuitBreakerOptions) {
    this.#options = options;
  }

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
