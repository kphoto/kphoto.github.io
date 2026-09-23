import { describe, expect, it } from 'vitest';
import { CircuitBreaker } from './circuitBreaker';
import { ManualClock, MemoryStore } from './liveTestDoubles';
import type { KeyValueStore } from './storage';

const KEY = 'test:retry-after';

function setup(store: KeyValueStore = new MemoryStore()) {
  const clock = new ManualClock(10_000);
  const breaker = new CircuitBreaker({ store, clock, key: KEY, maxFailures: 3, cooldownMs: 600 });
  return { breaker, clock, store };
}

describe('CircuitBreaker', () => {
  it('starts closed', () => {
    expect(setup().breaker.isOpen()).toBe(false);
  });

  it('opens on the third consecutive retryable failure', () => {
    const { breaker } = setup();
    expect(breaker.recordFailure(true)).toBe(false);
    expect(breaker.recordFailure(true)).toBe(false);
    expect(breaker.isOpen()).toBe(false);
    expect(breaker.recordFailure(true)).toBe(true);
    expect(breaker.isOpen()).toBe(true);
  });

  it('opens immediately on a non-retryable failure', () => {
    const { breaker } = setup();
    expect(breaker.recordFailure(false)).toBe(true);
    expect(breaker.isOpen()).toBe(true);
  });

  it('forgets earlier failures after a success', () => {
    const { breaker } = setup();
    breaker.recordFailure(true);
    breaker.recordFailure(true);
    breaker.recordSuccess();
    expect(breaker.recordFailure(true)).toBe(false);
    expect(breaker.recordFailure(true)).toBe(false);
    expect(breaker.isOpen()).toBe(false);
  });

  it('persists the retry-after time and closes once it passes', () => {
    const { breaker, clock, store } = setup();
    breaker.recordFailure(false);
    expect(store.get(KEY)).toBe('10600');
    clock.current = 10_599;
    expect(breaker.isOpen()).toBe(true);
    clock.current = 10_600;
    expect(breaker.isOpen()).toBe(false);
  });

  it('is shared through storage: another page sees it open', () => {
    const store = new MemoryStore();
    setup(store).breaker.recordFailure(false);
    expect(setup(store).breaker.isOpen()).toBe(true);
  });

  it('ignores garbage in storage', () => {
    const store = new MemoryStore();
    store.set(KEY, 'not-a-number');
    expect(setup(store).breaker.isOpen()).toBe(false);
  });

  it('still trips for this page when storage is unavailable', () => {
    const broken: KeyValueStore = { get: () => null, set: () => undefined };
    const { breaker } = setup(broken);
    expect(breaker.recordFailure(false)).toBe(true);
  });
});
