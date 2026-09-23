'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = 8765;
const DEFAULT_HOST = '0.0.0.0';
const DEMO_ROOT = path.resolve(__dirname, '..', 'demo');

const MIME_BY_EXT = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function logEvent(fields) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
}

function resolveStaticPath(rootDir, requestPath) {
  const root = path.resolve(rootDir);
  let pathname = '/';
  try {
    pathname = decodeURIComponent(String(requestPath || '/').split('?')[0]);
  } catch {
    return null;
  }
  if (pathname.includes('\0')) return null;
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const resolved = path.resolve(root, relative);
  const rootPrefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (resolved !== root && !resolved.startsWith(rootPrefix)) return null;
  return resolved;
}

function isInsideRoot(rootDir, filePath) {
  const root = fs.realpathSync(rootDir);
  const real = fs.realpathSync(filePath);
  const rootPrefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  return real === root || real.startsWith(rootPrefix);
}

function sendText(res, status, message) {
  const body = `${message}\n`;
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_BY_EXT[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) sendText(res, 500, 'read failed');
    else res.destroy();
  });
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  stream.pipe(res);
}

function locateFile(rootDir, requestPath) {
  const resolved = resolveStaticPath(rootDir, requestPath);
  if (!resolved) return { status: 400 };
  let stat;
  try {
    stat = fs.statSync(resolved);
  } catch {
    return { status: 404 };
  }
  const filePath = stat.isDirectory() ? path.join(resolved, 'index.html') : resolved;
  if (stat.isDirectory() && !fs.existsSync(filePath)) return { status: 404 };
  try {
    if (!isInsideRoot(rootDir, filePath)) return { status: 403 };
  } catch {
    return { status: 404 };
  }
  return { status: 200, filePath };
}

function createStaticServer(options = {}) {
  const rootDir = path.resolve(options.rootDir || DEMO_ROOT);
  return http.createServer((req, res) => {
    const started = Date.now();
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendText(res, 405, 'method not allowed');
      logEvent({ event: 'http', method: req.method, path: req.url, status: 405, durationMs: Date.now() - started });
      return;
    }
    const located = locateFile(rootDir, req.url);
    if (located.status !== 200) {
      const messages = { 400: 'bad request', 403: 'forbidden', 404: 'not found' };
      sendText(res, located.status, messages[located.status] || 'error');
      logEvent({ event: 'http', method: req.method, path: req.url, status: located.status, durationMs: Date.now() - started });
      return;
    }
    if (req.method === 'HEAD') {
      const ext = path.extname(located.filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_BY_EXT[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end();
    } else {
      sendFile(res, located.filePath);
    }
    logEvent({ event: 'http', method: req.method, path: req.url, status: 200, durationMs: Date.now() - started });
  });
}

function listen(server, host, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.removeListener('error', reject);
      resolve(server.address());
    });
  });
}

async function main() {
  const host = process.env.HOST || DEFAULT_HOST;
  const port = Number(process.env.PORT || DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    logEvent({ event: 'startup_failed', reason: 'invalid_port', port: process.env.PORT });
    process.exit(1);
  }
  const server = createStaticServer({ rootDir: DEMO_ROOT });
  const address = await listen(server, host, port);
  logEvent({
    event: 'listening',
    host,
    port: address.port,
    root: DEMO_ROOT,
    pid: process.pid,
  });
  const shutdown = (signal) => {
    logEvent({ event: 'shutdown', signal });
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = {
  DEFAULT_PORT,
  DEFAULT_HOST,
  DEMO_ROOT,
  resolveStaticPath,
  createStaticServer,
};

if (require.main === module) {
  main().catch((error) => {
    logEvent({ event: 'startup_failed', message: error.message });
    process.exit(1);
  });
}
