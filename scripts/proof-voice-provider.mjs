#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { getVoiceStatus, renderScooterVoice } from '../src/server/voice/voiceService.mjs';
import { SCOOTER_MEDIA_IDENTITY } from '../src/server/media/scooterMediaIdentity.mjs';

const root = process.cwd();
const live = ['true','1','yes','on'].includes(String(process.env.MEDIA_PROOF_RUN_LIVE || process.env.PITCH_LAB_LIVE_MEDIA_PROOF || '').toLowerCase());
const report = { generatedAt: new Date().toISOString(), mode: live ? 'live-voice-provider-proof' : 'voice-provider-dry-run-proof', checks: [] };
const failures = [];
const warnings = [];
function add(name, status, detail = {}) { report.checks.push({ name, status, ...detail }); if (status === 'fail') failures.push(`${name}: ${detail.reason || 'failed'}`); if (status === 'warn') warnings.push(`${name}: ${detail.reason || 'warning'}`); }
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
const env = { ...parseEnvFile(path.join(root, '.env')), ...parseEnvFile(path.join(root, '.env.local')), ...process.env };
const status = getVoiceStatus(env, SCOOTER_MEDIA_IDENTITY);
{ const ok = SCOOTER_MEDIA_IDENTITY.elevenLabsVoiceId && !/^REPLACE_WITH_|DISABLED|__SET|placeholder/i.test(SCOOTER_MEDIA_IDENTITY.elevenLabsVoiceId); add('voice identity has committed non-placeholder voice ID', ok ? 'pass' : 'fail', { voiceIdSource: 'src/server/media/scooterMediaIdentity.mjs', reason: ok ? undefined : 'missing committed voice ID' }); }
add('voice provider status is honest', status.configured ? 'pass' : 'warn', { configured: status.configured, enabled: status.enabled, provider: status.provider, maxChars: status.maxChars, reason: status.configured ? undefined : 'ElevenLabs voice is not configured in this environment' });
const invalid = await renderScooterVoice({ env, body: { moment: 'bad_moment', text: 'Hello.' }, fetchImpl: fetch });
{ const ok = invalid.httpStatus === 400 && invalid.body?.voiceReady === false; add('invalid voice request rejects safely', ok ? 'pass' : 'fail', { httpStatus: invalid.httpStatus, providerStatus: invalid.body?.status, reason: ok ? undefined : 'invalid voice request should not render' }); }
if (live) {
  const proofText = 'Welcome to West Peek Pitch Lab. Good products need good stories. Tell me what you are building, and let us sharpen the story.';
  const rendered = await renderScooterVoice({ env, body: { moment: 'welcome', text: proofText }, fetchImpl: fetch });
  const b64 = String(rendered.body?.audioBase64 || '');
  add('live ElevenLabs voice render returns playable-sized audio payload', rendered.ok && rendered.httpStatus === 200 && rendered.body?.voiceReady === true && b64.length > 1000 ? 'pass' : 'fail', { httpStatus: rendered.httpStatus, providerStatus: rendered.body?.status, contentType: rendered.body?.audioContentType, audioBase64Bytes: b64.length, reason: rendered.body?.reason || 'live proof requires real voice render' });
  add('live voice response does not expose secrets', JSON.stringify(rendered.body || {}).match(/ELEVENLABS_API_KEY|xi-api-key|sk-|Bearer\s/i) ? 'fail' : 'pass', { reason: JSON.stringify(rendered.body || {}).match(/ELEVENLABS_API_KEY|xi-api-key|sk-|Bearer\s/i) ? 'provider response leaked secret-shaped content' : 'provider response contains no secret-shaped content' });
} else {
  const dry = await renderScooterVoice({ env: { ...env, ELEVENLABS_API_KEY: '' }, body: { moment: 'welcome', text: 'Welcome to West Peek Pitch Lab.' }, fetchImpl: fetch });
  { const ok = dry.httpStatus === 503 && dry.body?.voiceReady === false; add('dry-run voice proof fails honestly without provider env', ok ? 'pass' : 'fail', { httpStatus: dry.httpStatus, providerStatus: dry.body?.status, reason: ok ? dry.body?.reason : 'dry-run should fail honestly without provider env' }); }
  add('live ElevenLabs call intentionally skipped', 'warn', { reason: 'set MEDIA_PROOF_RUN_LIVE=true after restoring env vault to test real voice generation' });
}
report.summary = failures.length ? 'VOICE PROOF FAILED' : (warnings.length ? 'VOICE PROOF INCOMPLETE — LIVE PROVIDER PROOF MAY STILL BE REQUIRED' : 'VOICE PROOF PASSED');
const outDir = path.join(root, 'tmp');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'scooter-voice-provider-proof-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(report.summary);
console.log(`Report: ${outPath}`);
for (const check of report.checks) console.log(`- ${check.status.toUpperCase()}: ${check.name}${check.reason ? ` — ${check.reason}` : ''}`);
if (failures.length) process.exit(1);
