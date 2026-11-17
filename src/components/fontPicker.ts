import { FONTS, type FontName } from '../client/storage.ts';
import type { MessageKey } from '../i18n/messages/index.ts';
import type { Translator } from '../i18n/translator.ts';
import { renderSettingSelect } from './settingSelect.ts';

export const FONT_LABEL_KEYS: Readonly<Record<FontName, MessageKey>> = {
  standard: 'font.standard',
  handwriting: 'font.handwriting',
};

export function renderFontPicker(t: Translator): string {
  return renderSettingSelect({
    tag: 'kp-font-picker',
    id: 'font-select',
    labelHtml: t.html('font.label'),
    options: FONTS.map((font) => ({ value: font, label: t.text(FONT_LABEL_KEYS[font]) })),
  });
}
