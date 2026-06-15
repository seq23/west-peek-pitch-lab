#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { PITCH_QUESTIONS } from '../src/runtime/pitchQuestions.mjs';
import { createLocalDraftStoryCard } from '../src/runtime/storyCard.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = [];
const requiredFiles = [
  'src/runtime/pitchQuestions.mjs', 'src/runtime/storyCard.mjs', 'src/runtime/consent.mjs', 'src/runtime/practiceFlow.mjs',
  'tests/domain/phase3-contracts.mjs'
];
for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) failures.push(`Missing Phase 3 file: ${file}`);

if (PITCH_QUESTIONS.length !== 8) failures.push(`Expected 8 pitch questions, found ${PITCH_QUESTIONS.length}`);
for (const label of [
  'What are you building?', 'Who is it for?', 'What painful problem does it solve?', 'Why now?',
  'Why are you or your team the right people?', 'What proof or traction do you have?',
  'What kind of help, people, capital, customers, partners, or strategic relationships do you need next?',
  'Anything else AI Scooter should know?'
]) {
  if (!PITCH_QUESTIONS.some((question) => question.label === label)) failures.push(`Missing locked question: ${label}`);
}

const routeFiles = ['practice/index.html', 'story-card/index.html', 'share/index.html'].map((rel) => path.join(dist, rel));
for (const file of routeFiles) if (!fs.existsSync(file)) failures.push(`Missing built Phase 3 route file: ${path.relative(root, file)}`);
const combined = routeFiles.filter((file) => fs.existsSync(file)).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const phase3RuntimeSource = combined + '\n' + fs.readFileSync(path.join(root, 'src/runtime/practiceFlow.mjs'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'src/runtime/storyCard.mjs'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'src/runtime/shareFlow.mjs'), 'utf8');

for (const [label, terms] of [
  ['Local practice UI', ['Local practice flow', 'Live local draft preview']],
  ['Local card shell', ['Local Pitch Story Card shell', 'local draft']],
  ['Consent-gated sharing', ['explicit consent', 'No contact is created', 'pending intake']],
  ['No unearned success claim', ['does not guarantee funding', 'contact', 'human review']]
]) {
  const missing = terms.filter((term) => !phase3RuntimeSource.includes(term));
  if (missing.length) failures.push(`Phase 3 pages missing boundary (${label}): ${missing.join(', ')}`);
}

const builtClient = path.join(dist, 'assets', 'practice-flow.js');
if (!fs.existsSync(builtClient)) failures.push('Missing built client module: dist/assets/practice-flow.js');

const completeAnswers = Object.fromEntries(PITCH_QUESTIONS.map((question) => [question.id, question.required === false ? '' : 'This is a sufficiently detailed founder answer that satisfies the local validation requirement.']));
if (PITCH_QUESTIONS.at(-1).required !== false) failures.push('Final context question must remain optional.');
const card = createLocalDraftStoryCard(completeAnswers);
if (card.aiEnhanced !== false) failures.push('Local draft card must not be AI-enhanced in Phase 3.');
if (card.shareEnabled !== false) failures.push('Local draft card must not enable direct sharing before AI card generation.');
if (!card.notice.includes('local draft shell')) failures.push('Local draft card missing Phase 3 notice.');
if (card.status !== 'local_draft_complete') failures.push(`Expected complete local draft card, got ${card.status}`);

for (const claim of ['AI feedback generated', 'Pitch submitted successfully', 'Network OS intake created', 'Email sent successfully', 'Scooter reviewed your pitch']) {
  if (combined.includes(claim)) failures.push(`Forbidden Phase 3 runtime claim found: ${claim}`);
}

if (failures.length) {
  console.error('PHASE 3 VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('PHASE 3 VALIDATION PASSED');
console.log(`Checked questions: ${PITCH_QUESTIONS.length}`);
console.log(`Checked files: ${requiredFiles.length}`);
