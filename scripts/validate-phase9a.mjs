#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const requiredFiles = [
  'docs/PHASE_9A_PITCH_LAB_E2E_AND_COMPLETENESS_REVIEW.md',
  'src/runtime/clipboard.mjs',
  'tests/domain/phase9a-contracts.mjs'
];
for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) failures.push(`Missing Phase 9A file: ${file}`);

const distFiles = ['index.html', 'practice/index.html', 'story-card/index.html', 'share/index.html', 'thank-you/index.html'].map((rel) => path.join(root, 'dist', rel));
for (const file of distFiles) if (!fs.existsSync(file)) failures.push(`Missing built route for Phase 9A trace: ${path.relative(root, file)}`);
const combinedBuilt = distFiles.filter((file) => fs.existsSync(file)).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const runtime = ['src/runtime/storyCard.mjs', 'src/runtime/aiStoryCardClient.mjs', 'src/runtime/shareFlow.mjs', 'src/runtime/clipboard.mjs', 'src/ui/appShell.mjs']
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const combined = `${combinedBuilt}\n${runtime}`;

for (const [label, terms] of [
  ['copy-card path', ['Copy Pitch Story Card', 'formatStoryCardForClipboard']],
  ['story strength signals', ['Story Strength Snapshot', 'Needs Sharpening', 'not a funding prediction']],
  ['no-account/no-forced-share', ['No account required', 'Share only if you choose']],
  ['confidentiality reminder', ['Do not include confidential information']],
  ['what happens next', ['What happens next', 'pending intake queue']],
  ['honest thank-you', ['No confirmed submission found', 'Network OS confirms']],
  ['no guarantee boundary', ['does not guarantee funding', 'personal Scooter review']]
]) {
  const missing = terms.filter((term) => !combined.includes(term));
  if (missing.length) failures.push(`Missing Phase 9A journey/completeness anchor (${label}): ${missing.join(', ')}`);
}

for (const forbidden of ['West Peek score', 'Scooter reviewed this', 'guaranteed meeting', 'guaranteed funding', 'Email me my card']) {
  if (combined.includes(forbidden)) failures.push(`Forbidden Phase 9A claim or removed feature found: ${forbidden}`);
}

if (failures.length) {
  console.error('PHASE 9A VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('PHASE 9A VALIDATION PASSED');
console.log('Checked journey anchors, copy path, qualitative signals, and removed email/numeric-score risks.');
