#!/usr/bin/env node
// Pitch Lab claims guard (trimmed 10 Nov 2026 to its claims rules): the founder-facing
// pages never promise funding or a meeting, never show a "West Peek score" or claim
// Scooter reviewed a card, and keep the no-guarantee and confidentiality lines.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const distFiles = ['index.html', 'practice/index.html', 'story-card/index.html', 'share/index.html', 'thank-you/index.html'].map((rel) => path.join(root, 'dist', rel));
for (const file of distFiles) if (!fs.existsSync(file)) failures.push(`Missing built route (build first): ${path.relative(root, file)}`);
const combinedBuilt = distFiles.filter((file) => fs.existsSync(file)).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const runtime = ['src/runtime/storyCard.mjs', 'src/runtime/aiStoryCardClient.mjs', 'src/runtime/shareFlow.mjs', 'src/runtime/clipboard.mjs', 'src/ui/appShell.mjs']
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const combined = `${combinedBuilt}\n${runtime}`;

for (const [label, terms] of [
  ['not a prediction', ['not a funding prediction']],
  ['confidentiality reminder', ['Do not include confidential information']],
  ['no guarantee boundary', ['does not guarantee funding', 'personal Scooter review']]
]) {
  const missing = terms.filter((term) => !combined.includes(term));
  if (missing.length) failures.push(`Missing claims boundary (${label}): ${missing.join(', ')}`);
}
for (const forbidden of ['West Peek score', 'Scooter reviewed this', 'guaranteed meeting', 'guaranteed funding']) {
  if (combined.includes(forbidden)) failures.push(`Forbidden claim found: ${forbidden}`);
}
if (failures.length) {
  console.error('PITCH LAB CLAIMS GUARD FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Pitch Lab claims guard OK: no funding/meeting guarantee, no score, no review claim; boundary lines present.');
