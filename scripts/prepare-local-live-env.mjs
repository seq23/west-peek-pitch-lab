#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseEnvFile, summarizeLiveEnv } from './lib/release-env.mjs';

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const existedBefore = fs.existsSync(envPath);

if (!existedBefore) {
  if (!process.env.ENV_VAULT_PASSPHRASE) {
    console.error('LOCAL LIVE ENV: BLOCKED');
    console.error('.env.local is absent and ENV_VAULT_PASSPHRASE is not set.');
    console.error('Create/restore .env.local locally, or set ENV_VAULT_PASSPHRASE so the approved encrypted vault can restore it.');
    process.exit(1);
  }
  const restore = spawnSync('npm', ['run', 'env:restore'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
    shell: false
  });
  if ((restore.status ?? 1) !== 0 || !fs.existsSync(envPath)) {
    console.error('LOCAL LIVE ENV: RESTORE FAILED');
    process.exit(restore.status ?? 1);
  }
}

const localEnv = parseEnvFile(envPath);
const summary = summarizeLiveEnv({ ...localEnv, ...process.env });
console.log(`LOCAL LIVE ENV: PASS (${existedBefore ? 'existing .env.local preserved' : 'restored from approved vault'})`);
console.log(`Configured proof groups: ${summary.configuredGroups.length ? summary.configuredGroups.join(', ') : 'none detected'}`);
if (summary.missingGroups.length) console.log(`Missing proof groups will fail only their own live lanes: ${summary.missingGroups.join(', ')}`);
console.log('Secret values were not printed.');
