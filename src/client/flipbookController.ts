import type { FlipbookRenderer, FlipbookTimeline } from '../lib/flipbook.ts';
import type { FlipbookPreferenceStore } from './flipbookPreferences.ts';

export interface FlipbookView {
  readonly frame: number;
  readonly count: number;
  readonly fps: number;
  readonly playing: boolean;
  readonly position: number;
  readonly seconds: number;
  readonly renderer: FlipbookRenderer;
}

export interface FrameSurface {
  reveal(view: FlipbookView): void;
  conceal(): void;
  show(view: FlipbookView, previous: FlipbookView | undefined): void;
}

export interface FlipbookPanel {
  update(view: FlipbookView): void;
}

export interface FlipbookDependencies {
  readonly timeline: FlipbookTimeline;
  readonly surfaces: Readonly<Record<FlipbookRenderer, FrameSurface>>;
  readonly panel: FlipbookPanel;
  readonly preferences: FlipbookPreferenceStore;
  readonly now: () => number;
}

export function pictureChanged(previous: FlipbookView | undefined, next: FlipbookView): boolean {
  if (previous === undefined) {
    return true;
  }
  return (
    previous.frame !== next.frame ||
    previous.playing !== next.playing ||
    previous.fps !== next.fps ||
    previous.renderer !== next.renderer
  );
}

export function needsResync(previous: FlipbookView | undefined, next: FlipbookView): boolean {
  if (previous === undefined) {
    return true;
  }
  return (
    previous.renderer !== next.renderer ||
    previous.playing !== next.playing ||
    previous.fps !== next.fps ||
    (!next.playing && previous.frame !== next.frame)
  );
}

export class FlipbookController {
  readonly #deps: FlipbookDependencies;
  #renderer: FlipbookRenderer;
  #previous: FlipbookView | undefined;

  constructor(deps: FlipbookDependencies, renderer: FlipbookRenderer) {
    this.#deps = deps;
    this.#renderer = renderer;
  }

  get renderer(): FlipbookRenderer {
    return this.#renderer;
  }

  view(): FlipbookView {
    const { timeline, now } = this.#deps;
    const at = now();
    return {
      frame: timeline.frame(at),
      count: timeline.count,
      fps: timeline.fps,
      playing: timeline.playing,
      position: timeline.position(at),
      seconds: timeline.seconds(at),
      renderer: this.#renderer,
    };
  }

  start(playing: boolean): void {
    if (playing) {
      this.#deps.timeline.play(this.#deps.now());
    }
    const view = this.view();
    for (const [name, surface] of Object.entries(this.#deps.surfaces)) {
      if (name === this.#renderer) {
        surface.reveal(view);
      } else {
        surface.conceal();
      }
    }
    this.#refresh(true);
  }

  tick(): void {
    this.#refresh(false);
  }

  play(): void {
    this.#deps.timeline.play(this.#deps.now());
    this.#deps.preferences.write({ autoplay: true });
    this.#refresh(false);
  }

  pause(): void {
    this.#deps.timeline.pause(this.#deps.now());
    this.#deps.preferences.write({ autoplay: false });
    this.#refresh(false);
  }

  togglePlay(): void {
    if (this.#deps.timeline.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  step(delta: number): void {
    const wasPlaying = this.#deps.timeline.playing;
    this.#deps.timeline.step(delta, this.#deps.now());
    if (wasPlaying) {
      this.#deps.preferences.write({ autoplay: false });
    }
    this.#refresh(false);
  }

  seek(frame: number): void {
    this.#deps.timeline.seek(frame, this.#deps.now());
    this.#refresh(false);
  }

  setFps(fps: number): void {
    this.#deps.timeline.setFps(fps, this.#deps.now());
    this.#deps.preferences.write({ fps: this.#deps.timeline.fps });
    this.#refresh(false);
  }

  setRenderer(renderer: FlipbookRenderer): void {
    if (renderer === this.#renderer) {
      return;
    }
    this.#deps.surfaces[this.#renderer].conceal();
    this.#renderer = renderer;
    this.#deps.surfaces[renderer].reveal(this.view());
    this.#deps.preferences.write({ renderer });
    this.#refresh(true);
  }

  #refresh(force: boolean): void {
    const view = this.view();
    const previous = force ? undefined : this.#previous;
    const changed = pictureChanged(previous, view);
    if (changed) {
      this.#deps.surfaces[view.renderer].show(view, previous);
    }
    if (changed || view.playing) {
      this.#deps.panel.update(view);
    }
    this.#previous = view;
  }
}
