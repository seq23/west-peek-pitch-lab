#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { generatePitchStoryCard } from '../src/server/ai/aiService.mjs';

const root = process.cwd();
const live = ['true', '1', 'yes', 'on'].includes(String(process.env.PITCH_LAB_LIVE_LLM_PROOF || process.env.PITCH_LAB_LIVE_LLM_E2E || '').toLowerCase());
const failures = [];
const warnings = [];
const checks = [];

function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const parsed = {};
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    parsed[key] = value;
  }
  return parsed;
}

const env = { ...parseEnvFile(path.join(root, '.env')), ...parseEnvFile(path.join(root, '.env.local')), ...process.env };
const safeText = (value) => JSON.stringify(value || {}).replace(/\r/g, '');
function add(name, status, detail = {}) {
  checks.push({ name, status, ...detail });
  if (status === 'fail') failures.push(`${name}: ${detail.reason || 'failed'}`);
  if (status === 'warn') warnings.push(`${name}: ${detail.reason || 'warning'}`);
}
function hasSecretLeak(body) {
  return /OPENAI_API_KEY|GEMINI_API_KEY|NETWORK_OS_SHARED_SECRET|DID_API_KEY|HEYGEN_API_KEY|FISH_API_KEY|authorization|Bearer\s|sk-[A-Za-z0-9]/i.test(safeText(body));
}

const answers = {
  what_building: 'West Peek Pitch Lab helps founders turn scattered company context into a clear Founder Story Packet and 60-second story people can repeat.',
  who_for: 'It is for founder-led companies preparing for investor, customer, operator, or strategic partner conversations.',
  painful_problem: 'The painful problem is that strong founders often know the product but cannot explain the urgent customer, proof, and ask clearly enough for useful relationship routing.',
  why_now: 'AI has made pitch iteration faster, but trusted networks still need a concise human-readable story before they can help.',
  founder_edge: 'The team combines AI product building, capital markets experience, founder coaching, and West Peek relationship network context.',
  proof_traction: 'The current proof includes a deployed pitch-practice app, working story-card flow, runtime media provider contracts, and Network OS handoff wiring.',
  help_needed: 'The founder needs design partners, founder-friendly operators, and investors who can pressure-test the wedge and relationship routing.',
  anything_else: 'This live proof exists to verify that AI Scooter talks back with a real provider-backed response, not a canned fixture.'
};

const invalid = await generatePitchStoryCard({ env, answers: { what_building: 'thin' }, fetchImpl: fetch });
add('invalid LLM request rejects before provider output', invalid.httpStatus === 400 && invalid.body?.aiEnhanced === false ? 'pass' : 'fail', {
  httpStatus: invalid.httpStatus,
  providerStatus: invalid.body?.status,
  reason: invalid.httpStatus === 400 ? undefined : 'thin request should fail validation before any fake story card can appear'
});

const dryEnv = { ...env, GEMINI_API_KEY: '', OPENAI_API_KEY: '', LLM_PROVIDER: 'gemini', LLM_FALLBACK_PROVIDER: 'openai' };
const unavailable = await generatePitchStoryCard({ env: dryEnv, answers, fetchImpl: fetch });
add('missing provider env fails honestly without placeholder AI output', unavailable.httpStatus === 503 && unavailable.body?.aiEnhanced === false && unavailable.body?.storyCard === null ? 'pass' : 'fail', {
  httpStatus: unavailable.httpStatus,
  providerStatus: unavailable.body?.status,
  reason: unavailable.httpStatus === 503 ? undefined : 'missing providers must not produce fake AI output'
});
add('unavailable LLM response does not expose secrets', hasSecretLeak(unavailable.body) ? 'fail' : 'pass', {
  reason: hasSecretLeak(unavailable.body) ? 'secret-shaped content leaked in unavailable response' : undefined
});

if (live) {
  const result = await generatePitchStoryCard({ env, answers, fetchImpl: fetch });
  const body = result.body || {};
  const story = body.storyCard || {};
  const combined = safeText(body).toLowerCase();
  const contextAnchored = /west peek|pitch lab|founder|story|relationship|operator|investor|customer/.test(combined);
  add('live configured LLM provider returns schema-backed AI Scooter story card', result.httpStatus === 200 && body.aiEnhanced === true && story.oneLinePitch && body.critique && Array.isArray(body.storyStrengthSignals) ? 'pass' : 'fail', {
    httpStatus: result.httpStatus,
    provider: body.provider || null,
    providerStatus: body.status || null,
    reason: result.httpStatus === 200 ? undefined : (body.reason || 'live LLM proof requires real configured provider response')
  });
  add('live LLM response is relevant to founder pitch context', contextAnchored ? 'pass' : 'fail', {
    provider: body.provider || null,
    reason: contextAnchored ? undefined : 'provider response did not include founder/pitch/story/relationship context anchors'
  });
  add('live LLM response preserves no-guarantee/no-score boundaries', /guaranteed funding|guaranteed meeting|guaranteed intro|fundability score|\b\d{1,3}\s*\/\s*100\b/i.test(safeText(body)) ? 'fail' : 'pass', {
    reason: /guaranteed funding|guaranteed meeting|guaranteed intro|fundability score|\b\d{1,3}\s*\/\s*100\b/i.test(safeText(body)) ? 'forbidden guarantee or score appeared in LLM response' : undefined
  });
  add('live LLM response does not expose secrets', hasSecretLeak(body) ? 'fail' : 'pass', {
    reason: hasSecretLeak(body) ? 'secret-shaped content leaked in LLM response' : undefined
  });
} else {
  add('live configured LLM provider call intentionally skipped', 'warn', { reason: 'set PITCH_LAB_LIVE_LLM_PROOF=true after restoring provider env to prove real AI Scooter response' });
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: live ? 'live-llm-provider-proof' : 'llm-provider-dry-run-proof',
  summary: failures.length ? 'LLM PROOF FAILED' : warnings.length ? 'LLM PROOF INCOMPLETE — LIVE LLM PROVIDER PROOF STILL REQUIRED' : 'LLM PROOF PASSED',
  checks
};
const outDir = path.join(root, 'tmp');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'llm-provider-proof-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(report.summary);
console.log(`Report: ${outPath}`);
for (const check of checks) console.log(`- ${String(check.status).toUpperCase()}: ${check.name}${check.reason ? ` — ${check.reason}` : ''}`);
if (failures.length) process.exit(1);
