#!/usr/bin/env node
// RUNBOOK.md is read by AI employees (Porter in West Peek OS, Danielle in Boss OS) at plan
// time; West Peek OS's web-property-change lane blocks without it. A runbook naming a path or
// script that no longer exists sends the reader to the wrong place, so this fails the build
// the moment they drift. Hard-fails on a missing runbook or one that names nothing.
import fs from 'node:fs';

const errors = [];
if (!fs.existsSync('RUNBOOK.md')) {
  console.error('validate:runbook FAILED\n  - RUNBOOK.md is missing at the repo root');
  process.exit(1);
}
const md = fs.readFileSync('RUNBOOK.md', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Backticked paths under a top-level directory, plus backticked root files (NAME.ext).
const dirPath = /`((?:src|functions|scripts|tests|config|content|public|docs|secrets|\.github)\/[^`#\s]+?)`/g;
const rootFile = /`([A-Za-z0-9_.-]+\.(?:md|json|toml|mjs|js))`/g;
const paths = [...new Set([...md.matchAll(dirPath), ...md.matchAll(rootFile)].map((m) => m[1]))]
  .filter((p) => !p.includes('<') && !p.includes('*'));
const scripts = [...new Set([...md.matchAll(/`npm run ([a-z0-9:-]+)`/g)].map((m) => m[1]))];

if (!paths.length) errors.push('RUNBOOK.md names no repo paths');
if (!scripts.length) errors.push('RUNBOOK.md names no npm scripts');
for (const p of paths) if (!fs.existsSync(p)) errors.push(`RUNBOOK.md names ${p}, which does not exist`);
for (const s of scripts) if (!pkg.scripts?.[s]) errors.push(`RUNBOOK.md names npm run ${s}, which package.json does not define`);

console.log(`runbook: ${paths.length} path(s) and ${scripts.length} script(s) verified`);
if (errors.length) {
  console.error('validate:runbook FAILED');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('validate:runbook PASS');
