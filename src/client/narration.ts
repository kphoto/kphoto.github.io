import { isPlaybackRate, type KeyValueStore, type SettingsStore } from './storage.ts';

export const LISTENING_KEY = 'kphoto:listening:v1';

export const MAX_REMEMBERED = 20;

export const SAVE_EVERY_SECONDS = 5;

export const RESUME_MARGIN_SECONDS = 5;

type Entry = readonly [source: string, seconds: number];

function isEntry(value: unknown): value is Entry {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'string' &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[1]) &&
    value[1] > 0
  );
}

export class ListeningProgress {
  readonly #store: KeyValueStore;
  readonly #limit: number;

  constructor(store: KeyValueStore, limit = MAX_REMEMBERED) {
    this.#store = store;
    this.#limit = limit;
  }

  position(source: string): number {
    return this.#read().find(([candidate]) => candidate === source)?.[1] ?? 0;
  }

  save(source: string, seconds: number): void {
    const whole = Math.floor(seconds);
    if (!Number.isFinite(whole) || whole < 1) {
      this.forget(source);
      return;
    }
    const latest: Entry = [source, whole];
    const others = this.#read().filter(([candidate]) => candidate !== source);
    this.#write([latest, ...others].slice(0, this.#limit));
  }

  forget(source: string): void {
    const entries = this.#read();
    const remaining = entries.filter(([candidate]) => candidate !== source);
    if (remaining.length !== entries.length) {
      this.#write(remaining);
    }
  }

  #read(): Entry[] {
    try {
      const raw = this.#store.get(LISTENING_KEY);
      const parsed: unknown = raw === null ? [] : JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
    } catch {
      return [];
    }
  }

  #write(entries: readonly Entry[]): void {
    try {
      this.#store.set(LISTENING_KEY, JSON.stringify(entries));
    } catch {}
  }
}

export function resumeAt(saved: number, duration: number): number | undefined {
  if (saved <= 0 || !Number.isFinite(duration)) {
    return undefined;
  }
  return saved < duration - RESUME_MARGIN_SECONDS ? saved : undefined;
}

export type PlayerEvent = 'loadedmetadata' | 'ratechange' | 'timeupdate' | 'pause' | 'ended';

export interface NarrationPlayer {
  readonly source: string;
  hasMetadata(): boolean;
  duration(): number;
  currentTime(): number;
  seek(seconds: number): void;
  rate(): number;
  setRate(rate: number): void;
  on(event: PlayerEvent, listener: () => void): void;
}

export interface NarrationDependencies {
  readonly settings: SettingsStore;
  readonly progress: ListeningProgress;
}

export function connectNarration(
  player: NarrationPlayer,
  { settings, progress }: NarrationDependencies,
): void {
  const source = player.source;
  const storedRate = settings.read().playbackRate;
  if (storedRate !== undefined) {
    player.setRate(storedRate);
  }

  let lastSaved = progress.position(source);
  let resumed = false;
  const resume = (): void => {
    if (resumed) {
      return;
    }
    resumed = true;
    const at = resumeAt(lastSaved, player.duration());
    if (at !== undefined) {
      player.seek(at);
    }
  };
  if (player.hasMetadata()) {
    resume();
  } else {
    player.on('loadedmetadata', resume);
  }

  const remember = (): void => {
    lastSaved = player.currentTime();
    progress.save(source, lastSaved);
  };

  player.on('ratechange', () => {
    const rate = player.rate();
    if (isPlaybackRate(rate) && rate !== settings.read().playbackRate) {
      settings.write({ playbackRate: rate });
    }
  });
  player.on('timeupdate', () => {
    if (Math.abs(player.currentTime() - lastSaved) >= SAVE_EVERY_SECONDS) {
      remember();
    }
  });
  player.on('pause', remember);
  player.on('ended', () => {
    lastSaved = 0;
    progress.forget(source);
  });
}
