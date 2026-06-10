#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { decryptJson } from './env-vault-lib.mjs';

const root = process.cwd();
const vaultPath = path.join(root, 'secrets/pitch-lab.env.vault.enc');
const registryPath = path.join(root, 'config/env.registry.json');
const outPath = path.join(root, 'logs/cloudflare-env-plan.txt');
const passphrase = process.env.ENV_VAULT_PASSPHRASE;
const args = process.argv.slice(2);
const fromVault = args.includes('--from-vault');
const includeAll = args.includes('--all');
const throughPhaseArg = args.find((arg) => arg.startsWith('--through-phase='));

function phaseRank(value) {
  const raw = String(value || '').toLowerCase();
  const match = raw.match(/phase(\d+)/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1]);
}

function parseRegistryVariables() {
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const defaultPhase = registry?.rules?.currentImplementedPhase || 'phase5';
  const throughPhase = throughPhaseArg ? throughPhaseArg.split('=')[1] : defaultPhase;
  return {
    variables: registry.variables,
    source: 'config/env.registry.json',
    throughPhase,
    currentImplementedPhase: defaultPhase
  };
}

function parseVaultVariables() {
  if (!fs.existsSync(vaultPath)) {
    console.error('Missing secrets/pitch-lab.env.vault.enc');
    process.exit(1);
  }
  const payload = decryptJson(JSON.parse(fs.readFileSync(vaultPath, 'utf8')), passphrase);
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const byKey = new Map((registry.variables || []).map((variable) => [variable.key, variable]));
  const payloadVariables = Array.isArray(payload.variables)
    ? payload.variables.map((item) => item.key).filter(Boolean)
    : Object.keys(payload.variables || {});
  return {
    variables: payloadVariables.map((key) => byKey.get(key) || { key, requiredPhase: 'unknown', cloudflareBinding: 'none' }),
    source: 'encrypted vault metadata and decrypted variable list',
    throughPhase: throughPhaseArg ? throughPhaseArg.split('=')[1] : registry?.rules?.currentImplementedPhase || 'phase5',
    currentImplementedPhase: registry?.rules?.currentImplementedPhase || 'phase5'
  };
}

const parsed = fromVault ? parseVaultVariables() : parseRegistryVariables();
const limitRank = includeAll ? Number.POSITIVE_INFINITY : phaseRank(parsed.throughPhase);
const selected = [];
const skipped = [];
for (const variable of parsed.variables) {
  const key = variable.key;
  if (variable.cloudflareBinding === 'none') {
    skipped.push({ key, reason: 'local_tooling_or_not_app_runtime' });
    continue;
  }
  if (!includeAll && phaseRank(variable.requiredPhase) > limitRank) {
    skipped.push({ key, reason: `future_phase:${variable.requiredPhase}` });
    continue;
  }
  selected.push(variable);
}

const lines = [
  '# Cloudflare env sync plan — dry-run output only',
  '# Review before running any apply/sync command.',
  '# Secrets are shown by name only, never by value.',
  `# Source: ${parsed.source}`,
  `# Current implemented phase: ${parsed.currentImplementedPhase}`,
  `# Included through phase: ${includeAll ? 'all' : parsed.throughPhase}`,
  '# Local deploy/vault tooling vars are never pushed into the app runtime.',
  ''
];

for (const variable of selected) {
  if (variable.cloudflareBinding === 'secret') {
    lines.push(`wrangler pages secret put ${variable.key}`);
  } else if (variable.cloudflareBinding === 'plain_var') {
    lines.push(`wrangler pages secret put ${variable.key} # plain app var; use dashboard/wrangler var support when target is finalized`);
  }
}

lines.push('', '# Skipped by design');
for (const item of skipped) lines.push(`# - ${item.key}: ${item.reason}`);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join('\n'));
console.log(`Wrote ${path.relative(root, outPath)}`);
console.log('This script does not apply anything to Cloudflare. It creates the deterministic deployment plan only.');
console.log(`Included vars: ${selected.length}`);
console.log(`Skipped vars: ${skipped.length}`);
