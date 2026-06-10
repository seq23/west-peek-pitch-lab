import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registryPath = path.join(root, 'config/env.registry.json');
const vaultPath = path.join(root, 'secrets/pitch-lab.env.vault.enc');
const examplePaths = ['.env.example', '.env.local.example'];
const failures = [];

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
  catch (error) { failures.push(`Invalid JSON: ${file} (${error.message})`); return null; }
}

const registry = readJson('config/env.registry.json');
if (registry) {
  const keys = registry.variables.map((variable) => variable.key);
  const unique = new Set(keys);
  if (unique.size !== keys.length) failures.push('Duplicate env keys in config/env.registry.json');
  for (const variable of registry.variables) {
    if (!/^[A-Z0-9_]+$/.test(variable.key)) failures.push(`Invalid env key: ${variable.key}`);
    if (variable.scope.includes('secret') && variable.clientExposure !== 'forbidden') {
      failures.push(`Secret key must forbid client exposure: ${variable.key}`);
    }
    if (variable.cloudflareBinding === 'secret' && !variable.scope.includes('secret')) {
      failures.push(`Cloudflare secret binding must use secret scope: ${variable.key}`);
    }
    if (variable.cloudflareBinding === 'none' && variable.scope !== 'local_tooling') {
      failures.push(`Cloudflare none binding is only allowed for local tooling vars: ${variable.key}`);
    }
  }

  for (const examplePath of examplePaths) {
    if (!fs.existsSync(path.join(root, examplePath))) {
      failures.push(`Missing ${examplePath}`);
      continue;
    }
    const text = fs.readFileSync(path.join(root, examplePath), 'utf8');
    for (const key of keys) {
      if (!text.includes(`${key}=`)) failures.push(`${examplePath} missing ${key}`);
    }
  }
}

if (!fs.existsSync(vaultPath)) {
  failures.push('Missing encrypted env vault: secrets/pitch-lab.env.vault.enc');
} else {
  const envelope = readJson('secrets/pitch-lab.env.vault.enc');
  if (envelope) {
    for (const key of ['format', 'algorithm', 'kdf', 'salt', 'iv', 'authTag', 'ciphertext']) {
      if (!envelope[key]) failures.push(`Encrypted env vault missing envelope field: ${key}`);
    }
    if (envelope.format !== 'west-peek-env-vault-v1') failures.push('Encrypted env vault format mismatch');
    if (envelope.algorithm !== 'aes-256-gcm') failures.push('Encrypted env vault algorithm mismatch');
  }
}

const gitignore = fs.existsSync(path.join(root, '.gitignore')) ? fs.readFileSync(path.join(root, '.gitignore'), 'utf8') : '';
for (const pattern of ['.env', '.env.*', '!secrets/*.env.vault.enc', 'secrets/*.env.vault.json', '.env.vault.key']) {
  if (!gitignore.includes(pattern)) failures.push(`.gitignore missing env safety pattern: ${pattern}`);
}

if (failures.length) {
  console.error('ENV CONTRACT VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('ENV CONTRACT VALIDATION PASSED');
console.log(`Registered env vars: ${registry.variables.length}`);
