/**
 * Real browser implementations of the small interfaces the client logic
 * depends on (dependency inversion: everything else receives these, so unit
 * tests pass fakes instead). This file is the only place that touches
 * `localStorage`, timers and page-lifecycle events.
 */
import type { Clock } from './circuitBreaker';
import type { PageLifecycle, Schedule } from './livePoller';
import type { KeyValueStore } from './storage';

/** localStorage that never throws (private browsing, quota, disabled storage). */
export const browserStore: KeyValueStore = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable; callers degrade to per-page behaviour.
    }
  },
};

export const browserClock: Clock = {
  now: () => Date.now(),
};

export const browserSchedule: Schedule = (callback, delayMs) => {
  const handle = window.setTimeout(callback, delayMs);
  return () => {
    window.clearTimeout(handle);
  };
};

export const browserLifecycle: PageLifecycle = {
  isVisible: () => document.visibilityState === 'visible',
  onVisibilityChange: (listener) => {
    document.addEventListener('visibilitychange', listener);
  },
  onPageHide: (listener) => {
    window.addEventListener('pagehide', listener);
  },
  onPageShow: (listener) => {
    window.addEventListener('pageshow', (event) => {
      listener(event.persisted);
    });
  },
};

/** `navigator.globalPrivacyControl` where the browser exposes it. */
export function sendsGlobalPrivacyControl(): boolean {
  return 'globalPrivacyControl' in navigator && navigator.globalPrivacyControl === true;
}
