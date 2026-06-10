import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const requiredFiles = [
  'README.md', 'REPO_IDENTITY.md', 'REPO_VALIDATION_MATRIX.md', 'ARCHITECTURAL_DECISIONS.md', 'ENVIRONMENT_VARIABLES.md',
  '.env.example', '.env.local.example', '.gitignore', '_repo_validation_matrix.json',
  'docs/PITCH_LAB_PRODUCT_SPEC.md', 'docs/SCOOTER_WISDOM_LAYER.md', 'docs/NETWORK_OS_HANDOFF_CONTRACT.md',
  'docs/PRIVACY_AND_CONSENT_MODEL.md', 'docs/AVATAR_PROVIDER_PLAN.md', 'docs/COST_AND_PROVIDER_PLAN.md',
  'docs/IMPLEMENTATION_PHASE_PLAN.md', 'docs/HOSTILE_REVIEW_RISK_REGISTER.md', 'docs/ENVIRONMENT_VAULT_PLAN.md',
  'docs/runbooks/ENVIRONMENT_SETUP.md', 'docs/VALIDATION_SIMPLIFICATION_MATRIX.md', 'docs/PLAYWRIGHT_MASTER_GAUNTLET_PLAN.md',
  'docs/NO_THEATER_IMPLEMENTATION_GATES.md', 'docs/PHASE_2_PLUS_HOSTILE_REVIEW.md',
  'config/env.registry.json', 'config/env.registry.schema.json', 'secrets/pitch-lab.env.vault.enc',
  'scripts/env/create-local-env.mjs', 'scripts/env/create-env-vault.mjs', 'scripts/env/inspect-env-vault.mjs',
  'scripts/env/write-cloudflare-env-plan.mjs', 'scripts/env/restore-local-env-from-vault.mjs',
  'scripts/validate-env-contract.mjs', 'scripts/validate-validation-matrix.mjs', 'scripts/validate-canonical-runtime.mjs', 'src/config/lockedCopy.json', 'src/runtime/lockedCopy.mjs'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

const corpus = requiredFiles
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
  .join('\n\n');

function requireExact(text) {
  if (!corpus.includes(text)) failures.push(`Missing locked string: ${text}`);
}
function requireConcept(label, terms) {
  const missing = terms.filter((term) => !corpus.includes(term));
  if (missing.length) failures.push(`Missing required concept (${label}): ${missing.join(', ')}`);
}

for (const text of [
  'West Peek Pitch Lab',
  'Pitch Practice with Scooter',
  'Good products need good stories.',
  'Good people should meet good people.',
  'AI Scooter is an AI storytelling coach inspired by Scooter Taylor'
]) requireExact(text);

requireConcept('Network OS handoff boundary', ['Network OS', 'No automatic contact creation', 'human_review_required', 'execution_allowed', 'pending_human_review']);
requireConcept('consent and privacy boundary', ['explicit share consent', 'No Network OS payload without explicit share consent']);
requireConcept('env vault contract', ['config/env.registry.json', 'secrets/pitch-lab.env.vault.enc', 'npm run env:create-local', 'ENV_VAULT_PASSPHRASE']);
requireConcept('provider plan', ['Gemini', 'OpenAI fallback', 'ElevenLabs', 'talking-photo', 'Cost guardrails']);
requireConcept('validation posture', ['Target product complexity', 'Level 5', 'DEEP JOURNEY / OUTCOME E2E', 'Master Gauntlet', 'Validation Simplification Matrix']);
requireConcept('no-theater posture', ['No hidden stubs', 'fake success', 'No open-source avatar rendering in the app path']);
requireConcept('Scooter wisdom invariant', ['Scooter Wisdom Layer', 'approved-wisdom.json', 'No fabricated Scooter quotes']);

if (failures.length) {
  console.error('PHASE 1 VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PHASE 1 VALIDATION PASSED');
console.log(`Checked files: ${requiredFiles.length}`);
console.log('Concept checks use grouped production-risk anchors, not petty exact-copy assertions.');
