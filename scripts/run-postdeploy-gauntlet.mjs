#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const headed = process.argv.includes('--headed');
const baseUrl = process.env.PITCH_LAB_DEPLOY_URL;
if (!baseUrl) {
  console.error('PITCH_LAB_DEPLOY_URL is required for post-deploy journey gauntlet.');
  process.exit(1);
}
const args = ['playwright', 'test', 'tests/e2e/post-deploy-journey.spec.mjs'];
if (headed) args.push('--headed');
const result = spawnSync('npx', args, { stdio: 'inherit', env: { ...process.env, PITCH_LAB_DEPLOY_URL: baseUrl } });
process.exit(result.status ?? 1);
