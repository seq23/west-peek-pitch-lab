#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const validate = process.argv.includes('--validate');
const failures = [];
const warnings = [];
const checks = [];

function read(file) {
  const full = path.join(root, file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}
function exists(file) {
  return fs.existsSync(path.join(root, file));
}
function add(id, status, detail) {
  checks.push({ id, status, detail });
  if (status === 'fail') failures.push(`${id}: ${detail}`);
  if (status === 'warn') warnings.push(`${id}: ${detail}`);
}
function requireFile(file) {
  add(`file:${file}`, exists(file) ? 'pass' : 'fail', exists(file) ? 'exists' : 'missing');
}
function requireIncludes(file, terms, label = file) {
  const text = read(file);
  for (const term of terms) {
    const ok = term instanceof RegExp ? term.test(text) : text.includes(term);
    add(`${label}:${String(term)}`, ok ? 'pass' : 'fail', ok ? 'present' : `missing in ${file}`);
  }
}
function requireNotIncludes(file, terms, label = file) {
  const text = read(file);
  for (const term of terms) {
    const found = term instanceof RegExp ? term.test(text) : text.includes(term);
    add(`${label}:forbid:${String(term)}`, found ? 'fail' : 'pass', found ? `forbidden term appears in ${file}` : 'absent');
  }
}

for (const file of [
  'playwright.config.mjs',
  'scripts/run-master-gauntlet.mjs',
  'scripts/run-live-gauntlet-report.mjs',
  'scripts/proof-llm-provider.mjs',
  'tests/e2e/master-gauntlet.spec.mjs',
  'tests/e2e/llm-live-response.spec.mjs',
  'tests/e2e/post-deploy-functions.spec.mjs',
  'tests/e2e/post-deploy-journey.spec.mjs',
  'functions/api/pitch/story-card.js',
  'functions/api/pitch/share.js',
  'functions/api/avatar/render.js',
  'functions/api/voice/render.js',
  'src/runtime/aiStoryCardClient.mjs',
  'src/runtime/shareFlow.mjs',
  'src/runtime/practiceFlow.mjs',
  'public/assets/avatar/clip-manifest.json',
  'REPO_VALIDATION_MATRIX.md',
  '_repo_validation_matrix.json'
]) requireFile(file);

requireIncludes('tests/e2e/master-gauntlet.spec.mjs', [
  'practice flow blocks thin answers',
  'AI story generation fails honestly',
  'AI story generation success remains copy-only',
  'share transaction sends complete consented handoff payload',
  'Network OS failure keeps the founder in honest non-submitted state',
  'share transaction includes consented rehearsal transcript/status',
  'avatar render POST is a real transaction endpoint',
  'UI does not expose secret names',
  'Founder Story Packet payload uses relationship routing'
], 'master-gauntlet-coverage');

requireIncludes('tests/e2e/llm-live-response.spec.mjs', [
  'PITCH_LAB_LIVE_LLM_E2E',
  'deployed story-card API returns a real schema-backed AI Scooter response',
  'deployed browser journey triggers live LLM and renders AI Scooter response in the UI',
  'await page.getByRole(\'button\', { name: /Generate AI Pitch Story Card/i }).click();',
  'expect(response.status()).toBe(200)',
  'expect(body.aiEnhanced).toBe(true)',
  'localStorage.getItem'
], 'live-llm-e2e');

requireNotIncludes('tests/e2e/llm-live-response.spec.mjs', [
  'page.route(\'**/api/pitch/story-card\'',
  'route.fulfill',
  'fakeAiResponse',
  'test_local'
], 'live-llm-e2e');

requireIncludes('scripts/proof-llm-provider.mjs', [
  'PITCH_LAB_LIVE_LLM_PROOF',
  'live configured LLM provider returns schema-backed AI Scooter story card',
  'missing provider env fails honestly without placeholder AI output',
  'invalid LLM request rejects before provider output',
  'live LLM response does not expose secrets'
], 'llm-provider-proof');

requireIncludes('scripts/run-live-gauntlet-report.mjs', [
  'llm-live-provider',
  'Live LLM provider proof',
  'llm-live-browser',
  'Live deployed browser LLM response E2E',
  'proof:llm:live',
  'proof:llm:live:browser'
], 'live-gauntlet-llm-lanes');

requireIncludes('package.json', [
  'validate:e2e-data-trace',
  'proof:llm',
  'proof:llm:live',
  'proof:llm:live:browser'
], 'package-scripts');

requireIncludes('REPO_VALIDATION_MATRIX.md', [
  'E2E data trace',
  'Live LLM browser response',
  'AI Scooter talks back',
  'UNPROVEN'
], 'matrix-doc');

requireIncludes('_repo_validation_matrix.json', [
  'validate:e2e-data-trace',
  'proof:llm:live:browser'
], 'matrix-json');

const dataFlowMap = [
  ['founder profile', 'src/runtime/practiceFlow.mjs', 'west-peek-pitch-lab.founder-profile.v1', 'tests/e2e/master-gauntlet.spec.mjs'],
  ['pitch answers', 'src/runtime/practiceFlow.mjs', 'west-peek-pitch-lab.phase3.answers.v1', 'tests/e2e/master-gauntlet.spec.mjs'],
  ['AI story card', 'src/runtime/aiStoryCardClient.mjs', '/api/pitch/story-card', 'tests/e2e/llm-live-response.spec.mjs'],
  ['share handoff', 'src/runtime/shareFlow.mjs', '/api/pitch/share', 'tests/e2e/master-gauntlet.spec.mjs'],
  ['runtime media cache', 'public/assets/avatar/clip-manifest.json', 'runtimeMediaCacheContract', 'scripts/proof-scooter-media-provider.mjs']
];

for (const [name, sourceFile, sourceAnchor, proofFile] of dataFlowMap) {
  const sourceOk = read(sourceFile).includes(sourceAnchor);
  const proofOk = read(proofFile).includes(sourceAnchor) || read(proofFile).toLowerCase().includes(name.split(' ')[0]);
  add(`data-trace:${name}:source`, sourceOk ? 'pass' : 'fail', sourceOk ? `${sourceAnchor} found in ${sourceFile}` : `${sourceAnchor} missing in ${sourceFile}`);
  add(`data-trace:${name}:proof`, proofOk ? 'pass' : 'fail', proofOk ? `proof linked in ${proofFile}` : `proof missing or disconnected in ${proofFile}`);
}

const reportRoot = path.join(root, 'tmp/e2e-data-trace');
fs.mkdirSync(reportRoot, { recursive: true });
const summary = {
  generatedAt: new Date().toISOString(),
  summary: failures.length ? 'E2E DATA TRACE FAILED' : warnings.length ? 'E2E DATA TRACE COMPLETED WITH WARNINGS' : 'E2E DATA TRACE PASSED',
  counts: {
    pass: checks.filter((c) => c.status === 'pass').length,
    warn: warnings.length,
    fail: failures.length
  },
  checks,
  failures,
  warnings
};
fs.writeFileSync(path.join(reportRoot, 'summary.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(reportRoot, 'summary.md'), [
  '# E2E Data Trace',
  '',
  `- Summary: ${summary.summary}`,
  `- Pass: ${summary.counts.pass}`,
  `- Warn: ${summary.counts.warn}`,
  `- Fail: ${summary.counts.fail}`,
  '',
  '## Failures',
  ...(failures.length ? failures.map((item) => `- ${item}`) : ['- None.']),
  '',
  '## Warnings',
  ...(warnings.length ? warnings.map((item) => `- ${item}`) : ['- None.'])
].join('\n'));

console.log(summary.summary);
console.log(`Report: ${path.relative(root, reportRoot)}`);
console.log(JSON.stringify(summary.counts, null, 2));
if (validate && failures.length) process.exit(1);
