#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const headed = process.argv.includes('--headed');
const args = ['playwright', 'test', 'tests/e2e/master-gauntlet.spec.mjs'];
if (headed) args.push('--headed');

const result = spawnSync('npx', args, { stdio: 'inherit', shell: false, env: process.env });
process.exit(result.status ?? 1);
