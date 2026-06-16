#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { normalizeDeployEnv, resolveDeployUrl } from './lib/release-env.mjs';

const normalizedEnv = normalizeDeployEnv(process.env);
const baseUrl = resolveDeployUrl(normalizedEnv);
if (!baseUrl) {
  console.error('PITCH_LAB_DEPLOY_URL is required for post-deploy functions gauntlet.');
  process.exit(1);
}
const result = spawnSync('npx', ['playwright', 'test', 'tests/e2e/post-deploy-functions.spec.mjs'], { stdio: 'inherit', env: { ...normalizedEnv, PITCH_LAB_DEPLOY_URL: baseUrl, PLAYWRIGHT_BASE_URL: baseUrl, PLAYWRIGHT_SKIP_WEBSERVER: 'true' } });
process.exit(result.status ?? 1);
