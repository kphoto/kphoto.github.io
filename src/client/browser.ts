import type { Clock } from './circuitBreaker.ts';
import type { PageLifecycle, Schedule } from './livePoller.ts';
import type { KeyValueStore } from './storage.ts';

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
    } catch {}
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

export function sendsGlobalPrivacyControl(): boolean {
  return 'globalPrivacyControl' in navigator && navigator.globalPrivacyControl === true;
}
