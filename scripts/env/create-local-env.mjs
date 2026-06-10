#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registryPath = path.join(root, 'config/env.registry.json');
const targetPath = path.join(root, '.env.local');
const force = process.argv.includes('--force');

if (!fs.existsSync(registryPath)) {
  console.error('Missing config/env.registry.json');
  process.exit(1);
}

if (fs.existsSync(targetPath) && !force) {
  console.error('.env.local already exists. Re-run with --force only if you intentionally want to overwrite local placeholder values.');
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const lines = [
  '# West Peek Pitch Lab local env',
  '# Generated from config/env.registry.json',
  '# Safe placeholders only. Replace local values as needed.',
  '# Never commit this file.',
  ''
];

for (const variable of registry.variables) {
  lines.push(`# ${variable.description}`);
  lines.push(`# phase=${variable.requiredPhase} scope=${variable.scope} cloudflare=${variable.cloudflareBinding}`);
  lines.push(`${variable.key}=${variable.placeholder}`);
  lines.push('');
}

fs.writeFileSync(targetPath, lines.join('\n'));
console.log(`Created ${path.relative(root, targetPath)} from config/env.registry.json`);
console.log('Review and replace placeholder values locally. Do not commit .env.local.');
