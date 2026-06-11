#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { getVoiceStatus, renderScooterVoice } from '../src/server/voice/voiceService.mjs';
import { getAvatarStatus, renderScooterAvatar } from '../src/server/avatar/avatarService.mjs';
import { SCOOTER_MEDIA_IDENTITY } from '../src/server/media/scooterMediaIdentity.mjs';

const root = process.cwd();
const env = { ...process.env };
const live = ['true','1','yes','on'].includes(String(env.MEDIA_PROOF_RUN_LIVE || '').toLowerCase());
const failures = [];
const warnings = [];
const report = {
  generatedAt: new Date().toISOString(),
  mode: live ? 'live-provider-proof' : 'static-dry-run-proof',
  summary: '',
  checks: []
};

function add(name, status, detail = {}) {
  report.checks.push({ name, status, ...detail });
  if (status === 'fail') failures.push(`${name}: ${detail.reason || 'failed'}`);
  if (status === 'warn') warnings.push(`${name}: ${detail.reason || 'warning'}`);
}
function exists(file) { return fs.existsSync(path.join(root, file)); }
function loadJson(file) { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }

const photoPath = SCOOTER_MEDIA_IDENTITY.approvedPhotoAsset.replace(/^\//, 'public/');
const drivingVideoPath = SCOOTER_MEDIA_IDENTITY.approvedDrivingVideoAsset.replace(/^\//, 'public/');
add('approved Scooter source photo exists', exists(photoPath) ? 'pass' : 'fail', { file: photoPath, reason: exists(photoPath) ? undefined : 'missing approved source photo' });
add('reserved Scooter driving/source video exists', exists(drivingVideoPath) ? 'pass' : 'warn', { file: drivingVideoPath, reason: exists(drivingVideoPath) ? undefined : 'missing reserved source video; still image proof may still be possible' });

const manifest = loadJson('public/assets/avatar/clip-manifest.json');
const required = ['welcome', 'final_summary', 'share_cta'];
for (const moment of required) {
  const clip = manifest.clips.find((item) => item.moment === moment);
  add(`manifest has ${moment} clip slot`, clip ? 'pass' : 'fail', { clipStatus: clip?.status || null, src: clip?.src || '' });
  if (clip && !clip.src) {
    add(`${moment} clip not yet rendered`, 'warn', { reason: 'required clip slot exists but no playable src is committed yet' });
  } else if (clip?.src) {
    const localSrc = String(clip.src).replace(/^\//, 'public/');
    const remote = /^https?:\/\//i.test(String(clip.src));
    const localExists = !remote && exists(localSrc);
    add(`${moment} cached clip has playable asset reference`, remote || localExists ? 'pass' : 'fail', { src: clip.src, remote, localFile: remote ? null : localSrc, reason: remote || localExists ? undefined : 'clip src is configured but local file is missing' });
  }
}

const voiceStatus = getVoiceStatus(env, SCOOTER_MEDIA_IDENTITY);
const avatarStatus = getAvatarStatus(env, SCOOTER_MEDIA_IDENTITY);
add('ElevenLabs voice status is honest', voiceStatus.configured ? 'pass' : 'warn', {
  configured: voiceStatus.configured,
  enabled: voiceStatus.enabled,
  provider: voiceStatus.provider,
  reason: voiceStatus.configured ? undefined : 'voice API not configured in this environment'
});
add('talking-avatar status is proof-gated', avatarStatus.configured ? 'pass' : 'warn', {
  configured: avatarStatus.configured,
  provider: avatarStatus.provider,
  providerProofRequired: avatarStatus.providerProofRequired,
  reason: avatarStatus.configured ? undefined : 'talking-photo/video endpoint or provider asset IDs are not live-proven in this environment'
});

if (live) {
  const voice = await renderScooterVoice({
    env,
    body: { moment: 'welcome', text: 'Welcome to West Peek Pitch Lab. Good products need good stories. Tell me what you are building, and let us sharpen the story.' }
  });
  add('live ElevenLabs voice render', voice.ok ? 'pass' : 'fail', { httpStatus: voice.httpStatus, status: voice.body?.status, reason: voice.body?.reason });

  const avatar = await renderScooterAvatar({
    env,
    body: { moment: 'final_summary', text: 'Here is what I am hearing. The story has shape, but the proof needs to get sharper before you share it. Add one concrete traction point so the next person can believe the momentum quickly.' }
  });
  add('live talking-avatar render request', avatar.ok ? 'pass' : 'fail', { httpStatus: avatar.httpStatus, status: avatar.body?.status, reason: avatar.body?.reason, providerError: avatar.body?.providerError });
} else {
  add('live provider call intentionally skipped', 'warn', { reason: 'set MEDIA_PROOF_RUN_LIVE=true with real provider env to run paid live proof' });
}

report.summary = failures.length
  ? 'MEDIA PROOF FAILED'
  : (warnings.length ? 'MEDIA PROOF INCOMPLETE — LIVE PROVIDER PROOF STILL REQUIRED' : 'MEDIA PROOF PASSED');

const outDir = path.join(root, 'tmp');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'scooter-media-provider-proof-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(report.summary);
console.log(`Report: ${outPath}`);
for (const check of report.checks) console.log(`- ${check.status.toUpperCase()}: ${check.name}${check.reason ? ` — ${check.reason}` : ''}`);
if (failures.length) process.exit(1);
