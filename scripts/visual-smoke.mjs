#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const outDir = path.join(root, 'artifacts', 'visual-smoke');
const port = Number(process.env.VISUAL_SMOKE_PORT || 4174);
const chromium = process.env.CHROMIUM_BIN || '/usr/bin/chromium';

function resolveFile(urlPath) {
  const clean = urlPath.split('?')[0];
  if (clean === '/' || clean === '') return path.join(dist, 'index.html');
  if (clean === '/assets/styles.css') return path.join(dist, 'assets/styles.css');
  return path.join(dist, clean.replace(/^\//, ''), 'index.html');
}

if (!fs.existsSync(chromium)) {
  console.log('VISUAL SMOKE SKIPPED: chromium binary not found');
  process.exit(0);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url || '/');
  if (!file.startsWith(dist) || !fs.existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  const type = file.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8';
  res.writeHead(200, { 'content-type': type });
  res.end(fs.readFileSync(file));
});

function runChromium(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(chromium, args, { stdio: 'pipe' });
    let stderr = '';
    child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`chromium exited ${code}: ${stderr}`));
    });
  });
}

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
try {
  const shots = [
    ['home-desktop', '/', '1440,1200'],
    ['home-mobile', '/', '390,900'],
    ['practice-desktop', '/practice', '1440,1200'],
    ['privacy-mobile', '/privacy', '390,900']
  ];
  for (const [name, route, size] of shots) {
    const target = path.join(outDir, `${name}.png`);
    await runChromium([
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      `--window-size=${size}`,
      `--screenshot=${target}`,
      `http://127.0.0.1:${port}${route}`
    ]);
    const stats = fs.statSync(target);
    if (stats.size < 5000) throw new Error(`Screenshot too small: ${target}`);
  }
  console.log('VISUAL SMOKE PASSED');
  console.log(`Screenshots: ${shots.length}`);
} finally {
  await new Promise((resolve) => server.close(resolve));
}
