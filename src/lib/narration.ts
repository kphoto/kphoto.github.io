import type { Narration } from './types.ts';

export const NARRATION_DIRECTORY = 'spoken';

export const NARRATION_MEDIA_TYPES: Readonly<Record<string, string>> = {
  wav: 'audio/wav',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  opus: 'audio/ogg',
  flac: 'audio/flac',
  webm: 'audio/webm',
};

const NARRATION_FILE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.([a-z0-9]+)$/;

export function narrationFor(fileName: string): Narration {
  const match = NARRATION_FILE_PATTERN.exec(fileName);
  if (!match) {
    throw new Error(
      `"narration" must be a file name like name-en.wav using lower-case letters, digits and hyphens`,
    );
  }
  const extension = match[1] ?? '';
  const type = NARRATION_MEDIA_TYPES[extension];
  if (type === undefined) {
    const supported = Object.keys(NARRATION_MEDIA_TYPES)
      .map((name) => `.${name}`)
      .join(', ');
    throw new Error(`"narration" file type ".${extension}" is not supported (use ${supported})`);
  }
  return { file: fileName, src: `/${NARRATION_DIRECTORY}/${fileName}`, type };
}

export function narrationLocation(fileName: string): string {
  return `public/${NARRATION_DIRECTORY}/${fileName}`;
}
