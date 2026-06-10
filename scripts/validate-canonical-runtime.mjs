#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const forbiddenTsRoots = ['src'];
for (const rootDir of forbiddenTsRoots) {
  const abs = path.join(root, rootDir);
  if (!fs.existsSync(abs)) continue;
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.endsWith('.ts')) failures.push(`TypeScript scaffold file found in canonical .mjs runtime path: ${path.relative(root, full)}`);
    }
  }
}

const requiredRuntimeFiles = [
  'src/config/lockedCopy.json',
  'src/runtime/lockedCopy.mjs',
  'src/runtime/disclosures.mjs',
  'src/runtime/phase2Routes.mjs',
  'src/runtime/pitchQuestions.mjs',
  'src/runtime/storyCard.mjs',
  'src/runtime/consent.mjs',
  'src/runtime/practiceFlow.mjs',
  'src/runtime/aiStoryCardClient.mjs',
  'src/ui/appShell.mjs'
];
for (const file of requiredRuntimeFiles) if (!fs.existsSync(path.join(root, file))) failures.push(`Missing canonical runtime file: ${file}`);

const buildScript = fs.readFileSync(path.join(root, 'scripts/build-static-app.mjs'), 'utf8');
for (const forbidden of ['src/main.ts', 'src/App.ts', 'appShell.ts', 'phase2Routes.ts', 'lockedCopy.ts', 'disclosures.ts']) {
  if (buildScript.includes(forbidden)) failures.push(`Build script references removed TypeScript scaffold: ${forbidden}`);
}

const packageJson = fs.readFileSync(path.join(root, 'package.json'), 'utf8');
for (const forbidden of ['src/main.ts', 'src/App.ts', 'src/config/lockedCopy.ts', 'src/config/disclosures.ts', 'src/domain/phase2Routes.ts', 'src/domain/pitchQuestions.ts', 'src/domain/storyCard.ts', 'src/domain/consent.ts', 'src/ui/appShell.ts']) {
  if (packageJson.includes(forbidden)) failures.push(`package.json references removed TypeScript scaffold: ${forbidden}`);
}

const lockedRuntime = fs.readFileSync(path.join(root, 'src/runtime/lockedCopy.mjs'), 'utf8');
if (!lockedRuntime.includes('src/config/lockedCopy.json')) failures.push('Runtime locked copy must load canonical JSON source.');

if (failures.length) {
  console.error('CANONICAL RUNTIME VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('CANONICAL RUNTIME VALIDATION PASSED');
console.log('Canonical path: plain .mjs runtime + JSON contracts. No TypeScript scaffold files under src/.');
