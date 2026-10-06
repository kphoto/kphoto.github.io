import type { Translator } from '../i18n/translator.ts';
import type { SiteConfig } from '../lib/config.ts';

export interface RenderContext {
  readonly config: SiteConfig;
  readonly t: Translator;
  href(path: string): string;
}
