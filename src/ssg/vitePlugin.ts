import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { catalogs } from '../i18n/messages/index.ts';
import { validateLocaleSettings } from '../i18n/locales.ts';
import { resolveBuildInfo } from '../lib/buildInfo.ts';
import { contentLocales, siteConfig } from '../lib/config.ts';
import { ContentValidationError, loadSiteModel } from '../lib/content.ts';
import { isoDateInTimeZone } from '../lib/dates.ts';
import { escapeHtml } from '../lib/html.ts';
import { outputFileFor, renderSite, type SiteContext } from '../pages/routes.ts';
import type { RenderedFile } from '../pages/routes.ts';
import { nodeGitReader } from './git.ts';
import { readContentInput } from './loadContent.ts';

const DEV_ASSETS = {
  scriptSrc: '/src/client/main.ts',
  styleHref: '/src/styles/global.css',
} as const;

interface ManifestChunk {
  readonly file: string;
}

function publishedThrough(now: Date): string | undefined {
  if (process.env.KPHOTO_SHOW_FUTURE === '1') {
    return undefined;
  }
  return isoDateInTimeZone(now, siteConfig.timeZone);
}

async function renderCurrentSite(
  rootDir: string,
  assets: SiteContext['assets'],
): Promise<RenderedFile[]> {
  const now = new Date();
  const input = await readContentInput(rootDir);
  validateLocaleSettings(siteConfig);
  const model = loadSiteModel(input, publishedThrough(now), contentLocales(siteConfig));
  return renderSite(model, {
    config: siteConfig,
    assets,
    buildYear: now.getUTCFullYear(),
    build: resolveBuildInfo(process.env, nodeGitReader(rootDir)),
    catalogs,
  });
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
