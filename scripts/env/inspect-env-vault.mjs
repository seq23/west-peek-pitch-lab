#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { decryptJson } from './env-vault-lib.mjs';

const root = process.cwd();
const vaultPath = path.join(root, 'secrets/pitch-lab.env.vault.enc');
const registryPath = path.join(root, 'config/env.registry.json');
const passphrase = process.env.ENV_VAULT_PASSPHRASE;
const decrypt = process.argv.includes('--decrypt');

if (!fs.existsSync(vaultPath)) {
  console.error('Missing secrets/pitch-lab.env.vault.enc');
  process.exit(1);
}

const envelope = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const requiredEnvelopeFields = ['format', 'algorithm', 'kdf', 'salt', 'iv', 'authTag', 'ciphertext'];
const missing = requiredEnvelopeFields.filter((key) => !envelope[key]);
if (missing.length) {
  console.error(`Env vault envelope missing: ${missing.join(', ')}`);
  process.exit(1);
}
if (envelope.format !== 'west-peek-env-vault-v1') {
  console.error(`Unsupported env vault format: ${envelope.format}`);
  process.exit(1);
}
if (envelope.algorithm !== 'aes-256-gcm') {
  console.error(`Unsupported env vault algorithm: ${envelope.algorithm}`);
  process.exit(1);
}

console.log('Env vault envelope OK');
console.log(`Registry version: ${registry.version}`);
console.log(`Registered variables: ${registry.variables.length}`);
console.log(`Ciphertext bytes: ${Buffer.from(envelope.ciphertext, 'base64').length}`);

if (!decrypt) {
  console.log('Decryption not requested. Run with --decrypt and ENV_VAULT_PASSPHRASE to inspect values safely.');
  process.exit(0);
}

const payload = decryptJson(envelope, passphrase);
console.log(`Env vault decrypted OK: ${payload.repo}`);
console.log(`Vault variables: ${payload.variables.length}`);
for (const variable of payload.variables) {
  const value = String(variable.value ?? '');
  const placeholderLike = value.includes('REPLACE_WITH') || value === 'disabled' || value.includes('placeholder') || value.includes('localhost');
  console.log(`- ${variable.key}: ${variable.cloudflareBinding}; value=${placeholderLike ? 'placeholder/local-safe' : 'configured'}; len=${value.length}`);
}
