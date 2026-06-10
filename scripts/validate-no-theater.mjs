#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const scanDirs = ['src', 'functions', 'tests'];
const failures = [];
const forbiddenPatterns = [
  { pattern: /hardcoded success/i, label: 'hardcoded success language in implementation/test/script path' },
  { pattern: /fake success/i, label: 'fake success language in implementation/test/script path' },
  { pattern: /return\s+true\s*;\s*\/\/\s*auth/i, label: 'return true auth placeholder' },
  { pattern: /mock.*production/i, label: 'mock/production coupling language in implementation/test/script path' }
];

function walk(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) out.push(...walk(path.relative(root, full)));
    else out.push(full);
  }
  return out;
}

const files = scanDirs.flatMap(walk).filter((file) => /\.(ts|tsx|js|mjs|json|md)$/.test(file));
for (const file of files) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  for (const item of forbiddenPatterns) {
    if (item.pattern.test(text)) failures.push(`${rel}: ${item.label}`);
  }
}

const requiredDocs = [
  'docs/NO_THEATER_IMPLEMENTATION_GATES.md',
  'docs/PLAYWRIGHT_MASTER_GAUNTLET_PLAN.md',
  'docs/VALIDATION_SIMPLIFICATION_MATRIX.md'
];
for (const doc of requiredDocs) {
  if (!fs.existsSync(path.join(root, doc))) failures.push(`Missing required no-theater/proof document: ${doc}`);
}

if (failures.length) {
  console.error('NO-THEATER VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('NO-THEATER VALIDATION PASSED');
console.log(`Scanned files: ${files.length}`);
