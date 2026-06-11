#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { decryptJson, encryptJson } from './env-vault-lib.mjs';

const root = process.cwd();
const vaultPath = path.join(root, 'secrets/pitch-lab.env.vault.enc');
const registryPath = path.join(root, 'config/env.registry.json');
const passphrase = process.env.ENV_VAULT_PASSPHRASE;

function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const parsed = {};
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    parsed[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return parsed;
}

if (!fs.existsSync(vaultPath)) {
  console.error('Missing secrets/pitch-lab.env.vault.enc');
  process.exit(1);
}
if (!passphrase) {
  console.error('ENV_VAULT_PASSPHRASE is required. Raw secret values are not accepted as CLI args.');
  process.exit(1);
}

const env = { ...parseEnvFile(path.join(root, '.env.local')), ...process.env };
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const envelope = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
const payload = decryptJson(envelope, passphrase);
const byKey = new Map((payload.variables || []).map((item) => [item.key, item]));
const registryByKey = new Map((registry.variables || []).map((item) => [item.key, item]));

const managedKeys = [
  'AVATAR_PROVIDER',
  'AVATAR_SECONDARY_PROVIDER',
  'AVATAR_MODE',
  'AVATAR_DYNAMIC_GENERATION_ENABLED',
  'AVATAR_VOICE_MODE',
  'VOICE_PROVIDER',
  'VOICE_FALLBACK_PROVIDER',
  'FISH_API_KEY',
  'FISH_API_BASE_URL',
  'FISH_TTS_MODEL',
  'FISH_TTS_FORMAT',
  'FISH_VOICE_REFERENCE_ID',
  'DID_API_KEY',
  'DID_API_BASE_URL',
  'DID_SOURCE_URL',
  'DID_VOICE_PROVIDER',
  'DID_VOICE_ID',
  'DID_DRIVER_URL',
  'DID_WEBHOOK_URL',
  'HEYGEN_API_KEY',
  'HEYGEN_API_BASE_URL',
  'HEYGEN_AVATAR_ID',
  'HEYGEN_IMAGE_URL',
  'HEYGEN_VOICE_ID',
  'HEYGEN_ASPECT_RATIO',
  'HEYGEN_RESOLUTION'
];

const defaults = {
  AVATAR_PROVIDER: 'did',
  AVATAR_SECONDARY_PROVIDER: 'heygen',
  AVATAR_MODE: 'did_primary_heygen_secondary_talking_avatar',
  AVATAR_DYNAMIC_GENERATION_ENABLED: 'true',
  AVATAR_VOICE_MODE: 'uploaded_audio_primary',
  VOICE_PROVIDER: 'fish_audio',
  VOICE_FALLBACK_PROVIDER: 'elevenlabs',
  FISH_API_BASE_URL: 'https://api.fish.audio',
  FISH_TTS_MODEL: 's2-pro',
  FISH_TTS_FORMAT: 'mp3',
  DID_API_BASE_URL: 'https://api.d-id.com',
  DID_VOICE_PROVIDER: 'microsoft',
  DID_VOICE_ID: 'en-US-GuyNeural',
  HEYGEN_API_BASE_URL: 'https://api.heygen.com',
  HEYGEN_ASPECT_RATIO: '16:9',
  HEYGEN_RESOLUTION: '720p'
};

let changed = 0;
for (const key of managedKeys) {
  const registryItem = registryByKey.get(key);
  if (!registryItem) continue;
  const existing = byKey.get(key) || {
    key,
    requiredPhase: registryItem.requiredPhase,
    scope: registryItem.scope,
    cloudflareBinding: registryItem.cloudflareBinding,
    clientExposure: registryItem.clientExposure,
    value: registryItem.placeholder ?? ''
  };
  const nextValue = env[key] ?? defaults[key];
  if (nextValue !== undefined && String(nextValue).length > 0 && existing.value !== nextValue) {
    existing.value = nextValue;
    changed += 1;
  }
  byKey.set(key, existing);
}

payload.registryVersion = registry.version;
payload.source = 'upsert-provider-env-vault';
payload.warning = 'Contains local provider values encrypted with the approved vault passphrase.';
payload.variables = (registry.variables || []).map((variable) => {
  const existing = byKey.get(variable.key);
  return existing || {
    key: variable.key,
    requiredPhase: variable.requiredPhase,
    scope: variable.scope,
    cloudflareBinding: variable.cloudflareBinding,
    clientExposure: variable.clientExposure,
    value: variable.placeholder ?? ''
  };
});

fs.writeFileSync(vaultPath, JSON.stringify(encryptJson(payload, passphrase), null, 2));
console.log(`Updated encrypted provider vault values for ${changed} managed key(s).`);
console.log('Raw values were read only from process env/.env.local and were not printed.');
