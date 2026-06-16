#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { normalizeDeployEnv, resolveDeployUrl } from './lib/release-env.mjs';

const headed = process.argv.includes('--headed');
const normalizedEnv = normalizeDeployEnv(process.env);
const baseUrl = resolveDeployUrl(normalizedEnv);
if (!baseUrl) {
  console.error('PITCH_LAB_DEPLOY_URL is required for post-deploy journey gauntlet.');
  process.exit(1);
}
const args = ['playwright', 'test', 'tests/e2e/post-deploy-journey.spec.mjs'];
if (headed) args.push('--headed');
const result = spawnSync('npx', args, { stdio: 'inherit', env: { ...normalizedEnv, PITCH_LAB_DEPLOY_URL: baseUrl, PLAYWRIGHT_BASE_URL: baseUrl, PLAYWRIGHT_SKIP_WEBSERVER: 'true' } });
process.exit(result.status ?? 1);
