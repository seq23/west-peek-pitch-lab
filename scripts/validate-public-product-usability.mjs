import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const requiredFiles = [
  'PUBLIC_PRODUCT_AUDIT.md','PUBLIC_ROUTE_MANIFEST.md','ENTITY_LIFECYCLE_MATRIX.md','VISIBLE_CONTROL_INVENTORY.md',
  'PRODUCTION_SHAPED_FIXTURES.md','DISPLAY_NORMALIZATION_CONTRACT.md','MAINTENANCE_SCALE_AND_PLATFORM_LIMITS.md',
  'HALLMARK_ROUTE_COVERAGE.md','FINAL_PROOF_COVERAGE_MATRIX.md','TESTING_ARCHITECTURE.md','TEST_FIXTURE_LIFECYCLE.md',
  'SECRETS_AND_VAULT_ARCHITECTURE.md','REAL_RUNTIME_PROOF_MATRIX.md','PREDEPLOY_POSTDEPLOY_RUNBOOK.md','MASTER_GAUNTLET.md',
  'DIAGNOSTICS_STANDARD.md','_repo_update_contract.json','REPO_MASTER_CONTRACT_ADDENDUM_AUTHENTICATED_PRODUCT_USABILITY_2026-06-13.md',
  'docs/PITCH_LAB_PERSISTENT_COACHING_ROOM_UI_CONTRACT.md','docs/PITCH_LAB_UX_UI_REDESIGN_IMPLEMENTATION_REPORT_2026-06-16.md',
  'src/ui/publicLanding.mjs','src/ui/sessionShell.mjs','src/ui/practiceWorkspace.mjs','src/ui/storyReviewWorkspace.mjs',
  'src/ui/shareWorkspace.mjs','src/runtime/sessionExperience.mjs','tests/e2e/founder-room-ux-proof.spec.mjs'
];
for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) failures.push(`missing required public-product artifact: ${file}`);

const updateContract = JSON.parse(fs.readFileSync(path.join(root, '_repo_update_contract.json'), 'utf8'));
if (updateContract.repo_name !== 'west-peek-pitch-lab' || updateContract.node_heap_mb !== 3072 || !updateContract.auth_not_applicable_reason) failures.push('public update contract mismatch');

const routeManifest = JSON.parse(fs.readFileSync(path.join(root, 'config/deployed-route-manifest.json'), 'utf8'));
if (routeManifest.routes.some((route) => route.authMode !== 'public')) failures.push('Pitch Lab route manifest must remain public-only');
for (const pathName of ['/', '/practice', '/story-card', '/share']) {
  const route = routeManifest.routes.find((item) => item.path === pathName);
  if (!route || !Array.isArray(route.safeActions) || route.safeActions.length < 2) failures.push(`critical route lacks populated safe actions: ${pathName}`);
}

const files = [
  'src/ui/appShell.mjs','src/ui/publicLanding.mjs','src/ui/sessionShell.mjs','src/ui/practiceWorkspace.mjs',
  'src/ui/storyReviewWorkspace.mjs','src/ui/shareWorkspace.mjs','src/runtime/practiceFlow.mjs',
  'src/runtime/aiStoryCardClient.mjs','src/runtime/shareFlow.mjs','src/runtime/sessionExperience.mjs','src/config/lockedCopy.json'
];
const source = Object.fromEntries(files.map((file) => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const activeCorpus = Object.values(source).join('\n');
for (const current of ['Start Step 1','Continue to your first question','Founder Story Card','Generate my Founder Story Card','Share my Founder Story Card with West Peek']) {
  if (!activeCorpus.includes(current)) failures.push(`current founder-facing action missing: ${current}`);
}
for (const stale of ['Start AI Scooter practice','Copy Pitch Story Card','Generate AI Pitch Story Card','Optional deck-as-context','Cached / reusable','No paid clip per question','Optional v1.1','Dynamic after text appears','AI Scooter media identity']) {
  if (activeCorpus.includes(stale)) failures.push(`stale or internal public language remains: ${stale}`);
}
if (!source['src/ui/appShell.mjs'].includes("navLink('/practice', 'Start pitch practice'")) failures.push('public navigation must expose Start pitch practice');
if (source['src/ui/appShell.mjs'].includes("navLink('/story-card'" ) || source['src/ui/appShell.mjs'].includes("navLink('/share'")) failures.push('public navigation must not expose sequential Story Card or Share destinations');
if (!source['src/ui/sessionShell.mjs'].includes('data-scooter-stage')) failures.push('persistent Scooter stage contract missing');
if (!source['src/ui/practiceWorkspace.mjs'].includes('data-story-draft-sheet')) failures.push('mobile Founder Story Card sheet missing');
if (!source['src/runtime/practiceFlow.mjs'].includes("data-practice-phase=\"profile\"") && !source['src/ui/practiceWorkspace.mjs'].includes('data-practice-phase="profile"')) failures.push('progressive profile phase missing');
if (!source['src/runtime/sessionExperience.mjs'].includes('previousFocus') || !source['src/runtime/sessionExperience.mjs'].includes('Escape')) failures.push('draft-sheet focus return / Escape behavior missing');

if (failures.length) {
  console.error('PUBLIC PRODUCT USABILITY CONTRACT: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Public product usability contract: PASS — persistent coaching room, progressive Step 1, canonical naming, safe navigation, and proof artifacts present.');
