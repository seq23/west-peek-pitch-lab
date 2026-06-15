#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const canonicalPath = path.join(root, 'src/config/lockedCopy.json');
const runtimePath = path.join(root, 'src/runtime/lockedCopy.mjs');

const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
const runtime = fs.readFileSync(runtimePath, 'utf8');

if (!runtime.includes('src/config/lockedCopy.json')) failures.push('Runtime locked copy must load src/config/lockedCopy.json as canonical source');
if (fs.existsSync(path.join(root, 'src/config/lockedCopy.ts'))) failures.push('Removed scaffold returned: src/config/lockedCopy.ts');

const required = [
  'West Peek Pitch Lab',
  'Pitch Practice with Scooter',
  'Good products need good stories.',
  'Good people should meet good people.',
  'Practice your pitch',
  'AI Scooter is an AI storytelling coach inspired by Scooter Taylor'
];
for (const text of required) {
  if (!Object.values(canonical).some((value) => String(value).includes(text))) failures.push(`Canonical locked copy missing ${text}`);
}

if (failures.length) {
  console.error('LOCKED COPY VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('LOCKED COPY VALIDATION PASSED');
