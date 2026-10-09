import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readContentInput } from './loadContent.ts';

describe('readContentInput', () => {
  it('reads blog, authors and pages by file name', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'kphoto-'));
    await mkdir(path.join(root, 'content', 'blog'), { recursive: true });
    await mkdir(path.join(root, 'content', 'authors'), { recursive: true });
    await writeFile(path.join(root, 'content', 'blog', 'a.md'), 'A', 'utf8');
    await writeFile(path.join(root, 'content', 'authors', 'x.yml'), 'name: X', 'utf8');

    const input = await readContentInput(root);
    expect(input.blog).toEqual({ 'a.md': 'A' });
    expect(input.authors).toEqual({ 'x.yml': 'name: X' });
    expect(input.pages).toEqual({});
  });

  it('lists narration files in public/spoken by name only, sorted, skipping folders', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'kphoto-spoken-'));
    const spoken = path.join(root, 'public', 'spoken');
    await mkdir(path.join(spoken, 'drafts'), { recursive: true });
    await writeFile(path.join(spoken, 'b-es.wav'), 'RIFF', 'utf8');
    await writeFile(path.join(spoken, 'a-en.wav'), 'RIFF', 'utf8');

    expect((await readContentInput(root)).spoken).toEqual(['a-en.wav', 'b-es.wav']);
  });

  it('returns empty records when content/ and public/spoken are missing entirely', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'kphoto-empty-'));
    expect(await readContentInput(root)).toEqual({ blog: {}, authors: {}, pages: {}, spoken: [] });
  });
});
