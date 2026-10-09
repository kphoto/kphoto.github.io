import { browserStore } from './browser.ts';
import { connectNarration, ListeningProgress, type NarrationPlayer } from './narration.ts';
import type { SettingsStore } from './storage.ts';

function audioPlayer(audio: HTMLAudioElement, source: string): NarrationPlayer {
  return {
    source,
    hasMetadata: () => audio.readyState >= HTMLMediaElement.HAVE_METADATA,
    duration: () => audio.duration,
    currentTime: () => audio.currentTime,
    seek: (seconds) => {
      audio.currentTime = seconds;
    },
    rate: () => audio.playbackRate,
    setRate: (rate) => {
      audio.defaultPlaybackRate = rate;
      audio.playbackRate = rate;
    },
    on: (event, listener) => {
      audio.addEventListener(event, listener);
    },
  };
}

export function defineNarrationElement(settings: SettingsStore): void {
  const progress = new ListeningProgress(browserStore);

  class NarrationElement extends HTMLElement {
    connectedCallback(): void {
      const audio = this.shadowRoot?.querySelector('audio');
      const source = audio?.querySelector('source')?.getAttribute('src');
      if (!(audio instanceof HTMLAudioElement) || source === null || source === undefined) {
        return;
      }
      connectNarration(audioPlayer(audio, source), { settings, progress });
    }
  }

  customElements.define('kp-narration', NarrationElement);
}
