import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NARRATION_DIRECTORY } from '../lib/narration.ts';
import type { ContentInput } from '../lib/types.ts';

async function listFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

async function readDirectory(directory: string): Promise<Record<string, string>> {
  const record: Record<string, string> = {};
  for (const name of await listFiles(directory)) {
    record[name] = await readFile(path.join(directory, name), 'utf8');
  }
  return record;
}

export async function readContentInput(rootDir: string): Promise<ContentInput> {
  const contentDir = path.join(rootDir, 'content');
  const [blog, authors, pages, spoken] = await Promise.all([
    readDirectory(path.join(contentDir, 'blog')),
    readDirectory(path.join(contentDir, 'authors')),
    readDirectory(path.join(contentDir, 'pages')),
    listFiles(path.join(rootDir, 'public', NARRATION_DIRECTORY)),
  ]);
  return { blog, authors, pages, spoken };
}
