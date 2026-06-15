#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const registryPath = path.join(root, 'config/env.registry.json');
const localEnvPath = path.join(root, '.env.local');
const outDir = path.join(root, 'tmp/cloudflare-env-sync');
const bulkJsonPath = path.join(outDir, 'cloudflare-pages-env.bulk.json');
const reportPath = path.join(outDir, 'summary.md');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const fromVault = args.includes('--from-vault');
const cleanup = args.includes('--cleanup');
const includeAll = args.includes('--all');
const throughPhaseArg = args.find((arg) => arg.startsWith('--through-phase='));
const projectArg = args.find((arg) => arg.startsWith('--project='));
const explicitProject = projectArg ? projectArg.split('=')[1] : '';

function phaseRank(value) {
  const raw = String(value || '').toLowerCase();
  const match = raw.match(/phase(\d+)/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1]);
}

function parseDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: options.stdio || 'pipe',
    encoding: 'utf8',
    input: options.input
  });
  return result;
}

function isUsableValue(value) {
  if (value === undefined || value === null) return false;
  const text = String(value).trim();
  if (!text) return false;
  if (/^REPLACE_WITH_/i.test(text)) return false;
  if (/^DISABLED_UNLESS/i.test(text)) return false;
  if (/^TO_BE_SET/i.test(text)) return false;
  return true;
}

function ensureNoSecretPrint(value) {
  if (!value) return 'missing';
  return `present(len=${String(value).length})`;
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const throughPhase = throughPhaseArg
  ? throughPhaseArg.split('=')[1]
  : registry?.rules?.currentImplementedPhase || 'phase9d';
const limitRank = includeAll ? Number.POSITIVE_INFINITY : phaseRank(throughPhase);
const projectName =
  explicitProject ||
  process.env.CLOUDFLARE_PROJECT_NAME ||
  registry.variables.find((item) => item.key === 'CLOUDFLARE_PROJECT_NAME')?.placeholder ||
  registry.repo;

const existedBefore = fs.existsSync(localEnvPath);

if (fromVault) {
  const restore = run('node', ['scripts/env/restore-local-env-from-vault.mjs', '--force'], { stdio: 'pipe' });
  if (restore.status !== 0) {
    console.error('ENV RESTORE FAILED');
    if (restore.stdout) console.error(restore.stdout);
    if (restore.stderr) console.error(restore.stderr);
    process.exit(1);
  }
}

if (!fs.existsSync(localEnvPath)) {
  console.error('Missing .env.local. Run npm run env:restore:force or use --from-vault.');
  process.exit(1);
}

const localEnv = parseDotEnv(localEnvPath);
const selected = [];
const skipped = [];
const missing = [];
const payload = {};

for (const variable of registry.variables || []) {
  const key = variable.key;
  if (variable.cloudflareBinding === 'none') {
    skipped.push({ key, reason: 'local_tooling_or_not_app_runtime' });
    continue;
  }
  if (!includeAll && phaseRank(variable.requiredPhase) > limitRank) {
    skipped.push({ key, reason: `future_phase:${variable.requiredPhase}` });
    continue;
  }

  const value = localEnv[key];
  if (!isUsableValue(value)) {
    missing.push({
      key,
      binding: variable.cloudflareBinding,
      phase: variable.requiredPhase,
      status: ensureNoSecretPrint(value)
    });
    continue;
  }

  selected.push({
    key,
    binding: variable.cloudflareBinding,
    phase: variable.requiredPhase,
    status: ensureNoSecretPrint(value)
  });
  payload[key] = value;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(bulkJsonPath, JSON.stringify(payload, null, 2));

const lines = [
  '# Cloudflare Pages Env Sync Report',
  '',
  `- Mode: ${apply ? 'APPLY' : 'DRY RUN'}`,
  `- Project: ${projectName}`,
  `- Included through phase: ${includeAll ? 'all' : throughPhase}`,
  `- Source env: .env.local`,
  `- Bulk file: ${path.relative(root, bulkJsonPath)}`,
  `- Selected values: ${selected.length}`,
  `- Missing/skipped usable values: ${missing.length}`,
  `- Registry skipped: ${skipped.length}`,
  '',
  '## Selected for Cloudflare Pages',
  '',
  '| Key | Binding | Phase | Status |',
  '|---|---|---|---|',
  ...selected.map((item) => `| ${item.key} | ${item.binding} | ${item.phase} | ${item.status} |`),
  '',
  '## Missing Usable Local Values',
  '',
  '| Key | Binding | Phase | Local Status |',
  '|---|---|---|---|',
  ...missing.map((item) => `| ${item.key} | ${item.binding} | ${item.phase} | ${item.status} |`),
  '',
  '## Skipped By Registry',
  '',
  ...skipped.map((item) => `- ${item.key}: ${item.reason}`),
  ''
];

if (apply) {
  if (selected.length === 0) {
    lines.push('## Apply Result', '', 'FAIL — no selected values to upload.');
    fs.writeFileSync(reportPath, lines.join('\n'));
    console.error(`FAIL no selected values. Report: ${path.relative(root, reportPath)}`);
    process.exit(1);
  }

  const wranglerArgs = ['wrangler', 'pages', 'secret', 'bulk', bulkJsonPath, '--project-name', projectName];
  const result = run('npx', wranglerArgs, { stdio: 'pipe' });

  lines.push('## Apply Result', '');
  lines.push(`- Command: npx ${wranglerArgs.map((part) => (part === bulkJsonPath ? path.relative(root, bulkJsonPath) : part)).join(' ')}`);
  lines.push(`- Exit: ${result.status}`);
  if (result.stdout) {
    lines.push('', '### Wrangler stdout', '', '```text', result.stdout.trim(), '```');
  }
  if (result.stderr) {
    lines.push('', '### Wrangler stderr', '', '```text', result.stderr.trim(), '```');
  }

  fs.writeFileSync(reportPath, lines.join('\n'));

  try {
    fs.rmSync(bulkJsonPath, { force: true });
  } catch {}

  if (cleanup || (fromVault && !existedBefore)) {
    const remove = run('node', ['scripts/env/remove-local-env.mjs'], { stdio: 'pipe' });
    if (remove.status !== 0) {
      console.error('WARNING: Cloudflare sync finished but env cleanup failed.');
      if (remove.stdout) console.error(remove.stdout);
      if (remove.stderr) console.error(remove.stderr);
    }
  }

  if (result.status !== 0) {
    console.error(`Cloudflare env sync failed. Report: ${path.relative(root, reportPath)}`);
    process.exit(result.status || 1);
  }

  console.log(`Cloudflare env sync applied. Report: ${path.relative(root, reportPath)}`);
  process.exit(0);
}

lines.push('## Dry Run Result', '');
lines.push('No values were uploaded. Re-run with --apply to sync to Cloudflare Pages.');
fs.writeFileSync(reportPath, lines.join('\n'));

try {
  fs.rmSync(bulkJsonPath, { force: true });
} catch {}

console.log(`Cloudflare env sync dry run complete. Report: ${path.relative(root, reportPath)}`);
console.log(`Selected values: ${selected.length}`);
console.log(`Missing usable values: ${missing.length}`);
console.log('No secret values printed.');
