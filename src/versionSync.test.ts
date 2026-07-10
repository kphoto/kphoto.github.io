import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Playwright only guarantees that its bundled browsers work with the matching
 * library version, so the container image pinned in compose.yaml and in the
 * CI workflow must stay in lockstep with devDependencies["@playwright/test"]
 * (ADR 0017). This test fails the unit suite the moment any pin drifts.
 */

const read = (relativeToRepoRoot: string): string =>
  readFileSync(fileURLToPath(new URL(`../${relativeToRepoRoot}`, import.meta.url)), 'utf8');

const imagePattern = /mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-noble/g;

const imageVersions = (source: string): string[] =>
  [...source.matchAll(imagePattern)].map((match) => match[1] ?? '');

describe('playwright version pins', () => {
  const packageJson = JSON.parse(read('package.json')) as {
    devDependencies?: Record<string, string>;
  };
  const declared = packageJson.devDependencies?.['@playwright/test'];

  it('declares @playwright/test as an exact version', () => {
    expect(declared).toMatch(/^\d+\.\d+\.\d+$/);
  });

  for (const file of ['compose.yaml', '.github/workflows/verify.yml']) {
    it(`pins the matching container image in ${file}`, () => {
      const versions = imageVersions(read(file));
      expect(versions.length).toBeGreaterThan(0);
      for (const version of versions) {
        expect(version).toBe(declared);
      }
    });
  }
});
