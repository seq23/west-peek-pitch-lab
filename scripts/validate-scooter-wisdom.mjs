#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildScooterWisdomContext } from '../src/server/ai/scooterWisdom.mjs';
import { getApprovedScooterWisdomRegistry, validateScooterWisdomRegistry } from '../src/server/ai/scooterWisdomRegistry.mjs';

const root = process.cwd();
const failures = [];
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : ''; }

for (const rel of [
  'content/scooter-wisdom/raw/README.md',
  'content/scooter-wisdom/approved/approved-wisdom.json',
  'src/server/ai/scooterWisdomRegistry.mjs',
  'src/server/ai/scooterWisdom.mjs',
  'tests/domain/phase5-contracts.mjs'
]) {
  if (!exists(rel)) failures.push(`Missing Phase 5 file: ${rel}`);
}

const registry = getApprovedScooterWisdomRegistry();
const validation = validateScooterWisdomRegistry(registry);
const envRegistry = JSON.parse(read('config/env.registry.json'));
const forbiddenWisdomEnvPattern = /SCOOTER_WISDOM_[A-Z0-9_]+/g;
const envSurfaces = [
  ['config/env.registry.json', JSON.stringify(envRegistry)],
  ['.env.example', read('.env.example')],
  ['.env.local.example', read('.env.local.example')]
];
for (const [surface, text] of envSurfaces) {
  const matches = text.match(forbiddenWisdomEnvPattern) || [];
  if (matches.length) failures.push(`Scooter Wisdom has no env layer; remove ${[...new Set(matches)].join(', ')} from ${surface}`);
}
if (!envRegistry.rules?.scooterWisdomPolicy?.includes('single source is content/scooter-wisdom/approved/approved-wisdom.json')) {
  failures.push('Env registry must state approved-wisdom.json is the single Scooter Wisdom source.');
}

if (!validation.ok) failures.push(...validation.errors);

const rawFiles = fs.readdirSync(path.join(root, 'content/scooter-wisdom/raw'));
if (!rawFiles.includes('README.md')) failures.push('Raw wisdom folder missing README boundary.');

const promptText = read('src/server/ai/promptContracts.mjs');
if (!promptText.includes('buildScooterWisdomContext')) failures.push('Prompt contract does not load approved Scooter Wisdom context.');
if (!promptText.includes('Scooter Wisdom Layer')) failures.push('Prompt contract missing Scooter Wisdom Layer instruction.');
if (promptText.includes('content/scooter-wisdom/raw')) failures.push('Prompt contract must not reference raw wisdom source folder.');

const context = buildScooterWisdomContext();
for (const required of [
  'Good products need good stories',
  'Good people should meet good people',
  'Founder trust is more important than capture',
  'Do not invent Scooter quotes',
  'West Peek will invest'
]) {
  if (!context.includes(required)) failures.push(`Built Scooter Wisdom context missing: ${required}`);
}

const docs = read('docs/SCOOTER_WISDOM_LAYER.md');
for (const requiredDocText of ['approved-only runtime', 'No fabricated Scooter quotes', 'V1 uses curated static wisdom chunks', 'raw material is not runtime material']) {
  if (!docs.includes(requiredDocText)) failures.push(`Scooter Wisdom docs missing: ${requiredDocText}`);
}

if (failures.length) {
  console.error('SCOOTER WISDOM VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SCOOTER WISDOM VALIDATION PASSED');
console.log(`Approved wisdom version: ${registry.version}`);
console.log(`Approved runtime chunks: ${registry.approvedChunks.length}`);
