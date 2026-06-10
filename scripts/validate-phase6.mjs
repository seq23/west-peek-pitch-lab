#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
function exists(file) { if (!fs.existsSync(path.join(root, file))) failures.push(`Missing ${file}`); }
function read(file) { return fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : ''; }

const required = [
  'src/server/voice/voiceService.mjs',
  'src/server/avatar/avatarService.mjs',
  'src/server/media/scooterMediaIdentity.mjs',
  'functions/api/voice/render.js',
  'functions/api/voice/status.js',
  'functions/api/avatar/render.js',
  'functions/api/avatar/status.js',
  'public/assets/avatar/clip-manifest.json',
  'tests/domain/phase6-contracts.mjs'
];
for (const file of required) exists(file);

const registry = JSON.parse(read('config/env.registry.json') || '{}');
if (!['phase6','phase9a','phase9b','phase9b1','phase9d'].includes(registry?.rules?.currentImplementedPhase)) failures.push('Env registry currentImplementedPhase must be phase6 or later.');
const keys = new Set((registry.variables || []).map((v) => v.key));
for (const key of [
  'VOICE_PROVIDER','ELEVENLABS_API_KEY','ELEVENLABS_MODEL','VOICE_DYNAMIC_GENERATION_ENABLED','VOICE_CACHE_ENABLED','VOICE_MAX_CHARS',
  'AVATAR_PROVIDER','AVATAR_MODE','AVATAR_DYNAMIC_GENERATION_ENABLED','AVATAR_RENDER_FINAL_SUMMARY_ONLY','AVATAR_MAX_SCRIPT_CHARS','AVATAR_MAX_VIDEO_SECONDS','AVATAR_CACHE_ENABLED',
  'HEYGEN_API_KEY','HEYGEN_API_BASE_URL','HEYGEN_VOICE_MODE','MAKEUGC_API_KEY','MAKEUGC_API_BASE_URL',
  'COST_GUARD_ENABLED','AVATAR_DAILY_MAX_RENDERS','AVATAR_MONTHLY_MAX_RENDERS','AVATAR_REQUIRE_OPERATOR_APPROVAL'
]) {
  if (!keys.has(key)) failures.push(`Env registry missing Phase 6 key: ${key}`);
}

const voice = read('src/server/voice/voiceService.mjs');
const avatar = read('src/server/avatar/avatarService.mjs');
if (!voice.includes('voice_unavailable') || !voice.includes('No fake voice output was generated')) failures.push('Voice service must expose honest unavailable/no-placeholder behavior.');
if (!avatar.includes('avatar_unavailable') || !avatar.includes('degraded mode')) failures.push('Avatar service must expose honest unavailable/degraded fallback behavior.');
if (!avatar.includes('AVATAR_MAX_VIDEO_SECONDS') || !avatar.includes('AVATAR_MAX_SCRIPT_CHARS')) failures.push('Avatar service must enforce request-level length/time guardrails.');
if (!avatar.includes('AVATAR_DYNAMIC_GENERATION_ENABLED')) failures.push('Avatar service must respect dynamic generation flag.');
if (keys.has('ELEVENLABS_VOICE_ID') || keys.has('HEYGEN_AVATAR_ID') || keys.has('MAKEUGC_AVATAR_ID') || keys.has('MAKEUGC_VOICE_ID')) failures.push('Provider identity IDs must not be env vars; they live in src/server/media/scooterMediaIdentity.mjs.');
if (!voice.includes('ELEVENLABS_API_KEY') || !avatar.includes('ELEVENLABS_API_KEY') || !avatar.includes('HEYGEN_API_KEY') || !avatar.includes('MAKEUGC_API_KEY')) failures.push('Provider services must reference managed provider API keys server-side.');
if (!voice.includes('scooterMediaIdentity') || !avatar.includes('scooterMediaIdentity')) failures.push('Voice/avatar services must load non-secret Scooter media identity from repo asset module.');

const manifest = JSON.parse(read('public/assets/avatar/clip-manifest.json') || '{}');
if (!Array.isArray(manifest.clips) || manifest.clips.length < 4) failures.push('Avatar clip manifest must include reusable limited-video moments.');
for (const clip of manifest.clips || []) {
  if (!['not_rendered','source_ready_not_rendered'].includes(clip.status)) failures.push(`Phase 6/9D clip ${clip.id || '(unknown)'} must not claim rendered media without asset proof.`);
}

const build = read('scripts/build-static-app.mjs');
const appShell = read('src/ui/appShell.mjs');
if (!build.includes("copyPublicAssetDir('assets/avatar')") && !build.includes('public/assets/avatar')) failures.push('Build must copy avatar clip manifest/static assets if present.');
if (fs.existsSync(path.join(root, 'src/runtime/mediaMomentsClient.mjs'))) failures.push('Public media request client must not exist in Phase 6; media is backend/provider wiring, not founder-facing request machinery.');
if (appShell.includes('data-render-avatar') || appShell.includes('data-render-voice') || appShell.includes('Request limited avatar')) failures.push('Public UI must not expose media render/request buttons.');
if (!avatar.includes('elevenlabs_video')) failures.push('Avatar service must support ElevenLabs-first talking-photo provider posture.');
if (!read('src/server/media/scooterMediaIdentity.mjs').includes('talkingScooterIsCoreExperience')) failures.push('Media identity must mark talking Scooter as core experience.');

if (failures.length) {
  console.error('PHASE 6 VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('PHASE 6 VALIDATION PASSED');
