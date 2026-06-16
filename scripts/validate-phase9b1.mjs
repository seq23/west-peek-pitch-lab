#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (file) => fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : '';

for (const file of [
  'docs/PHASE_9B1_WEST_PEEK_DESIGN_PARITY.md',
  'public/assets/brand/west-peek-logo.jpg',
  'public/assets/brand/west-peek-logo.png',
  'public/assets/brand/west-peek-mark.png',
  'src/styles.css',
  'src/ui/appShell.mjs'
]) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing 9B.1 parity file: ${file}`);
}

for (const forbiddenAsset of ['public/assets/brand/west-peek-logo.svg', 'public/assets/brand/west-peek-mark.svg']) {
  if (fs.existsSync(path.join(root, forbiddenAsset))) failures.push(`Fabricated prior SVG brand asset still exists: ${forbiddenAsset}`);
}

const builtFiles = ['index.html', 'practice/index.html', 'story-card/index.html', 'share/index.html', 'thank-you/index.html', 'how-it-works/index.html'];
const built = builtFiles.map((rel) => read(`dist/${rel}`)).join('\n');
const styles = read('src/styles.css');
const shell = read('src/ui/appShell.mjs');
const doc = read('docs/PHASE_9B1_WEST_PEEK_DESIGN_PARITY.md');
const combined = `${built}\n${styles}\n${shell}\n${doc}`;

const requiredAnchors = [
  ['provided West Peek logo is canonical', ['west-peek-logo.jpg', 'west-peek-mark.png', 'provided logo']],
  ['Ventures inspiration', ['We back founders where', "can't be faked", 'community creates competitive advantage']],
  ['Live inspiration', ['operating system', 'command center', 'clear CTAs']],
  ['family style', ['black / white', 'restrained orange', 'editorial']],
  ['relationship-first promise', ['Good people should meet good people.', 'Good products need good stories.']],
  ['non-theater boundaries', ['explicit consent', 'does not guarantee funding', 'pending intake']]
];
for (const [label, terms] of requiredAnchors) {
  const missing = terms.filter((term) => !combined.includes(term));
  if (missing.length) failures.push(`Missing 9B.1 parity anchor (${label}): ${missing.join(', ')}`);
}

const forbidden = [
  'Email me my card',
  'Request limited avatar',
  'data-render-avatar',
  'data-render-voice',
  'west-peek-logo.svg',
  'west-peek-mark.svg'
];
const runtimeOnly = `${built}\n${styles}\n${shell}`;
for (const term of forbidden) {
  if (runtimeOnly.includes(term)) failures.push(`Forbidden 9B.1 term/asset reference found in runtime/built output: ${term}`);
}

if (!styles.includes('--wp-orange: #f05a1a')) failures.push('Orange accent token does not match 9B.1 restrained orange token.');
if (!styles.includes('border-radius: 0')) failures.push('9B.1 should use sharper editorial/OS surfaces, not generic rounded SaaS cards.');
if (!built.includes('Turn your startup story into a pitch people remember')) failures.push('Founder-first homepage positioning missing from built HTML.');
if (!built.includes('Make the story easier to repeat.')) failures.push('Ventures-style repeatable-story headline missing from built HTML.');

if (failures.length) {
  console.error('PHASE 9B.1 VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PHASE 9B.1 VALIDATION PASSED');
console.log('Checked provided-logo usage, Ventures/Live inspiration anchors, editorial black-white-orange parity, and no-theater boundaries.');
