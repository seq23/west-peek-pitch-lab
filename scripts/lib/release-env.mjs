import fs from 'node:fs';

export const DEPLOY_URL_KEYS = [
  'PITCH_LAB_DEPLOY_URL',
  'POSTDEPLOY_BASE_URL',
  'SMOKE_BASE_URL',
  'PLAYWRIGHT_BASE_URL'
];

export function isExplicitRemoteHttpsUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:') return false;
    return !/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function resolveDeployUrl(env = process.env) {
  for (const key of DEPLOY_URL_KEYS) {
    const value = String(env?.[key] || '').trim();
    if (isExplicitRemoteHttpsUrl(value)) return value.replace(/\/$/, '');
  }
  return '';
}

export function normalizeDeployEnv(env = process.env) {
  const normalized = { ...env };
  const deployUrl = resolveDeployUrl(env);
  if (!deployUrl) return normalized;
  normalized.PITCH_LAB_DEPLOY_URL = deployUrl;
  normalized.POSTDEPLOY_BASE_URL = deployUrl;
  normalized.SMOKE_BASE_URL = deployUrl;
  normalized.PLAYWRIGHT_BASE_URL = deployUrl;
  return normalized;
}

export function parseEnvFile(file) {
  if (!file || !fs.existsSync(file)) return {};
  const parsed = {};
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    parsed[key] = value;
  }
  return parsed;
}

export function isConfigured(value) {
  const text = String(value || '').trim();
  return Boolean(text) && !/REPLACE_WITH|placeholder|example\.com|localhost|disabled|changeme/i.test(text);
}

export function summarizeLiveEnv(env = {}) {
  const has = (key) => isConfigured(env[key]);
  const groups = {
    llm: has('OPENAI_API_KEY') || has('GEMINI_API_KEY'),
    voice: (((has('FISH_API_KEY') || has('FISH_AUDIO_API_KEY')) && (has('FISH_VOICE_REFERENCE_ID') || has('FISH_AUDIO_REFERENCE_ID'))) || has('ELEVENLABS_API_KEY')),
    avatar: ((has('DID_API_KEY') && has('DID_SOURCE_URL')) || (has('HEYGEN_API_KEY') && (has('HEYGEN_AVATAR_ID') || has('HEYGEN_SOURCE_IMAGE_URL') || has('DID_SOURCE_URL')))),
    networkOs: has('NETWORK_OS_SHARED_SECRET') && (
      has('NETWORK_OS_PITCH_LAB_PACKET_ENDPOINT') ||
      has('NETWORK_OS_PITCH_LAB_ENDPOINT') ||
      has('NETWORK_OS_INTAKE_URL') ||
      has('NETWORK_OS_BASE_URL')
    )
  };
  return {
    groups,
    configuredGroups: Object.entries(groups).filter(([, ok]) => ok).map(([name]) => name),
    missingGroups: Object.entries(groups).filter(([, ok]) => !ok).map(([name]) => name)
  };
}
