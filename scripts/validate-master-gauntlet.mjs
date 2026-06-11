#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (file) => fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : '';
const exists = (file) => { if (!fs.existsSync(path.join(root, file))) failures.push(`Missing ${file}`); };

for (const file of [
  'docs/MASTER_GAUNTLET.md',
  'docs/PHASE_9D_ELEVENLABS_FIRST_MASTER_GAUNTLET_PLAN.md',
  'playwright.config.mjs',
  'tests/e2e/master-gauntlet.spec.mjs',
  'tests/e2e/fixtures/founder-session.json',
  'tests/e2e/fixtures/network-os-success.json',
  'tests/e2e/fixtures/network-os-failure.json',
  'scripts/run-master-gauntlet.mjs',
  'public/assets/avatar/scooter-avatar-source.png',
  'public/assets/avatar/clip-manifest.json',
  'src/server/media/scooterMediaIdentity.mjs'
]) exists(file);

const identity = read('src/server/media/scooterMediaIdentity.mjs');
const manifest = read('public/assets/avatar/clip-manifest.json');
const doc = read('docs/PHASE_9D_ELEVENLABS_FIRST_MASTER_GAUNTLET_PLAN.md') + read('docs/MASTER_GAUNTLET.md');
const spec = read('tests/e2e/master-gauntlet.spec.mjs');
const registry = JSON.parse(read('config/env.registry.json') || '{}');
const keys = new Set((registry.variables || []).map((v) => v.key));

for (const term of [
  'talkingScooterIsCoreExperience',
  'textOnlyIsDegradedMode',
  'approvedPhotoAsset',
  '/assets/avatar/scooter-avatar-source.png',
  'avatarProvider'
]) {
  if (!identity.includes(term)) failures.push(`Media identity missing required 9D term: ${term}`);
}
for (const term of ['welcome', 'final_summary', 'share_cta', 'coreProductRule', 'runtime_generation_cache_ready', 'runtimeMediaCacheContract']) {
  if (!manifest.includes(term)) failures.push(`Clip manifest missing required 9D media moment/status: ${term}`);
}
for (const term of ['talking AI Scooter media is core', 'Final personalized Pitch Story Card summary', 'Real env values are the last subset of Phase 9D']) {
  if (!doc.includes(term)) failures.push(`9D docs missing anchor: ${term}`);
}
for (const term of ['Good people should meet good people.', 'Good products need good stories.', 'Copy Pitch Story Card', 'does not guarantee', 'hostile max-depth', 'Network OS failure keeps the founder in honest non-submitted state', 'Scooter media lane is visibly core']) {
  if (!spec.includes(term)) failures.push(`Master gauntlet spec missing journey assertion: ${term}`);
}
if (registry?.rules?.currentImplementedPhase !== 'phase9d') failures.push('Env registry currentImplementedPhase must be phase9d for 9D patch.');
if (!keys.has('DID_API_KEY')) failures.push('Env registry missing D-ID API key.');
if (!keys.has('HEYGEN_API_KEY')) failures.push('Env registry missing HeyGen API key.');
if (!keys.has('AVATAR_PROVIDER')) failures.push('Env registry missing AVATAR_PROVIDER.');
const avatarProvider = (registry.variables || []).find((v) => v.key === 'AVATAR_PROVIDER');
if (avatarProvider?.placeholder !== 'did') failures.push('AVATAR_PROVIDER placeholder must be did for D-ID primary MVP.');

const forbidden = ['fundability score', 'Scooter reviewed this', 'meeting guaranteed', 'Email me my card'];
const runtimeFiles = [
  'src/ui/appShell.mjs',
  'src/runtime/shareFlow.mjs',
  'src/runtime/storyCard.mjs',
  'src/runtime/practiceFlow.mjs',
  'src/runtime/aiStoryCardClient.mjs',
  'src/runtime/disclosures.mjs'
];
const runtime = runtimeFiles.map(read).join('\n');
for (const term of forbidden) {
  if (runtime.includes(term)) failures.push(`Forbidden claim/feature found in runtime: ${term}`);
}
if (!spec.includes("test.describe('West Peek Pitch Lab Master Gauntlet — hostile max-depth'")) failures.push('Master gauntlet must identify as hostile max-depth.');
if ((spec.match(/test\(/g) || []).length < 10) failures.push('Master gauntlet must contain at least 10 behavioral tests before repo setup/deploy.');
for (const term of ['Network OS failure', 'explicit consent', 'thank-you page refuses', 'AI story generation fails honestly', 'UI does not expose secret names']) {
  if (!spec.includes(term)) failures.push(`Master gauntlet missing max-depth behavior: ${term}`);
}

if (failures.length) {
  console.error('MASTER GAUNTLET VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('MASTER GAUNTLET VALIDATION PASSED');
console.log('Gauntlet created for local/headed Playwright execution; live provider proof remains gated on env/API IDs and runtime media cache policy.');
