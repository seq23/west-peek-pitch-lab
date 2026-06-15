#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || process.env.PLAYWRIGHT_PORT || 4173);

if (!fs.existsSync(dist)) {
  console.error('Missing dist/. Run npm run build before preview.');
  process.exit(1);
}

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.mp4', 'video/mp4']
]);

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith('/api/avatar/status')) {
    return send(res, 503, JSON.stringify({ ok: false, status: 'avatar_unavailable', reason: 'Local static preview does not run provider APIs.' }), 'application/json; charset=utf-8');
  }
  if (pathname.startsWith('/api/')) {
    return send(res, 503, JSON.stringify({ ok: false, status: 'api_unavailable_in_static_preview' }), 'application/json; charset=utf-8');
  }

  if (pathname.endsWith('/')) pathname += 'index.html';
  if (!path.extname(pathname)) pathname = path.join(pathname, 'index.html');
  const file = path.normalize(path.join(dist, pathname));
  if (!file.startsWith(dist)) return send(res, 403, 'Forbidden');
  if (!fs.existsSync(file)) return send(res, 404, 'Not found');
  const ext = path.extname(file);
  res.writeHead(200, { 'content-type': types.get(ext) || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static preview listening at http://127.0.0.1:${port}`);
});
