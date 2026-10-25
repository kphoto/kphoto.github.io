export const FLIPBOOK_FRAME_COUNT = 28;

export const FLIPBOOK_ORIGINAL_FPS = 12;

export const MIN_FPS = 1;

export const MAX_FPS = 60;

export const FLIPBOOK_FRAME_BASE = '/images/flapping-airplanes/';

export const FLIPBOOK_FRAME_WIDTH = 900;

export const FLIPBOOK_FRAME_HEIGHT = 723;

export const FLIPBOOK_RENDERERS = ['image', 'canvas', 'css'] as const;

export type FlipbookRenderer = (typeof FLIPBOOK_RENDERERS)[number];

export const DEFAULT_RENDERER: FlipbookRenderer = 'image';

export const MAX_CLIMB_DEGREES = 14;

export const CLIMB_SPAN = 0.6;

export const FADE_START = 0.48;

export const FADE_SPAN = 0.18;

export function isFlipbookRenderer(value: unknown): value is FlipbookRenderer {
  return typeof value === 'string' && (FLIPBOOK_RENDERERS as readonly string[]).includes(value);
}

export function isFps(value: unknown): value is number {
  return (
    typeof value === 'number' && Number.isInteger(value) && value >= MIN_FPS && value <= MAX_FPS
  );
}

export function clampFps(value: number): number {
  if (!Number.isFinite(value)) {
    return FLIPBOOK_ORIGINAL_FPS;
  }
  return Math.min(MAX_FPS, Math.max(MIN_FPS, Math.round(value)));
}

export function wrapFrame(frame: number, count: number): number {
  return ((Math.floor(frame) % count) + count) % count;
}

export function frameFileName(index: number): string {
  return `frame_${String(index + 1).padStart(3, '0')}.png`;
}

export function frameUrls(
  base = FLIPBOOK_FRAME_BASE,
  count = FLIPBOOK_FRAME_COUNT,
): readonly string[] {
  return Array.from({ length: count }, (_, index) => `${base}${frameFileName(index)}`);
}

function isSitePath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
}

export function parseFrameList(raw: string | undefined): readonly string[] | null {
  if (raw === undefined) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isSitePath)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function frameAt(elapsedMs: number, fps: number, count: number): number {
  return wrapFrame((elapsedMs * fps) / 1000, count);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function climbAngle(progress: number): number {
  return clamp01(progress / CLIMB_SPAN) * MAX_CLIMB_DEGREES;
}

export function climbFade(progress: number): number {
  const x = clamp01((progress - FADE_START) / FADE_SPAN);
  return 1 - x * x * (3 - 2 * x);
}

export function truncate(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.floor(value * factor) / factor;
}

export function flipbookKeyframes(name: string, urls: readonly string[]): string {
  const count = urls.length;
  const stops = urls.map((url, index) => {
    const at = Number(((index * 100) / count).toFixed(4));
    return `${String(at)}% { background-image: url('${url}'); }`;
  });
  return `@keyframes ${name} {\n${stops.join('\n')}\n}`;
}

export interface TimelineOptions {
  readonly count: number;
  readonly fps: number;
  readonly frame?: number;
}

export class FlipbookTimeline {
  readonly count: number;
  #fps: number;
  #playing = false;
  #anchorTime = 0;
  #anchorPosition: number;

  constructor({ count, fps, frame = 0 }: TimelineOptions) {
    if (!Number.isInteger(count) || count < 1) {
      throw new Error(`a flipbook needs at least one frame, got ${String(count)}`);
    }
    this.count = count;
    this.#fps = clampFps(fps);
    this.#anchorPosition = wrapFrame(frame, count);
  }

  get fps(): number {
    return this.#fps;
  }

  get playing(): boolean {
    return this.#playing;
  }

  position(now: number): number {
    if (!this.#playing) {
      return this.#anchorPosition;
    }
    const advanced = this.#anchorPosition + ((now - this.#anchorTime) * this.#fps) / 1000;
    return ((advanced % this.count) + this.count) % this.count;
  }

  frame(now: number): number {
    return wrapFrame(this.position(now), this.count);
  }

  seconds(now: number): number {
    return this.position(now) / this.#fps;
  }

  play(now: number): void {
    if (this.#playing) {
      return;
    }
    this.#anchorTime = now;
    this.#playing = true;
  }

  pause(now: number): void {
    if (!this.#playing) {
      return;
    }
    this.#anchorPosition = this.frame(now);
    this.#playing = false;
  }

  seek(frame: number, now: number): void {
    this.#anchorPosition = wrapFrame(frame, this.count);
    this.#anchorTime = now;
  }

  step(delta: number, now: number): void {
    this.pause(now);
    this.seek(this.frame(now) + delta, now);
  }

  setFps(fps: number, now: number): void {
    const next = clampFps(fps);
    if (next === this.#fps) {
      return;
    }
    this.#anchorPosition = this.position(now);
    this.#anchorTime = now;
    this.#fps = next;
  }
}
