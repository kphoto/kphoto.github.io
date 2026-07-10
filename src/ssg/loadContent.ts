import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ContentInput } from '../lib/types';

async function readDirectory(directory: string): Promise<Record<string, string>> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return {};
  }
  const record: Record<string, string> = {};
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    record[entry.name] = await readFile(path.join(directory, entry.name), 'utf8');
  }
  return record;
}

/** Reads the raw content tree; parsing and validation stay pure elsewhere. */
export async function readContentInput(rootDir: string): Promise<ContentInput> {
  const contentDir = path.join(rootDir, 'content');
  const [blog, authors, pages] = await Promise.all([
    readDirectory(path.join(contentDir, 'blog')),
    readDirectory(path.join(contentDir, 'authors')),
    readDirectory(path.join(contentDir, 'pages')),
  ]);
  return { blog, authors, pages };
}
