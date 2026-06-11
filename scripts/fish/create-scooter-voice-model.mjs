#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const raw of fs.readFileSync(file, 'utf8').split(/?
/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    env[line.slice(0, idx).trim()] = value;
  }
  return env;
}
const env = { ...parseEnvFile(path.join(root, '.env')), ...parseEnvFile(path.join(root, '.env.local')), ...process.env };
const apiKey = env.FISH_API_KEY || env.FISH_AUDIO_API_KEY;
if (!apiKey || /^REPLACE_WITH_|DISABLED|__SET|placeholder/i.test(apiKey)) {
  console.error('FISH_API_KEY is required in env/.env.local/vault restore. Raw keys are never printed.');
  process.exit(1);
}
const samplePath = path.join(root, env.FISH_VOICE_SAMPLE_PATH || 'public/assets/avatar/scooter-voice-only.mp3');
if (!fs.existsSync(samplePath)) {
  console.error(`Missing voice sample: ${path.relative(root, samplePath)}`);
  process.exit(1);
}
const baseUrl = String(env.FISH_API_BASE_URL || 'https://api.fish.audio').replace(/\/$/, '');
const form = new FormData();
const bytes = fs.readFileSync(samplePath);
const blob = new Blob([bytes], { type: samplePath.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg' });
form.append('type', 'tts');
form.append('title', env.FISH_VOICE_TITLE || 'West Peek AI Scooter');
form.append('train_mode', 'fast');
form.append('visibility', env.FISH_VOICE_VISIBILITY || 'private');
form.append('description', env.FISH_VOICE_DESCRIPTION || 'Private West Peek Pitch Lab Scooter voice clone from approved uploaded sample.');
form.append('enhance_audio_quality', String(env.FISH_ENHANCE_AUDIO_QUALITY || 'true'));
form.append('generate_sample', 'false');
form.append('voices', blob, path.basename(samplePath));
if (env.FISH_VOICE_SAMPLE_TRANSCRIPT) form.append('texts', env.FISH_VOICE_SAMPLE_TRANSCRIPT);
const response = await fetch(`${baseUrl}/model`, { method: 'POST', headers: { authorization: `Bearer ${apiKey}` }, body: form });
let body;
try { body = await response.json(); } catch { body = { status: response.status, message: await response.text() }; }
if (!response.ok) {
  console.error(JSON.stringify({ status: 'fish_voice_clone_failed', httpStatus: response.status, message: body?.message || body?.error || 'Fish model creation failed' }, null, 2));
  process.exit(1);
}
const referenceId = body._id || body.id;
console.log(JSON.stringify({ status: 'fish_voice_clone_created', httpStatus: response.status, referenceId, state: body.state, visibility: body.visibility, title: body.title }, null, 2));
console.log('Store referenceId as FISH_VOICE_REFERENCE_ID in .env.local / encrypted vault / Cloudflare secret config.');
