#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { PHASE_2_ROUTES } from '../src/runtime/phase2Routes.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = [];

const requiredSourceFiles = [
  'src/styles.css', 'src/config/lockedCopy.json', 'src/runtime/lockedCopy.mjs',
  'src/runtime/disclosures.mjs', 'src/runtime/phase2Routes.mjs', 'src/ui/appShell.mjs',
  'scripts/build-static-app.mjs', 'scripts/route-smoke.mjs', 'scripts/visual-smoke.mjs',
  'scripts/validate-canonical-runtime.mjs', 'tests/domain/phase2-contracts.mjs'
];

for (const file of requiredSourceFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing Phase 2 source/check file: ${file}`);
}
if (!fs.existsSync(dist)) failures.push('Missing dist/. Run npm run build.');

const routeHtml = [];
for (const route of PHASE_2_ROUTES) {
  const filePath = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route.slice(1), 'index.html');
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing built route file: ${route}`);
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  routeHtml.push(html);
  for (const text of ['West Peek Pitch Lab', 'Good products need good stories.', 'Good people should meet good people.']) {
    if (!html.includes(text)) failures.push(`Built route ${route} missing locked brand/trust anchor: ${text}`);
  }
}

const combined = routeHtml.join('\n');
const requiredTrustBoundaries = [
  ['AI disclosure', ['AI Scooter is an AI storytelling coach inspired by Scooter Taylor', 'not the real-time human Scooter']],
  ['No investment/review guarantee', ['does not represent an investment decision', 'review, funding, introductions, or a meeting']],
  ['Provider boundary', ['Voice', 'avatar', 'Network OS', 'configured']],
  ['Share boundary', ['explicit consent', 'no automatic contact creation', 'no unearned success state']]
];
for (const [label, terms] of requiredTrustBoundaries) {
  const missing = terms.filter((term) => !combined.includes(term));
  if (missing.length) failures.push(`Built app missing Phase 2 trust boundary (${label}): ${missing.join(', ')}`);
}

for (const claim of ['Pitch submitted successfully', 'Email sent successfully', 'Scooter reviewed your pitch', 'Network OS submission complete', 'AI feedback generated']) {
  if (combined.includes(claim)) failures.push(`Forbidden fake runtime claim found: ${claim}`);
}

if (failures.length) {
  console.error('PHASE 2 VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('PHASE 2 VALIDATION PASSED');
console.log(`Checked routes: ${PHASE_2_ROUTES.length}`);
console.log(`Checked source/check files: ${requiredSourceFiles.length}`);
