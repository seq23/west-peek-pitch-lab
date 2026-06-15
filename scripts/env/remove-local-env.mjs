#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const keepBackup = process.argv.includes('--backup');

if (!fs.existsSync(envPath)) {
  console.log('LOCAL ENV CLEANUP: .env.local is already absent.');
  process.exit(0);
}

if (keepBackup) {
  const backupDir = path.join(root, 'tmp', 'env-backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `.env.local.${stamp}.bak`);
  fs.renameSync(envPath, backupPath);
  console.log(`LOCAL ENV CLEANUP: moved .env.local to ${path.relative(root, backupPath)}`);
} else {
  fs.rmSync(envPath, { force: true });
  console.log('LOCAL ENV CLEANUP: removed .env.local. Vault/source secret store was not modified.');
}
