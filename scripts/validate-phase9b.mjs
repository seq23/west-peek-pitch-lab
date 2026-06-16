#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const requiredFiles = [
  'docs/PHASE_9B_DESIGN_OVERHAUL.md',
  'public/assets/brand/west-peek-logo.jpg',
  'public/assets/brand/west-peek-logo.png',
  'public/assets/brand/west-peek-mark.png',
  'src/styles.css',
  'src/ui/appShell.mjs'
];
for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) failures.push(`Missing Phase 9B design file: ${file}`);

const builtRoutes = ['index.html', 'practice/index.html', 'story-card/index.html', 'share/index.html', 'thank-you/index.html', 'how-it-works/index.html']
  .map((rel) => path.join(root, 'dist', rel));
for (const file of builtRoutes) if (!fs.existsSync(file)) failures.push(`Missing built route for Phase 9B design trace: ${path.relative(root, file)}`);

const built = builtRoutes.filter((file) => fs.existsSync(file)).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const styles = fs.existsSync(path.join(root, 'src/styles.css')) ? fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8') : '';
const sourceFiles = ['src/ui/appShell.mjs', 'src/ui/publicLanding.mjs', 'src/ui/sessionShell.mjs', 'src/ui/practiceWorkspace.mjs', 'src/ui/storyReviewWorkspace.mjs', 'src/ui/shareWorkspace.mjs', 'src/runtime/practiceFlow.mjs', 'src/runtime/aiStoryCardClient.mjs', 'src/runtime/shareFlow.mjs'];
const source = sourceFiles.filter((file) => fs.existsSync(path.join(root, file))).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const combined = `${built}\n${styles}\n${source}`;

for (const [label, terms] of [
  ['West Peek logo asset usage', ['west-peek-logo.jpg', 'west-peek-mark.png', 'West Peek Ventures']],
  ['locked brand/product mantras', ['Good people should meet good people.', 'Good products need good stories.']],
  ['West Peek palette', ['--wp-black', '--wp-white', '--wp-orange', '#f05a1a']],
  ['premium founder-room layout', ['brand-band', 'avatar-card', 'story-card-stage']],
  ['readability preserved', ['Story Strength Snapshot', 'Copy Founder Story Card', 'Trust boundary']],
  ['share consent still visible', ['explicit consent', 'does not guarantee funding', 'pending intake']]
]) {
  const missing = terms.filter((term) => !combined.includes(term));
  if (missing.length) failures.push(`Missing Phase 9B design anchor (${label}): ${missing.join(', ')}`);
}

for (const forbidden of ['SaaS-blue', 'Email me my card', 'Request limited avatar', 'data-render-avatar', 'data-render-voice']) {
  if (combined.includes(forbidden)) failures.push(`Forbidden Phase 9B/removed-feature marker found: ${forbidden}`);
}

if (!built.includes('<img src="/assets/brand/west-peek-logo.jpg" alt="West Peek Ventures"')) failures.push('Built HTML does not render provided West Peek logo image.');
if (!styles.includes('background: var(--wp-black)') && !styles.includes('background: #090909')) failures.push('CSS does not use black as a primary CTA/brand surface.');
if (!styles.includes('color: var(--wp-orange-dark)')) failures.push('CSS does not use orange as accent treatment.');

if (failures.length) {
  console.error('PHASE 9B VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('PHASE 9B VALIDATION PASSED');
console.log('Checked West Peek logo assets, black/white/orange palette, mantra hierarchy, and readability/consent preservation.');
