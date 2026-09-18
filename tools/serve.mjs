#!/usr/bin/env node
/* ==========================================================================
   AgriVision – zero-dependency static development server
   --------------------------------------------------------------------------
   Usage:
     npm start                 # http://localhost:4173
     npm start -- --port 8080  # custom port
     PORT=5000 npm start       # port via environment

   Why this exists: the site is plain HTML/CSS/JS with no build step, but
   opening files with file:// breaks a few things (relative fetches, clean
   URLs, the 404 page, the service-worker-free caching story). This serves
   the folder exactly like a static host such as GitHub Pages / Netlify /
   Vercel would, so "works locally" means "works in production".

   No dependencies. No build step. Node >= 18.
   ========================================================================== */

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_PORT = 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.sql': 'text/plain; charset=utf-8'
};

/** Parse `--port 1234`, `--host 0.0.0.0` and bare `1234` arguments. */
export function parseArgs(argv = process.argv.slice(2), env = process.env) {
  const opts = {
    port: Number(env.PORT) || DEFAULT_PORT,
    host: env.HOST || '0.0.0.0',
    quiet: false
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--port' || arg === '-p') opts.port = Number(argv[++i]) || opts.port;
    else if (arg.startsWith('--port=')) opts.port = Number(arg.split('=')[1]) || opts.port;
    else if (arg === '--host') opts.host = argv[++i] || opts.host;
    else if (arg.startsWith('--host=')) opts.host = arg.split('=')[1] || opts.host;
    else if (arg === '--quiet' || arg === '-q') opts.quiet = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (/^\d+$/.test(arg)) opts.port = Number(arg);
  }
  return opts;
}

export function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

/** Resolve a URL pathname to a file inside ROOT, or null when it escapes ROOT. */
function safeJoin(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  const normalised = path.posix.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(ROOT, normalised);
  const rel = path.relative(ROOT, full);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return full;
}

async function statOrNull(target) {
  try {
    return await fsp.stat(target);
  } catch {
    return null;
  }
}

/**
 * Resolve a request path to a readable file, mirroring static-host behaviour:
 *  - "/"                 -> index.html
 *  - "/crops"            -> crops.html        (clean URL)
 *  - "/crops/"           -> crops/index.html  (never used here, kept for parity)
 */
async function resolveFile(urlPath) {
  const target = safeJoin(urlPath);
  if (!target) return { status: 400, file: null };

  let stats = await statOrNull(target);
  if (stats && stats.isFile()) return { status: 200, file: target };
  if (stats && stats.isDirectory()) {
    const index = path.join(target, 'index.html');
    if (await statOrNull(index)) return { status: 200, file: index };
    return { status: 404, file: null };
  }
  if (!path.extname(target)) {
    const withHtml = `${target}.html`;
    const htmlStats = await statOrNull(withHtml);
    if (htmlStats && htmlStats.isFile()) return { status: 200, file: withHtml };
  }
  return { status: 404, file: null };
}

async function sendFile(res, file, status, extraHeaders = {}) {
  const body = await fsp.readFile(file);
  res.writeHead(status, {
    'Content-Type': contentType(file),
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders
  });
  res.end(body);
}

export function createServer({ quiet = false } = {}) {
  return http.createServer(async (req, res) => {
    const started = Date.now();

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('405 Method Not Allowed\n');
      return;
    }

    let status = 500;
    let label = req.url;
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const { status: resolved, file } = await resolveFile(url.pathname);

      if (file) {
        status = resolved;
        await sendFile(res, file, status);
      } else {
        status = resolved === 400 ? 400 : 404;
        const custom = path.join(ROOT, '404.html');
        if (status === 404 && (await statOrNull(custom))) {
          await sendFile(res, custom, 404);
        } else {
          res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(status === 400 ? '400 Bad Request\n' : '404 Not Found\n');
        }
      }
    } catch (err) {
      status = 500;
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error\n');
      if (!quiet) console.error('  !', err.message);
    } finally {
      if (!quiet) {
        const ms = Date.now() - started;
        console.log(`  ${String(status).padEnd(3)} ${req.method} ${label} ${ms}ms`);
      }
    }
  });
}

/* --------------------------------------------------------------------------
   CLI entry point (skipped when the module is imported by tests/tools)
   -------------------------------------------------------------------------- */
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const opts = parseArgs();
  if (opts.help) {
    console.log(`
AgriVision dev server

  npm start                     serve on http://localhost:${DEFAULT_PORT}
  npm start -- --port 8080      custom port
  npm start -- --host 127.0.0.1 bind to a single interface
  npm start -- --quiet          no request logging

Serves ${ROOT}
`);
    process.exit(0);
  }

  const server = createServer({ quiet: opts.quiet });
  server.listen(opts.port, opts.host, () => {
    const shown = opts.host === '0.0.0.0' || opts.host === '::' ? 'localhost' : opts.host;
    console.log('\n  AgriVision is running\n');
    console.log(`  Local:   http://${shown}:${opts.port}/`);
    console.log(`  Serving: ${ROOT}`);
    console.log('\n  Press Ctrl+C to stop.\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n  Port ${opts.port} is already in use. Try: npm start -- --port ${opts.port + 1}\n`);
    } else {
      console.error(`\n  Server error: ${err.message}\n`);
    }
    process.exit(1);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 1500).unref();
    });
  }
}
