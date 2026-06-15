#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distAssets = path.join(root, 'dist', 'assets');
const htmlEntryFiles = ['practice-flow.js', 'ai-story-card.js', 'share-flow.js', 'delete-my-info.js'];
const errors = [];

if (!fs.existsSync(distAssets)) {
  console.error('BROWSER RUNTIME BUNDLE: FAIL — dist/assets is missing; run npm run build first.');
  process.exit(1);
}

const visited = new Set();
function inspect(relativeFile) {
  if (visited.has(relativeFile)) return;
  visited.add(relativeFile);
  const absolute = path.join(distAssets, relativeFile);
  if (!fs.existsSync(absolute)) {
    errors.push(`missing browser module: assets/${relativeFile}`);
    return;
  }
  const source = fs.readFileSync(absolute, 'utf8');
  const importPattern = /(?:import|export)\s+(?:[^'\"]*?\s+from\s+)?['\"](\.\/[^'\"]+)['\"]/g;
  for (const match of source.matchAll(importPattern)) {
    const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(relativeFile), match[1]));
    inspect(dependency);
  }
}

for (const entry of htmlEntryFiles) inspect(entry);

if (errors.length) {
  console.error('BROWSER RUNTIME BUNDLE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`BROWSER RUNTIME BUNDLE: PASS (${visited.size} reachable modules)`);
