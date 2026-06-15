#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { decryptJson } from './env-vault-lib.mjs';

const root = process.cwd();
const vaultPath = path.join(root, 'secrets/pitch-lab.env.vault.enc');
const targetPath = path.join(root, '.env.local');
const passphrase = process.env.ENV_VAULT_PASSPHRASE;
const force = process.argv.includes('--force');

if (!fs.existsSync(vaultPath)) {
  console.error('Missing secrets/pitch-lab.env.vault.enc');
  process.exit(1);
}

if (fs.existsSync(targetPath) && !force) {
  console.error('.env.local already exists. Re-run with --force only if you intentionally want to overwrite it from the encrypted vault.');
  process.exit(1);
}

const payload = decryptJson(JSON.parse(fs.readFileSync(vaultPath, 'utf8')), passphrase);
const lines = [
  '# West Peek Pitch Lab local env',
  '# Restored from encrypted env vault',
  '# Never commit this file.',
  ''
];

for (const variable of payload.variables) {
  lines.push(`# phase=${variable.requiredPhase} scope=${variable.scope} cloudflare=${variable.cloudflareBinding}`);
  lines.push(`${variable.key}=${String(variable.value ?? '')}`);
  lines.push('');
}

fs.writeFileSync(targetPath, lines.join('\n'));
console.log(`Restored ${path.relative(root, targetPath)} from encrypted vault.`);
console.log('Raw values were written only to .env.local, which is ignored by git.');
