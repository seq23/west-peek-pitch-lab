#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const baseUrl = process.env.PITCH_LAB_DEPLOY_URL;
if (!baseUrl) {
  console.error('PITCH_LAB_DEPLOY_URL is required for post-deploy functions gauntlet.');
  process.exit(1);
}
const result = spawnSync('npx', ['playwright', 'test', 'tests/e2e/post-deploy-functions.spec.mjs'], { stdio: 'inherit', env: { ...process.env, PITCH_LAB_DEPLOY_URL: baseUrl } });
process.exit(result.status ?? 1);
