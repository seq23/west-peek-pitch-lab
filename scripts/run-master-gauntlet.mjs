#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';

const headed = process.argv.includes('--headed');
const skipBrowserPreflight = process.argv.includes('--skip-browser-preflight') || process.env.PLAYWRIGHT_SKIP_BROWSER_PREFLIGHT === 'true';

function assertBrowserInstalled() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath();
  if (fs.existsSync(executablePath)) return;

  console.error('PLAYWRIGHT BROWSER PREFLIGHT FAILED');
  console.error(`Missing Chromium executable: ${executablePath}`);
  console.error('This repo is ready to run the full Playwright gauntlet, but the local Playwright browser binary is not installed in this environment.');
  console.error('Run locally: npx playwright install chromium');
  console.error('Then rerun: npm run gauntlet');
  console.error('For headed proof after install: npm run gauntlet:headed');
  console.error('This is an environment/runtime prerequisite failure, not proof that the product journey failed.');
  process.exit(1);
}

if (!skipBrowserPreflight) assertBrowserInstalled();

const args = ['playwright', 'test'];
if (headed) args.push('--headed');

const result = spawnSync('npx', args, { stdio: 'inherit', shell: false, env: process.env });
process.exit(result.status ?? 1);
