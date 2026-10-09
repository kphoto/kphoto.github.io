import { describe, expect, it } from 'vitest';
import {
  NARRATION_DIRECTORY,
  NARRATION_MEDIA_TYPES,
  narrationFor,
  narrationLocation,
} from './narration.ts';

describe('narrationFor', () => {
  it('serves a WAV file from the spoken directory as audio/wav', () => {
    expect(narrationFor('clean-hands-clean-food-en.wav')).toEqual({
      file: 'clean-hands-clean-food-en.wav',
      src: '/spoken/clean-hands-clean-food-en.wav',
      type: 'audio/wav',
    });
  });

  it.each(Object.entries(NARRATION_MEDIA_TYPES))('knows .%s as %s', (extension, type) => {
    expect(narrationFor(`episode-1.${extension}`).type).toBe(type);
  });

  it('rejects file types browsers are not asked to play', () => {
    expect(() => narrationFor('episode.aiff')).toThrow(/"\.aiff" is not supported \(use \.wav, /);
  });

  it.each([
    ['upper case', 'Episode.wav'],
    ['a path', 'nested/episode.wav'],
    ['a parent path', '../episode.wav'],
    ['no extension', 'episode'],
    ['spaces', 'my episode.wav'],
    ['a leading hyphen', '-episode.wav'],
    ['doubled hyphens', 'episode--one.wav'],
    ['an empty name', '.wav'],
  ])('rejects %s', (_label, fileName) => {
    expect(() => narrationFor(fileName)).toThrow(/must be a file name like name-en\.wav/);
  });
});

describe('narrationLocation', () => {
  it('names the file under public/', () => {
    expect(narrationLocation('a-en.wav')).toBe(`public/${NARRATION_DIRECTORY}/a-en.wav`);
  });
});
