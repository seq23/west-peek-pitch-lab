#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { getVoiceStatus, renderScooterVoice } from '../src/server/voice/voiceService.mjs';
import { getAvatarStatus, renderScooterAvatar } from '../src/server/avatar/avatarService.mjs';
import { generatePitchStoryCard } from '../src/server/ai/aiService.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || process.env.PLAYWRIGHT_PORT || 4187);

function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    env[key] = value;
  }
  return env;
}

const localEnv = { ...parseEnvFile(path.join(root, '.env')), ...parseEnvFile(path.join(root, '.env.local')), ...process.env };

if (!fs.existsSync(dist)) {
  console.error('Missing dist/. Run npm run build before starting media proof preview.');
  process.exit(1);
}

const types = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'], ['.mjs', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'], ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.mp4', 'video/mp4'], ['.mp3', 'audio/mpeg'], ['.webm', 'video/webm']
]);

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}
function json(res, body, status = 200) { send(res, status, JSON.stringify(body), 'application/json; charset=utf-8'); }
function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : null); } catch { resolve(null); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(url.pathname);

  try {
    if (pathname === '/api/voice/status') return json(res, getVoiceStatus(localEnv));
    if (pathname === '/api/avatar/status') return json(res, getAvatarStatus(localEnv));
    if (pathname === '/api/voice/render') {
      if (req.method !== 'POST') return json(res, { status: 'method_not_allowed', voiceReady: false }, 405);
      const result = await renderScooterVoice({ env: localEnv, body: await readBody(req), fetchImpl: fetch });
      return json(res, result.body, result.httpStatus);
    }
    if (pathname === '/api/avatar/render') {
      if (req.method !== 'POST') return json(res, { status: 'method_not_allowed', avatarReady: false }, 405);
      const result = await renderScooterAvatar({ env: localEnv, body: await readBody(req), fetchImpl: fetch });
      return json(res, result.body, result.httpStatus);
    }
    if (pathname === '/api/pitch/story-card') {
      if (req.method !== 'POST') return json(res, { status: 'method_not_allowed', aiEnhanced: false }, 405);
      const payload = await readBody(req);
      const result = await generatePitchStoryCard({ env: localEnv, answers: payload?.answers, fetchImpl: fetch });
      return json(res, result.body, result.httpStatus);
    }

    let filePath = pathname;
    if (filePath.endsWith('/')) filePath += 'index.html';
    if (!path.extname(filePath)) filePath = path.join(filePath, 'index.html');
    const file = path.normalize(path.join(dist, filePath));
    if (!file.startsWith(dist)) return send(res, 403, 'Forbidden');
    if (!fs.existsSync(file)) return send(res, 404, 'Not found');
    const ext = path.extname(file);
    res.writeHead(200, { 'content-type': types.get(ext) || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  } catch (error) {
    json(res, { status: 'media_proof_server_error', message: error instanceof Error ? error.message : 'unknown_error' }, 500);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Media proof preview listening at http://127.0.0.1:${port}`);
  console.log(`Env source: .env.local ${fs.existsSync(path.join(root, '.env.local')) ? 'present' : 'missing'}; live=${localEnv.PITCH_LAB_LIVE_MEDIA_PROOF || localEnv.MEDIA_PROOF_RUN_LIVE || 'false'}`);
});
