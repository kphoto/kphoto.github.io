import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { siteConfig } from '../lib/config';
import { ContentValidationError, loadSiteModel } from '../lib/content';
import { escapeHtml } from '../lib/html';
import { outputFileFor, renderSite, type PageContext } from '../pages/routes';
import type { RenderedFile } from '../pages/routes';
import { readContentInput } from './loadContent';

/** Asset URLs used by the dev server; the build swaps in hashed files. */
const DEV_ASSETS = {
  scriptSrc: '/src/client/main.ts',
  styleHref: '/src/styles/global.css',
} as const;

interface ManifestChunk {
  readonly file: string;
}

function pageContext(assets: PageContext['assets']): PageContext {
  return { config: siteConfig, assets, buildYear: new Date().getUTCFullYear() };
}

async function renderCurrentSite(
  rootDir: string,
  assets: PageContext['assets'],
): Promise<RenderedFile[]> {
  const input = await readContentInput(rootDir);
  const model = loadSiteModel(input);
  return renderSite(model, pageContext(assets));
}

function send(
  res: ServerResponse,
  status: number,
  body: string,
  contentType: RenderedFile['contentType'],
): void {
  res.statusCode = status;
  res.setHeader('Content-Type', `${contentType}; charset=utf-8`);
  res.end(body);
}

function errorPage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>Content error</title></head>
<body style="font-family: ui-monospace, monospace; padding: 2rem;">
<h1>Content error</h1>
<pre style="white-space: pre-wrap;">${escapeHtml(message)}</pre>
<p>Fix the file and save; this page reloads automatically.</p>
</body></html>`;
}

function devMiddleware(server: ViteDevServer, rootDir: string) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void): Promise<void> => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }
    const pathname = (req.url ?? '/').split('?')[0] ?? '/';
    const extension = path.posix.extname(pathname);
    if (extension !== '' && extension !== '.html' && extension !== '.xml') {
      next();
      return;
    }
    if (extension === '' && !pathname.endsWith('/')) {
      res.statusCode = 301;
      res.setHeader('Location', `${pathname}/`);
      res.end();
      return;
    }
    try {
      const files = await renderCurrentSite(rootDir, DEV_ASSETS);
      const file = files.find((candidate) => candidate.path === pathname);
      if (file?.contentType === 'application/xml') {
        send(res, 200, file.body, file.contentType);
        return;
      }
      const page = file ?? files.find((candidate) => candidate.path === '/404.html');
      if (!page) {
        next();
        return;
      }
      const html = await server.transformIndexHtml(pathname, page.body);
      send(res, file ? 200 : 404, html, 'text/html');
    } catch (error) {
      if (error instanceof ContentValidationError) {
        send(res, 500, errorPage(error), 'text/html');
        return;
      }
      throw error;
    }
  };
}

/**
 * Turns Vite into this site's static site generator:
 *
 * - dev: renders every route on request from the current content, injects the
 *   Vite client for HMR, and full-reloads when anything under content/ changes
 * - build: after Vite bundles the client entry and the stylesheet, reads the
 *   manifest for the hashed asset names and writes every HTML page, the 404
 *   page, feed.xml and sitemap.xml into the output directory
 */
export function kphotoSsg(): Plugin {
  let resolved: ResolvedConfig | undefined;
  return {
    name: 'kphoto-ssg',

    configResolved(config) {
      resolved = config;
    },

    configureServer(server) {
      const rootDir = server.config.root;
      const contentDir = path.join(rootDir, 'content');
      server.watcher.add(contentDir);
      server.watcher.on('all', (_event, file) => {
        if (file.startsWith(contentDir + path.sep)) {
          server.ws.send({ type: 'full-reload', path: '*' });
        }
      });
      return () => {
        server.middlewares.use((req, res, next) => {
          void devMiddleware(server, rootDir)(req, res, next).catch(next);
        });
      };
    },

    configurePreviewServer(server) {
      const outDir = path.resolve(server.config.root, server.config.build.outDir);
      const handler = async (
        req: IncomingMessage,
        res: ServerResponse,
        next: () => void,
      ): Promise<void> => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next();
          return;
        }
        const pathname = (req.url ?? '/').split('?')[0] ?? '/';
        const extension = path.posix.extname(pathname);
        if (extension !== '') {
          next();
          return;
        }
        if (!pathname.endsWith('/')) {
          res.statusCode = 301;
          res.setHeader('Location', `${pathname}/`);
          res.end();
          return;
        }
        try {
          const body = await readFile(path.join(outDir, pathname, 'index.html'), 'utf8');
          send(res, 200, body, 'text/html');
        } catch {
          const notFound = await readFile(path.join(outDir, '404.html'), 'utf8');
          send(res, 404, notFound, 'text/html');
        }
      };
      return () => {
        server.middlewares.use((req, res, next) => {
          void handler(req, res, next).catch(next);
        });
      };
    },

    async closeBundle() {
      if (resolved?.command !== 'build') {
        return;
      }
      const rootDir = resolved.root;
      const outDir = path.resolve(rootDir, resolved.build.outDir);
      const manifestRaw = await readFile(path.join(outDir, '.vite', 'manifest.json'), 'utf8');
      const manifest = JSON.parse(manifestRaw) as Record<string, ManifestChunk | undefined>;
      const script = manifest['src/client/main.ts']?.file;
      const style = manifest['src/styles/global.css']?.file;
      if (script === undefined || style === undefined) {
        throw new Error(
          'kphoto-ssg: expected src/client/main.ts and src/styles/global.css in the Vite manifest',
        );
      }
      const files = await renderCurrentSite(rootDir, {
        scriptSrc: `/${script}`,
        styleHref: `/${style}`,
      });
      for (const file of files) {
        const destination = path.join(outDir, outputFileFor(file.path));
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, file.body, 'utf8');
      }
      resolved.logger.info(`kphoto-ssg: wrote ${String(files.length)} pages and feeds`);
    },
  };
}
