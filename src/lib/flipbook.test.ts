import { describe, expect, it } from 'vitest';
import {
  clampFps,
  climbAngle,
  climbFade,
  DEFAULT_RENDERER,
  FLIPBOOK_FRAME_BASE,
  FLIPBOOK_FRAME_COUNT,
  FLIPBOOK_ORIGINAL_FPS,
  FLIPBOOK_RENDERERS,
  FlipbookTimeline,
  flipbookKeyframes,
  frameAt,
  frameFileName,
  frameUrls,
  isFlipbookRenderer,
  isFps,
  MAX_CLIMB_DEGREES,
  MAX_FPS,
  MIN_FPS,
  parseFrameList,
  truncate,
  wrapFrame,
} from './flipbook.ts';

describe('frame files', () => {
  it('numbers files from one with three digits', () => {
    expect(frameFileName(0)).toBe('frame_001.png');
    expect(frameFileName(9)).toBe('frame_010.png');
    expect(frameFileName(27)).toBe('frame_028.png');
  });

  it('lists every frame under the public images folder', () => {
    const urls = frameUrls();
    expect(urls).toHaveLength(FLIPBOOK_FRAME_COUNT);
    expect(urls[0]).toBe(`${FLIPBOOK_FRAME_BASE}frame_001.png`);
    expect(urls.at(-1)).toBe('/images/flapping-airplanes/frame_028.png');
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('accepts another base and count', () => {
    expect(frameUrls('/x/', 2)).toEqual(['/x/frame_001.png', '/x/frame_002.png']);
  });
});

describe('parseFrameList', () => {
  it('reads the list the component renders', () => {
    expect(parseFrameList(JSON.stringify(frameUrls()))).toEqual(frameUrls());
  });

  it('rejects anything that is not a non-empty list of site paths', () => {
    for (const raw of [
      undefined,
      '',
      'nope',
      '{}',
      '[]',
      '[1, 2]',
      '["https://elsewhere.example/frame.png"]',
      '["//elsewhere.example/frame.png"]',
      '["/ok.png", null]',
    ]) {
      expect(parseFrameList(raw)).toBeNull();
    }
  });
});

describe('wrapFrame', () => {
  it('wraps forwards and backwards', () => {
    expect(wrapFrame(0, 28)).toBe(0);
    expect(wrapFrame(28, 28)).toBe(0);
    expect(wrapFrame(29, 28)).toBe(1);
    expect(wrapFrame(-1, 28)).toBe(27);
    expect(wrapFrame(-29, 28)).toBe(27);
  });

  it('floors fractional frames', () => {
    expect(wrapFrame(3.99, 28)).toBe(3);
    expect(wrapFrame(-0.5, 28)).toBe(27);
  });
});

describe('frameAt', () => {
  it('is floor(t × fps) mod count', () => {
    expect(frameAt(0, 12, 28)).toBe(0);
    expect(frameAt(83, 12, 28)).toBe(0);
    expect(frameAt(84, 12, 28)).toBe(1);
    expect(frameAt(1000, 12, 28)).toBe(12);
    expect(frameAt(2334, 12, 28)).toBe(0);
  });

  it('does not depend on the display refresh rate', () => {
    const at60 = Array.from({ length: 61 }, (_, i) => frameAt((i * 1000) / 60, 12, 28));
    const at144 = Array.from({ length: 145 }, (_, i) => frameAt((i * 1000) / 144, 12, 28));
    expect(at60.at(-1)).toBe(at144.at(-1));
    expect(new Set(at60)).toEqual(new Set(at144));
  });
});

describe('frame rate validation', () => {
  it('accepts whole rates within bounds', () => {
    for (const fps of [MIN_FPS, 12, 24, MAX_FPS]) {
      expect(isFps(fps)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    for (const value of [0, 61, 12.5, -12, Number.NaN, '12', null, undefined]) {
      expect(isFps(value)).toBe(false);
    }
  });

  it('clamps and rounds', () => {
    expect(clampFps(0)).toBe(MIN_FPS);
    expect(clampFps(500)).toBe(MAX_FPS);
    expect(clampFps(11.6)).toBe(12);
    expect(clampFps(Number.NaN)).toBe(FLIPBOOK_ORIGINAL_FPS);
    expect(clampFps(Infinity)).toBe(FLIPBOOK_ORIGINAL_FPS);
  });
});

describe('renderers', () => {
  it('knows the three techniques', () => {
    expect(FLIPBOOK_RENDERERS).toEqual(['image', 'canvas', 'css']);
    expect(isFlipbookRenderer(DEFAULT_RENDERER)).toBe(true);
  });

  it('rejects unknown names', () => {
    for (const value of ['webgl', '', 42, null]) {
      expect(isFlipbookRenderer(value)).toBe(false);
    }
  });
});

describe('climb', () => {
  it('tilts up to the original maximum over the first 60 % of a screen', () => {
    expect(climbAngle(0)).toBe(0);
    expect(climbAngle(0.3)).toBeCloseTo(MAX_CLIMB_DEGREES / 2);
    expect(climbAngle(0.6)).toBe(MAX_CLIMB_DEGREES);
    expect(climbAngle(1)).toBe(MAX_CLIMB_DEGREES);
    expect(climbAngle(-1)).toBe(0);
  });

  it('fades out between 48 % and 66 % with a smoothstep', () => {
    expect(climbFade(0)).toBe(1);
    expect(climbFade(0.48)).toBe(1);
    expect(climbFade(0.57)).toBeCloseTo(0.5);
    expect(climbFade(0.66)).toBeCloseTo(0);
    expect(climbFade(1)).toBe(0);
  });
});

describe('truncate', () => {
  it('drops digits instead of rounding', () => {
    expect(truncate(12.999, 2)).toBe(12.99);
    expect(truncate(1.005, 1)).toBe(1);
    expect(truncate(3, 2)).toBe(3);
  });
});

describe('flipbookKeyframes', () => {
  it('writes one stop per frame at even percentages', () => {
    const css = flipbookKeyframes('flap', ['/a.png', '/b.png', '/c.png', '/d.png']);
    expect(css.startsWith('@keyframes flap {')).toBe(true);
    expect(css).toContain("0% { background-image: url('/a.png'); }");
    expect(css).toContain("25% { background-image: url('/b.png'); }");
    expect(css).toContain("75% { background-image: url('/d.png'); }");
    expect(css.trim().endsWith('}')).toBe(true);
  });

  it('keeps fractional stops short', () => {
    const css = flipbookKeyframes('flap', frameUrls());
    expect(css).toContain(
      "3.5714% { background-image: url('/images/flapping-airplanes/frame_002.png'); }",
    );
    expect(css.match(/background-image/g)).toHaveLength(FLIPBOOK_FRAME_COUNT);
  });
});

describe('FlipbookTimeline', () => {
  const make = (frame = 0): FlipbookTimeline => new FlipbookTimeline({ count: 28, fps: 12, frame });

  it('rejects an empty flipbook', () => {
    expect(() => new FlipbookTimeline({ count: 0, fps: 12 })).toThrow(/at least one frame/);
  });

  it('starts paused on the given frame', () => {
    const timeline = make(5);
    expect(timeline.playing).toBe(false);
    expect(timeline.frame(10_000)).toBe(5);
    expect(timeline.seconds(10_000)).toBeCloseTo(5 / 12);
  });

  it('wraps the starting frame', () => {
    expect(make(30).frame(0)).toBe(2);
  });

  it('clamps the starting rate', () => {
    expect(new FlipbookTimeline({ count: 2, fps: 500 }).fps).toBe(MAX_FPS);
  });

  it('advances with time while playing', () => {
    const timeline = make();
    timeline.play(1000);
    expect(timeline.playing).toBe(true);
    expect(timeline.frame(1000)).toBe(0);
    expect(timeline.frame(1084)).toBe(1);
    expect(timeline.frame(2000)).toBe(12);
    expect(timeline.frame(1000 + (28 * 1000) / 12)).toBe(0);
  });

  it('ignores a second play', () => {
    const timeline = make();
    timeline.play(0);
    timeline.play(500);
    expect(timeline.frame(1000)).toBe(12);
  });

  it('holds the frame it paused on', () => {
    const timeline = make();
    timeline.play(0);
    timeline.pause(1000);
    expect(timeline.playing).toBe(false);
    expect(timeline.frame(99_999)).toBe(12);
    timeline.pause(5000);
    expect(timeline.frame(5000)).toBe(12);
  });

  it('resumes from where it paused', () => {
    const timeline = make();
    timeline.play(0);
    timeline.pause(1000);
    timeline.play(50_000);
    expect(timeline.frame(50_000)).toBe(12);
    expect(timeline.frame(51_000)).toBe(24);
  });

  it('seeks while paused and while playing', () => {
    const timeline = make();
    timeline.seek(7, 0);
    expect(timeline.frame(0)).toBe(7);
    timeline.play(100);
    timeline.seek(20, 200);
    expect(timeline.frame(200)).toBe(20);
    expect(timeline.frame(1200)).toBe(4);
  });

  it('steps by single frames and pauses', () => {
    const timeline = make();
    timeline.play(0);
    timeline.step(1, 1000);
    expect(timeline.playing).toBe(false);
    expect(timeline.frame(1000)).toBe(13);
    timeline.step(-14, 1000);
    expect(timeline.frame(1000)).toBe(27);
  });

  it('keeps its place when the rate changes mid-flight', () => {
    const timeline = make();
    timeline.play(0);
    timeline.setFps(24, 1000);
    expect(timeline.fps).toBe(24);
    expect(timeline.frame(1000)).toBe(12);
    expect(timeline.frame(1500)).toBe(24);
  });

  it('changes rate while paused without moving', () => {
    const timeline = make(3);
    timeline.setFps(1, 0);
    expect(timeline.frame(10_000)).toBe(3);
    timeline.setFps(1, 10);
    expect(timeline.fps).toBe(1);
  });

  it('keeps the position fractional and the seconds consistent', () => {
    const timeline = make();
    timeline.play(0);
    expect(timeline.position(1250)).toBeCloseTo(15);
    expect(timeline.seconds(1250)).toBeCloseTo(1.25);
    expect(Math.floor(timeline.position(1250))).toBe(timeline.frame(1250));
    expect(timeline.position(2400)).toBeCloseTo(0.8);
  });
});
