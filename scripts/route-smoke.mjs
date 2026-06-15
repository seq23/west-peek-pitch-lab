#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { PHASE_2_ROUTES } from '../src/runtime/phase2Routes.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const port = Number(process.env.SMOKE_PORT || 4173);
const requiredTexts = [
  'West Peek Pitch Lab',
  'Good products need good stories.',
  'Good people should meet good people.',
  'AI Scooter is an AI storytelling coach inspired by Scooter Taylor'
];

function resolveFile(urlPath) {
  const clean = urlPath.split('?')[0];
  if (clean === '/' || clean === '') return path.join(dist, 'index.html');
  return path.join(dist, clean.replace(/^\//, ''), 'index.html');
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url || '/');
  if (!file.startsWith(dist) || !fs.existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(file));
});

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
try {
  const failures = [];
  for (const route of PHASE_2_ROUTES) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`);
    const text = await response.text();
    if (response.status !== 200) failures.push(`${route}: expected 200, got ${response.status}`);
    for (const required of requiredTexts) {
      if (!text.includes(required)) failures.push(`${route}: missing ${required}`);
    }
  }
  if (failures.length) {
    console.error('ROUTE SMOKE FAILED');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log('ROUTE SMOKE PASSED');
    console.log(`Checked routes: ${PHASE_2_ROUTES.length}`);
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
