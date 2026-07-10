import { describe, expect, it } from 'vitest';
import { parseYaml, YamlParseError } from './yaml';

describe('parseYaml', () => {
  it('parses scalar key/value pairs with type inference', () => {
    expect(
      parseYaml('title: Good morning!\nepisode: 2\npi: 3.5\nlive: true\nnothing: null'),
    ).toEqual({
      title: 'Good morning!',
      episode: 2,
      pi: 3.5,
      live: true,
      nothing: null,
    });
  });

  it('keeps date-looking scalars as strings', () => {
    expect(parseYaml('date: 2026-03-22')).toEqual({ date: '2026-03-22' });
  });

  it('parses block lists of scalars', () => {
    expect(parseYaml('tags:\n  - introductions\n  - site-notes')).toEqual({
      tags: ['introductions', 'site-notes'],
    });
  });

  it('parses nested mappings by indentation', () => {
    expect(parseYaml('socials:\n  github: kphoto\n  bluesky: kphoto.example')).toEqual({
      socials: { github: 'kphoto', bluesky: 'kphoto.example' },
    });
  });

  it('handles quoted strings with escapes', () => {
    expect(parseYaml("a: \"line\\nbreak\"\nb: 'it''s'")).toEqual({
      a: 'line\nbreak',
      b: "it's",
    });
  });

  it('ignores comments and blank lines', () => {
    expect(parseYaml('# leading comment\n\ntitle: hi\n# trailing')).toEqual({ title: 'hi' });
  });

  it('rejects tabs with a line number', () => {
    try {
      parseYaml('title: ok\n\tbad: tab');
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(YamlParseError);
      expect((error as YamlParseError).message).toContain('line 2');
    }
  });

  it('rejects duplicate keys', () => {
    expect(() => parseYaml('a: 1\na: 2')).toThrow(YamlParseError);
  });

  it('rejects unindented content after a list is opened', () => {
    expect(() => parseYaml('tags:\n- item')).toThrow(YamlParseError);
  });

  it('rejects documents that are not mappings', () => {
    expect(() => parseYaml('- just\n- a list')).toThrow(YamlParseError);
  });

  it('parses an empty document to an empty map', () => {
    expect(parseYaml('')).toEqual({});
    expect(parseYaml('\n# only comments\n')).toEqual({});
  });
});
