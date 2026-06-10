#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { encryptJson } from './env-vault-lib.mjs';

const root = process.cwd();
const registryPath = path.join(root, 'config/env.registry.json');
const vaultPath = path.join(root, 'secrets/pitch-lab.env.vault.enc');
const sourcePath = process.argv.includes('--from-local') ? path.join(root, '.env.local') : null;
const passphrase = process.env.ENV_VAULT_PASSPHRASE;
const force = process.argv.includes('--force');

if (fs.existsSync(vaultPath) && !force) {
  console.error('Encrypted env vault already exists. Re-run with --force only if you intentionally want to overwrite it.');
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const values = {};

if (sourcePath) {
  if (!fs.existsSync(sourcePath)) {
    console.error('Cannot use --from-local because .env.local does not exist. Run npm run env:create-local first.');
    process.exit(1);
  }
  const local = fs.readFileSync(sourcePath, 'utf8');
  for (const line of local.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    values[line.slice(0, idx)] = line.slice(idx + 1);
  }
} else {
  for (const variable of registry.variables) values[variable.key] = variable.placeholder;
}

const payload = {
  repo: registry.repo,
  registryVersion: registry.version,
  source: sourcePath ? '.env.local' : 'registry-placeholders',
  warning: sourcePath ? 'Contains local values encrypted with an external passphrase.' : 'Placeholder-only encrypted vault. Replace with real local values by running --from-local.',
  variables: registry.variables.map((variable) => ({
    key: variable.key,
    requiredPhase: variable.requiredPhase,
    scope: variable.scope,
    cloudflareBinding: variable.cloudflareBinding,
    clientExposure: variable.clientExposure,
    value: values[variable.key] ?? variable.placeholder
  }))
};

fs.mkdirSync(path.dirname(vaultPath), { recursive: true });
fs.writeFileSync(vaultPath, JSON.stringify(encryptJson(payload, passphrase), null, 2));
console.log(`Wrote encrypted env vault: ${path.relative(root, vaultPath)}`);
console.log('Passphrase was read from ENV_VAULT_PASSPHRASE and was not written to repo.');
