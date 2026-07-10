import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readContentInput } from './loadContent';

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

  it('returns empty records when content/ is missing entirely', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'kphoto-empty-'));
    expect(await readContentInput(root)).toEqual({ blog: {}, authors: {}, pages: {} });
  });
});
