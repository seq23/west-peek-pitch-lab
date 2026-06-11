#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';

const headed = process.argv.includes('--headed');
const port = process.env.PLAYWRIGHT_PORT || '4191';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;

const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: false, env: process.env });
if ((build.status ?? 1) !== 0) process.exit(build.status ?? 1);

const serverEnv = { ...process.env, PORT: port, PLAYWRIGHT_PORT: port, PLAYWRIGHT_BASE_URL: baseURL };
const server = spawn('node', ['scripts/preview-media-proof.mjs'], { stdio: ['ignore', 'pipe', 'pipe'], env: serverEnv });
let ready = false;
server.stdout.on('data', (chunk) => { const text = chunk.toString(); process.stdout.write(text); if (text.includes('Media proof preview listening')) ready = true; });
server.stderr.on('data', (chunk) => process.stderr.write(chunk));
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function waitForReady() { for (let i = 0; i < 80; i += 1) { if (ready) return; await sleep(125); } throw new Error('camera proof preview server did not start'); }
try {
  await waitForReady();
  const args = ['playwright', 'test', 'tests/e2e/founder-camera-rehearsal-proof.spec.mjs', '--project=desktop-chromium'];
  if (headed) args.push('--headed');
  const result = spawnSync('npx', args, {
    stdio: 'inherit',
    shell: false,
    env: { ...serverEnv, PLAYWRIGHT_SKIP_WEBSERVER: 'true', PLAYWRIGHT_BASE_URL: baseURL }
  });
  server.kill('SIGTERM');
  process.exit(result.status ?? 1);
} catch (error) {
  server.kill('SIGTERM');
  console.error(error instanceof Error ? error.message : 'camera proof runner failed');
  process.exit(1);
}
