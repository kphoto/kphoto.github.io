import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (relativeToRepoRoot: string): string =>
  readFileSync(fileURLToPath(new URL(`../${relativeToRepoRoot}`, import.meta.url)), 'utf8');

const imagePattern = /mcr\.microsoft\.com\/playwright:[^\s'"]+/g;
const pinnedImage =
  /^mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-noble@(sha256:[0-9a-f]{64})$/;

const images = (source: string): string[] => source.match(imagePattern) ?? [];

const IMAGE_FILES = ['compose.yaml', '.github/workflows/verify.yml'] as const;
const WORKFLOWS = [
  '.github/workflows/ci.yml',
  '.github/workflows/verify.yml',
  '.github/workflows/deploy.yml',
] as const;

const packageJson = JSON.parse(read('package.json')) as {
  packageManager?: string;
  engines?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe('playwright image pins (ADR 0040)', () => {
  const declared = packageJson.devDependencies?.['@playwright/test'];

  it('declares @playwright/test as an exact version', () => {
    expect(declared).toMatch(/^\d+\.\d+\.\d+$/);
  });

  for (const file of IMAGE_FILES) {
    it(`pins the image in ${file} by matching tag and digest`, () => {
      const found = images(read(file));
      expect(found.length).toBeGreaterThan(0);
      for (const image of found) {
        const match = pinnedImage.exec(image);
        expect(match, image).not.toBeNull();
        expect(match?.[1]).toBe(declared);
      }
    });
  }

  it('uses one and the same image everywhere', () => {
    const all = new Set(IMAGE_FILES.flatMap((file) => images(read(file))));
    expect(all.size).toBe(1);
  });
});

describe('package manager provisioning (ADR 0039)', () => {
  const lib = read('scripts/lib.sh');

  it('pins yarn exactly in packageManager', () => {
    expect(packageJson.packageManager).toMatch(/^yarn@\d+\.\d+\.\d+$/);
  });

  it('pins corepack exactly in scripts/lib.sh', () => {
    expect(lib).toMatch(/^KPHOTO_COREPACK_VERSION=\d+\.\d+\.\d+$/m);
  });

  it('never relies on a corepack bundled with node', () => {
    const bundled = /(^|[\s'"&;])corepack\s+(enable|prepare|install|use)\b/m;
    for (const file of [...WORKFLOWS, 'compose.yaml', 'scripts/lib.sh']) {
      expect(read(file), file).not.toMatch(bundled);
    }
  });

  it('leaves yarn to the scripts in every workflow', () => {
    for (const file of WORKFLOWS) {
      expect(read(file), file).not.toMatch(/cache: yarn/);
    }
  });
});

describe('node version (ADR 0041)', () => {
  const nodeVersion = read('.node-version').trim();

  it('names a bare major version', () => {
    expect(nodeVersion).toMatch(/^\d+$/);
  });

  it('satisfies the engines floor', () => {
    const floor = /^>=(\d+)$/.exec(packageJson.engines?.node ?? '')?.[1];
    expect(floor).toBeDefined();
    expect(Number(nodeVersion)).toBeGreaterThanOrEqual(Number(floor));
  });

  it('is the only node version the runner-hosted jobs use', () => {
    for (const file of WORKFLOWS) {
      const source = read(file);
      expect(source, file).not.toMatch(/node-version:/);
      if (source.includes('actions/setup-node')) {
        expect(source, file).toMatch(/node-version-file: \.node-version/);
      }
    }
  });
});
