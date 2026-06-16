import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { isExplicitRemoteHttpsUrl, normalizeDeployEnv, parseEnvFile, resolveDeployUrl, summarizeLiveEnv } from '../../scripts/lib/release-env.mjs';

assert.equal(isExplicitRemoteHttpsUrl('https://pitch.joinwestpeek.com'), true);
assert.equal(isExplicitRemoteHttpsUrl('http://pitch.joinwestpeek.com'), false);
assert.equal(isExplicitRemoteHttpsUrl('https://localhost:4173'), false);
assert.equal(isExplicitRemoteHttpsUrl('https://127.0.0.1:4173'), false);
assert.equal(resolveDeployUrl({ POSTDEPLOY_BASE_URL: 'https://pitch.joinwestpeek.com/' }), 'https://pitch.joinwestpeek.com');
assert.equal(resolveDeployUrl({ SMOKE_BASE_URL: 'https://pitch.joinwestpeek.com' }), 'https://pitch.joinwestpeek.com');
assert.equal(resolveDeployUrl({ PLAYWRIGHT_BASE_URL: 'http://127.0.0.1:4173' }), '');
assert.equal(resolveDeployUrl({ PITCH_LAB_DEPLOY_URL: 'https://primary.example', POSTDEPLOY_BASE_URL: 'https://secondary.example' }), 'https://primary.example');
const normalized = normalizeDeployEnv({ POSTDEPLOY_BASE_URL: 'https://pitch.joinwestpeek.com' });
for (const key of ['PITCH_LAB_DEPLOY_URL', 'POSTDEPLOY_BASE_URL', 'SMOKE_BASE_URL', 'PLAYWRIGHT_BASE_URL']) assert.equal(normalized[key], 'https://pitch.joinwestpeek.com');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pitch-lab-env-contract-'));
const envPath = path.join(tempDir, '.env.local');
fs.writeFileSync(envPath, [
  'OPENAI_API_KEY=local-test-key',
  'FISH_API_KEY=fish-test-key',
  'FISH_VOICE_REFERENCE_ID=voice-ref',
  'DID_API_KEY=did-test-key',
  'DID_SOURCE_URL=https://assets.joinwestpeek.com/source.png',
  'NETWORK_OS_SHARED_SECRET=0123456789abcdef',
  'NETWORK_OS_BASE_URL=https://network.joinwestpeek.com'
].join('\n'));
assert.deepEqual(summarizeLiveEnv(parseEnvFile(envPath)).missingGroups, []);
fs.rmSync(tempDir, { recursive: true, force: true });

const orchestrator = fs.readFileSync('scripts/run-test-operations-orchestrator.mjs', 'utf8');
assert.match(orchestrator, /withEnvLocalTemporarilyHidden/);
assert.match(orchestrator, /localEnvExistedAtStart/);
assert.match(orchestrator, /localEnvCreatedByOrchestrator/);
assert.doesNotMatch(orchestrator, /function removeLocalEnv\(/);
assert.match(orchestrator, /prepare-local-live-env\.mjs/);
assert.match(orchestrator, /normalizeDeployEnv/);
assert.match(orchestrator, /resolveDeployUrl/);
const closer = fs.readFileSync('scripts/release-close-lifecycle.mjs', 'utf8');
assert.match(closer, /normalizeDeployEnv/);
assert.match(closer, /deployUrl:deployUrl\|\|null/);
for (const file of ['scripts/run-postdeploy-functions.mjs', 'scripts/run-postdeploy-gauntlet.mjs']) {
  const source = fs.readFileSync(file, 'utf8');
  assert.match(source, /normalizeDeployEnv/);
  assert.match(source, /PLAYWRIGHT_SKIP_WEBSERVER: 'true'/);
}
const playwrightConfig = fs.readFileSync('playwright.config.mjs', 'utf8');
assert.match(playwrightConfig, /PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH/);
assert.match(playwrightConfig, /PLAYWRIGHT_WORKERS \|\| 4/);
assert.match(playwrightConfig, /PLAYWRIGHT_DISABLE_VIDEO/);
const masterRunner = fs.readFileSync('scripts/run-master-gauntlet.mjs', 'utf8');
assert.match(masterRunner, /PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH/);
console.log('release lifecycle env contracts: PASS — local env is preserved, deploy URL aliases normalize, proof lanes are isolated, and browser execution is bounded.');
