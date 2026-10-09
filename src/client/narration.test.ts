import { describe, expect, it } from 'vitest';
import { MemoryStore } from './liveTestDoubles.ts';
import {
  connectNarration,
  LISTENING_KEY,
  ListeningProgress,
  MAX_REMEMBERED,
  RESUME_MARGIN_SECONDS,
  resumeAt,
  SAVE_EVERY_SECONDS,
  type NarrationPlayer,
  type PlayerEvent,
} from './narration.ts';
import { SETTINGS_KEY, SettingsStore } from './storage.ts';

const SOURCE = '/spoken/clean-hands-en.wav';

class FakePlayer implements NarrationPlayer {
  readonly source: string;
  metadata = false;
  length = 240;
  time = 0;
  speed = 1;
  readonly seeks: number[] = [];
  readonly rates: number[] = [];
  readonly #listeners = new Map<PlayerEvent, (() => void)[]>();

  constructor(source = SOURCE) {
    this.source = source;
  }

  hasMetadata(): boolean {
    return this.metadata;
  }

  duration(): number {
    return this.length;
  }

  currentTime(): number {
    return this.time;
  }

  seek(seconds: number): void {
    this.seeks.push(seconds);
    this.time = seconds;
  }

  rate(): number {
    return this.speed;
  }

  setRate(rate: number): void {
    this.rates.push(rate);
    this.speed = rate;
    this.emit('ratechange');
  }

  on(event: PlayerEvent, listener: () => void): void {
    this.#listeners.set(event, [...(this.#listeners.get(event) ?? []), listener]);
  }

  emit(event: PlayerEvent): void {
    for (const listener of this.#listeners.get(event) ?? []) {
      listener();
    }
  }

  listenerCount(event: PlayerEvent): number {
    return this.#listeners.get(event)?.length ?? 0;
  }

  loadMetadata(): void {
    this.metadata = true;
    this.emit('loadedmetadata');
  }

  playTo(seconds: number): void {
    this.time = seconds;
    this.emit('timeupdate');
  }
}

function setup(store = new MemoryStore()) {
  const settings = new SettingsStore(store);
  const progress = new ListeningProgress(store);
  return { store, settings, progress };
}

describe('ListeningProgress', () => {
  it('knows nothing about a recording it never heard', () => {
    expect(new ListeningProgress(new MemoryStore()).position(SOURCE)).toBe(0);
  });

  it('remembers whole seconds per recording under one versioned key', () => {
    const store = new MemoryStore();
    const progress = new ListeningProgress(store);
    progress.save(SOURCE, 42.9);
    progress.save('/spoken/other-es.wav', 7);
    expect(progress.position(SOURCE)).toBe(42);
    expect(progress.position('/spoken/other-es.wav')).toBe(7);
    expect([...store.values.keys()]).toEqual([LISTENING_KEY]);
  });

  it('keeps the most recent recordings first and forgets the oldest past the limit', () => {
    const store = new MemoryStore();
    const progress = new ListeningProgress(store, 2);
    progress.save('/a.wav', 10);
    progress.save('/b.wav', 20);
    progress.save('/a.wav', 11);
    progress.save('/c.wav', 30);
    expect(JSON.parse(store.values.get(LISTENING_KEY) ?? '')).toEqual([
      ['/c.wav', 30],
      ['/a.wav', 11],
    ]);
    expect(progress.position('/b.wav')).toBe(0);
  });

  it('defaults to a generous limit', () => {
    const progress = new ListeningProgress(new MemoryStore());
    for (let index = 0; index <= MAX_REMEMBERED; index += 1) {
      progress.save(`/${String(index)}.wav`, 5);
    }
    expect(progress.position('/0.wav')).toBe(0);
    expect(progress.position(`/${String(MAX_REMEMBERED)}.wav`)).toBe(5);
  });

  it('treats the very start, or nonsense, as nothing to remember', () => {
    const progress = new ListeningProgress(new MemoryStore());
    progress.save(SOURCE, 30);
    progress.save(SOURCE, 0.4);
    expect(progress.position(SOURCE)).toBe(0);
    progress.save(SOURCE, Number.NaN);
    expect(progress.position(SOURCE)).toBe(0);
  });

  it('forgets one recording and leaves the others', () => {
    const progress = new ListeningProgress(new MemoryStore());
    progress.save('/a.wav', 10);
    progress.save('/b.wav', 20);
    progress.forget('/a.wav');
    expect(progress.position('/a.wav')).toBe(0);
    expect(progress.position('/b.wav')).toBe(20);
  });

  it('does not write when there is nothing to forget', () => {
    const store = new MemoryStore();
    new ListeningProgress(store).forget(SOURCE);
    expect(store.values.size).toBe(0);
  });

  it('ignores corrupt, foreign and malformed stored values', () => {
    for (const raw of [
      '{oops',
      '{"a":1}',
      '42',
      'null',
      '[["/a.wav"]]',
      '[["/a.wav","1"]]',
      '[[1,2]]',
      '[["/a.wav",-3]]',
    ]) {
      const store = new MemoryStore();
      store.set(LISTENING_KEY, raw);
      expect(new ListeningProgress(store).position('/a.wav')).toBe(0);
    }
  });

  it('keeps the valid entries next to broken ones', () => {
    const store = new MemoryStore();
    store.set(LISTENING_KEY, '[["/a.wav",12],"junk",["/b.wav",null]]');
    expect(new ListeningProgress(store).position('/a.wav')).toBe(12);
  });

  it('survives a throwing backing store', () => {
    const progress = new ListeningProgress({
      get: () => {
        throw new Error('denied');
      },
      set: () => {
        throw new Error('denied');
      },
    });
    expect(() => {
      progress.save(SOURCE, 30);
    }).not.toThrow();
    expect(progress.position(SOURCE)).toBe(0);
  });
});

describe('resumeAt', () => {
  it('resumes a recording left part way through', () => {
    expect(resumeAt(90, 240)).toBe(90);
  });

  it('starts over when nothing was saved', () => {
    expect(resumeAt(0, 240)).toBeUndefined();
  });

  it('starts over when the listener had all but finished', () => {
    expect(resumeAt(240 - RESUME_MARGIN_SECONDS, 240)).toBeUndefined();
    expect(resumeAt(300, 240)).toBeUndefined();
  });

  it('starts over when the length is unknown', () => {
    expect(resumeAt(90, Number.NaN)).toBeUndefined();
    expect(resumeAt(90, Infinity)).toBeUndefined();
  });
});

describe('connectNarration', () => {
  it('applies the remembered listening speed before anything plays', () => {
    const { settings, progress } = setup();
    settings.write({ playbackRate: 1.5 });
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    expect(player.rates).toEqual([1.5]);
  });

  it('leaves the speed alone when none was chosen', () => {
    const { settings, progress, store } = setup();
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    expect(player.rates).toEqual([]);
    expect(store.values.size).toBe(0);
  });

  it('remembers a speed the listener picks, for every recording', () => {
    const { settings, progress } = setup();
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    player.speed = 1.75;
    player.emit('ratechange');
    expect(settings.read().playbackRate).toBe(1.75);
  });

  it('does not rewrite settings when the speed did not change', () => {
    const { settings, progress, store } = setup();
    settings.write({ playbackRate: 1.25 });
    const before = store.values.get(SETTINGS_KEY);
    const writes: string[] = [];
    const watched = {
      get: (key: string) => store.get(key),
      set: (key: string, value: string) => {
        writes.push(key);
        store.set(key, value);
      },
    };
    connectNarration(new FakePlayer(), {
      settings: new SettingsStore(watched),
      progress,
    });
    expect(writes).toEqual([]);
    expect(store.values.get(SETTINGS_KEY)).toBe(before);
  });

  it('ignores a speed outside the accepted range', () => {
    const { settings, progress } = setup();
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    player.speed = 16;
    player.emit('ratechange');
    expect(settings.read()).not.toHaveProperty('playbackRate');
  });

  it('picks up where the listener left off once the length is known', () => {
    const { settings, progress } = setup();
    progress.save(SOURCE, 95);
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    expect(player.seeks).toEqual([]);
    player.loadMetadata();
    expect(player.seeks).toEqual([95]);
    player.loadMetadata();
    expect(player.seeks).toEqual([95]);
  });

  it('picks up at once when the length is already known', () => {
    const { settings, progress } = setup();
    progress.save(SOURCE, 95);
    const player = new FakePlayer();
    player.metadata = true;
    connectNarration(player, { settings, progress });
    expect(player.seeks).toEqual([95]);
    expect(player.listenerCount('loadedmetadata')).toBe(0);
  });

  it('starts from the beginning for a new recording', () => {
    const { settings, progress } = setup();
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    player.loadMetadata();
    expect(player.seeks).toEqual([]);
  });

  it('saves progress every few seconds of listening, not on every tick', () => {
    const { settings, progress } = setup();
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    player.playTo(SAVE_EVERY_SECONDS - 1);
    expect(progress.position(SOURCE)).toBe(0);
    player.playTo(SAVE_EVERY_SECONDS);
    expect(progress.position(SOURCE)).toBe(SAVE_EVERY_SECONDS);
    player.playTo(SAVE_EVERY_SECONDS + 2);
    expect(progress.position(SOURCE)).toBe(SAVE_EVERY_SECONDS);
    player.playTo(SAVE_EVERY_SECONDS * 2 + 1);
    expect(progress.position(SOURCE)).toBe(SAVE_EVERY_SECONDS * 2 + 1);
  });

  it('saves a seek backwards too', () => {
    const { settings, progress } = setup();
    progress.save(SOURCE, 120);
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    player.playTo(30);
    expect(progress.position(SOURCE)).toBe(30);
  });

  it('saves the exact spot on pause', () => {
    const { settings, progress } = setup();
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    player.time = 63.4;
    player.emit('pause');
    expect(progress.position(SOURCE)).toBe(63);
  });

  it('forgets a recording heard to the end', () => {
    const { settings, progress } = setup();
    const player = new FakePlayer();
    connectNarration(player, { settings, progress });
    player.time = 240;
    player.emit('pause');
    player.emit('ended');
    expect(progress.position(SOURCE)).toBe(0);
    player.playTo(3);
    expect(progress.position(SOURCE)).toBe(0);
  });

  it('keeps every recording to its own place', () => {
    const { settings, progress } = setup();
    const english = new FakePlayer('/spoken/a-en.wav');
    const spanish = new FakePlayer('/spoken/a-es.wav');
    connectNarration(english, { settings, progress });
    connectNarration(spanish, { settings, progress });
    english.time = 50;
    english.emit('pause');
    spanish.time = 80;
    spanish.emit('pause');
    expect(progress.position('/spoken/a-en.wav')).toBe(50);
    expect(progress.position('/spoken/a-es.wav')).toBe(80);
  });
});
