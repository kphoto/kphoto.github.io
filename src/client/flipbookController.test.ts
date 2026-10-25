import { describe, expect, it } from 'vitest';
import { FlipbookTimeline, type FlipbookRenderer } from '../lib/flipbook.ts';
import {
  FlipbookController,
  needsResync,
  pictureChanged,
  type FlipbookView,
  type FrameSurface,
} from './flipbookController.ts';
import { FLIPBOOK_KEY, FlipbookPreferenceStore } from './flipbookPreferences.ts';
import type { KeyValueStore } from './storage.ts';

type Call = readonly [string, ...unknown[]];

class FakeSurface implements FrameSurface {
  readonly calls: Call[] = [];
  reveal(view: FlipbookView): void {
    this.calls.push(['reveal', view.frame]);
  }
  conceal(): void {
    this.calls.push(['conceal']);
  }
  show(view: FlipbookView, previous: FlipbookView | undefined): void {
    this.calls.push(['show', view.frame, view.playing, previous?.frame]);
  }
  shown(): number[] {
    return this.calls.filter((call) => call[0] === 'show').map((call) => call[1] as number);
  }
}

function setup(renderer: FlipbookRenderer = 'image', frame = 0) {
  let clock = 0;
  const data = new Map<string, string>();
  const store: KeyValueStore = {
    get: (key) => data.get(key) ?? null,
    set: (key, value) => {
      data.set(key, value);
    },
  };
  const surfaces = { image: new FakeSurface(), canvas: new FakeSurface(), css: new FakeSurface() };
  const panel: FlipbookView[] = [];
  const controller = new FlipbookController(
    {
      timeline: new FlipbookTimeline({ count: 28, fps: 12, frame }),
      surfaces,
      panel: { update: (view) => panel.push(view) },
      preferences: new FlipbookPreferenceStore(store),
      now: () => clock,
    },
    renderer,
  );
  return {
    controller,
    surfaces,
    panel,
    stored: () => JSON.parse(data.get(FLIPBOOK_KEY) ?? '{}') as unknown,
    advance: (ms: number) => {
      clock += ms;
    },
  };
}

const view = (overrides: Partial<FlipbookView> = {}): FlipbookView => ({
  frame: 0,
  count: 28,
  fps: 12,
  playing: false,
  position: 0,
  seconds: 0,
  renderer: 'image',
  ...overrides,
});

describe('pictureChanged', () => {
  it('is true for the first view and for any visible change', () => {
    expect(pictureChanged(undefined, view())).toBe(true);
    expect(pictureChanged(view(), view({ frame: 1 }))).toBe(true);
    expect(pictureChanged(view(), view({ playing: true }))).toBe(true);
    expect(pictureChanged(view(), view({ fps: 6 }))).toBe(true);
    expect(pictureChanged(view(), view({ renderer: 'css' }))).toBe(true);
  });

  it('ignores time passing within a frame', () => {
    expect(pictureChanged(view(), view({ position: 0.5, seconds: 0.04 }))).toBe(false);
  });
});

describe('needsResync', () => {
  it('lets a running CSS animation advance on its own', () => {
    expect(needsResync(view({ playing: true }), view({ playing: true, frame: 5 }))).toBe(false);
  });

  it('resyncs on a paused seek, a rate change, play, pause and a new renderer', () => {
    expect(needsResync(undefined, view())).toBe(true);
    expect(needsResync(view(), view({ frame: 3 }))).toBe(true);
    expect(needsResync(view({ playing: true }), view({ playing: true, fps: 24 }))).toBe(true);
    expect(needsResync(view(), view({ playing: true }))).toBe(true);
    expect(needsResync(view({ playing: true }), view())).toBe(true);
    expect(needsResync(view({ renderer: 'css' }), view())).toBe(true);
  });

  it('does nothing when nothing moved', () => {
    expect(needsResync(view(), view())).toBe(false);
  });
});

describe('FlipbookController', () => {
  it('reveals only the chosen surface and paints the first frame', () => {
    const { controller, surfaces, panel } = setup('canvas', 4);
    controller.start(false);
    expect(surfaces.canvas.calls).toEqual([
      ['reveal', 4],
      ['show', 4, false, undefined],
    ]);
    expect(surfaces.image.calls).toEqual([['conceal']]);
    expect(surfaces.css.calls).toEqual([['conceal']]);
    expect(panel.map((entry) => entry.frame)).toEqual([4]);
    expect(controller.renderer).toBe('canvas');
  });

  it('paints only when the frame changes but keeps the readout live while playing', () => {
    const { controller, surfaces, panel, advance } = setup();
    controller.start(true);
    advance(40);
    controller.tick();
    advance(50);
    controller.tick();
    expect(surfaces.image.shown()).toEqual([0, 1]);
    expect(panel).toHaveLength(3);
    expect(panel.at(-1)?.seconds).toBeCloseTo(0.09);
  });

  it('stays quiet while paused', () => {
    const { controller, surfaces, panel, advance } = setup();
    controller.start(false);
    advance(1000);
    controller.tick();
    controller.tick();
    expect(surfaces.image.shown()).toEqual([0]);
    expect(panel).toHaveLength(1);
  });

  it('remembers play and pause as the autoplay preference', () => {
    const { controller, stored, advance } = setup();
    controller.start(false);
    controller.togglePlay();
    expect(stored()).toEqual({ autoplay: true });
    advance(1000);
    controller.togglePlay();
    expect(stored()).toEqual({ autoplay: false });
    expect(controller.view().frame).toBe(12);
    expect(controller.view().playing).toBe(false);
  });

  it('play and pause are idempotent on the picture', () => {
    const { controller, surfaces } = setup();
    controller.start(false);
    controller.pause();
    controller.play();
    controller.play();
    expect(surfaces.image.calls.filter((call) => call[0] === 'show')).toHaveLength(2);
  });

  it('steps one frame at a time, pausing a running flipbook', () => {
    const { controller, stored, advance } = setup();
    controller.start(true);
    advance(500);
    controller.step(1);
    expect(controller.view()).toMatchObject({ frame: 7, playing: false });
    expect(stored()).toEqual({ autoplay: false });
    controller.step(-8);
    expect(controller.view().frame).toBe(27);
  });

  it('does not store autoplay when stepping a paused flipbook', () => {
    const { controller, stored } = setup();
    controller.start(false);
    controller.step(1);
    expect(stored()).toEqual({});
  });

  it('seeks to a frame', () => {
    const { controller, surfaces } = setup();
    controller.start(false);
    controller.seek(9);
    expect(surfaces.image.shown()).toEqual([0, 9]);
  });

  it('stores a new rate and keeps its place', () => {
    const { controller, stored, advance } = setup();
    controller.start(true);
    advance(1000);
    controller.setFps(24);
    expect(stored()).toEqual({ fps: 24 });
    advance(500);
    expect(controller.view().frame).toBe(24);
  });

  it('clamps a stored rate', () => {
    const { controller, stored } = setup();
    controller.start(false);
    controller.setFps(1000);
    expect(stored()).toEqual({ fps: 60 });
  });

  it('switches surfaces and remembers the choice', () => {
    const { controller, surfaces, stored } = setup();
    controller.start(false);
    controller.seek(3);
    controller.setRenderer('css');
    expect(surfaces.image.calls.at(-1)).toEqual(['conceal']);
    expect(surfaces.css.calls.slice(-2)).toEqual([
      ['reveal', 3],
      ['show', 3, false, undefined],
    ]);
    expect(stored()).toEqual({ renderer: 'css' });
    expect(controller.renderer).toBe('css');
  });

  it('ignores switching to the surface already shown', () => {
    const { controller, surfaces, stored } = setup();
    controller.start(false);
    controller.setRenderer('image');
    expect(surfaces.image.calls).toHaveLength(2);
    expect(stored()).toEqual({});
  });
});
