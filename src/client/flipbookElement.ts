import {
  climbAngle,
  climbFade,
  FlipbookTimeline,
  frameFileName,
  isFlipbookRenderer,
  parseFrameList,
  truncate,
} from '../lib/flipbook.ts';
import { browserStore } from './browser.ts';
import {
  FlipbookController,
  needsResync,
  type FlipbookPanel,
  type FlipbookView,
  type FrameSurface,
} from './flipbookController.ts';
import { FlipbookPreferenceStore, startingState } from './flipbookPreferences.ts';

type State = 'idle' | 'loading' | 'ready' | 'failed';

async function loadFrame(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

function imageSurface(
  element: HTMLImageElement,
  images: readonly HTMLImageElement[],
): FrameSurface {
  return {
    reveal: () => {
      element.hidden = false;
    },
    conceal: () => {
      element.hidden = true;
    },
    show: (view) => {
      const source = images[view.frame];
      if (source) {
        element.src = source.src;
      }
    },
  };
}

function canvasSurface(canvas: HTMLCanvasElement, bitmaps: readonly ImageBitmap[]): FrameSurface {
  const context = canvas.getContext('2d');
  return {
    reveal: () => {
      canvas.hidden = false;
    },
    conceal: () => {
      canvas.hidden = true;
    },
    show: (view) => {
      const bitmap = bitmaps[view.frame];
      if (context && bitmap) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }
    },
  };
}

function cssSurface(element: HTMLElement): FrameSurface {
  const sync = (view: FlipbookView): void => {
    element.style.setProperty('--fps', String(view.fps));
    const animation = element.getAnimations()[0];
    if (!animation) {
      return;
    }
    const position = view.playing ? view.position : view.frame + 0.5;
    animation.currentTime = (position / view.fps) * 1000;
    if (view.playing) {
      animation.play();
    } else {
      animation.pause();
    }
  };
  return {
    reveal: (view) => {
      element.hidden = false;
      sync(view);
    },
    conceal: () => {
      element.hidden = true;
    },
    show: (view, previous) => {
      if (needsResync(previous, view)) {
        sync(view);
      }
    },
  };
}

function setText(root: ShadowRoot, name: string, text: string): void {
  const target = root.querySelector(`[data-out="${name}"]`);
  if (target && target.textContent !== text) {
    target.textContent = text;
  }
}

function input(root: ShadowRoot, name: string): HTMLInputElement | null {
  const element = root.querySelector(`input[data-control="${name}"]`);
  return element instanceof HTMLInputElement ? element : null;
}

function panelFor(host: HTMLElement, root: ShadowRoot): FlipbookPanel {
  const locale = document.documentElement.lang || 'en';
  const twoPlaces = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const whole = new Intl.NumberFormat(locale);
  const toggle = root.querySelector<HTMLButtonElement>('button[data-action="toggle"]');
  const frameInput = input(root, 'frame');
  const fpsInput = input(root, 'fps');
  const thumbs = [...root.querySelectorAll<HTMLLIElement>('.filmstrip li')];
  const strip = root.querySelector<HTMLElement>('.filmstrip');
  let currentThumb = -1;
  return {
    update(view) {
      host.dataset.frame = String(view.frame);
      host.dataset.playing = String(view.playing);
      host.dataset.renderer = view.renderer;
      if (toggle) {
        const label = (view.playing ? toggle.dataset.pause : toggle.dataset.play) ?? '';
        if (toggle.textContent !== label) {
          toggle.textContent = label;
        }
      }
      if (frameInput) {
        frameInput.value = String(view.frame + 1);
      }
      if (fpsInput) {
        fpsInput.value = String(view.fps);
      }
      setText(root, 'frame', whole.format(view.frame + 1));
      setText(root, 'fps', whole.format(view.fps));
      setText(root, 'seconds', `${twoPlaces.format(truncate(view.seconds, 2))} s`);
      setText(root, 'product', twoPlaces.format(truncate(view.position, 2)));
      setText(root, 'index', whole.format(view.frame));
      setText(root, 'file', frameFileName(view.frame));
      for (const radio of root.querySelectorAll<HTMLInputElement>('input[name="renderer"]')) {
        radio.checked = radio.value === view.renderer;
      }
      if (currentThumb !== view.frame) {
        thumbs[currentThumb]?.removeAttribute('data-current');
        const thumb = thumbs[view.frame];
        thumb?.setAttribute('data-current', '');
        if (thumb && strip && !view.playing) {
          strip.scrollLeft = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
        }
        currentThumb = view.frame;
      }
    },
  };
}

function connectClimb(root: ShadowRoot): void {
  const slider = input(root, 'climb');
  const tilt = root.querySelector<HTMLElement>('[data-tilt]');
  if (!slider || !tilt) {
    return;
  }
  const degrees = new Intl.NumberFormat(document.documentElement.lang || 'en', {
    maximumFractionDigits: 1,
  });
  const apply = (): void => {
    const progress = Number(slider.value) / 100;
    const angle = climbAngle(progress);
    tilt.style.setProperty('--climb', String(angle));
    tilt.style.setProperty('--fade', String(climbFade(progress)));
    setText(root, 'climb', `${degrees.format(angle)}°`);
  };
  slider.addEventListener('input', apply);
  apply();
}

class FlipbookElement extends HTMLElement {
  #frame = 0;

  connectedCallback(): void {
    void this.#upgrade();
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  #setState(root: ShadowRoot, state: State): void {
    this.dataset.state = state;
    for (const span of root.querySelectorAll<HTMLElement>('[data-when]')) {
      span.hidden = span.dataset.when !== state;
    }
  }

  async #upgrade(): Promise<void> {
    const root = this.shadowRoot;
    const urls = parseFrameList(this.dataset.frames);
    const image = root?.querySelector('img[data-surface="image"]');
    const canvas = root?.querySelector('canvas[data-surface="canvas"]');
    const css = root?.querySelector('div[data-surface="css"]');
    if (
      !root ||
      !urls ||
      !(image instanceof HTMLImageElement) ||
      !(canvas instanceof HTMLCanvasElement) ||
      !(css instanceof HTMLDivElement)
    ) {
      return;
    }
    const progress = root.querySelector('progress');
    this.#setState(root, 'loading');
    if (progress) {
      progress.hidden = false;
    }
    let loaded = 0;
    let images: HTMLImageElement[];
    let bitmaps: ImageBitmap[];
    try {
      images = await Promise.all(
        urls.map(async (url) => {
          const frame = await loadFrame(url);
          loaded += 1;
          if (progress) {
            progress.value = loaded;
          }
          return frame;
        }),
      );
      bitmaps = await Promise.all(images.map((frame) => createImageBitmap(frame)));
    } catch {
      this.#setState(root, 'failed');
      if (progress) {
        progress.hidden = true;
      }
      return;
    }
    if (progress) {
      progress.hidden = true;
    }

    const preferences = new FlipbookPreferenceStore(browserStore);
    const start = startingState(
      preferences.read(),
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    const controller = new FlipbookController(
      {
        timeline: new FlipbookTimeline({ count: urls.length, fps: start.fps }),
        surfaces: {
          image: imageSurface(image, images),
          canvas: canvasSurface(canvas, bitmaps),
          css: cssSurface(css),
        },
        panel: panelFor(this, root),
        preferences,
        now: () => performance.now(),
      },
      start.renderer,
    );

    root.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      controller.step(-1);
    });
    root.querySelector('[data-action="forward"]')?.addEventListener('click', () => {
      controller.step(1);
    });
    root.querySelector('[data-action="toggle"]')?.addEventListener('click', () => {
      controller.togglePlay();
    });
    const frameInput = input(root, 'frame');
    frameInput?.addEventListener('input', () => {
      controller.seek(Number(frameInput.value) - 1);
    });
    const fpsInput = input(root, 'fps');
    fpsInput?.addEventListener('input', () => {
      controller.setFps(Number(fpsInput.value));
    });
    for (const radio of root.querySelectorAll<HTMLInputElement>('input[name="renderer"]')) {
      radio.addEventListener('change', () => {
        if (radio.checked && isFlipbookRenderer(radio.value)) {
          controller.setRenderer(radio.value);
        }
      });
    }
    connectClimb(root);
    for (const control of root.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
      'button, input',
    )) {
      control.disabled = false;
    }

    controller.start(start.playing);
    this.#setState(root, 'ready');

    const loop = (): void => {
      controller.tick();
      this.#frame = requestAnimationFrame(loop);
    };
    new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        if (this.#frame === 0) {
          this.#frame = requestAnimationFrame(loop);
        }
      } else {
        cancelAnimationFrame(this.#frame);
        this.#frame = 0;
        controller.tick();
      }
    }).observe(this);
  }
}

export function defineFlipbookElement(): void {
  customElements.define('kp-flipbook', FlipbookElement);
}
