#!/usr/bin/env node
// Zero-item guard.
//
// A validator that PASSES while examining zero items is not passing; it is
// reporting an opinion about an empty set. On 2026-09-06 five validators in
// this repo did exactly that when this repo's CI first ran:
//
//   check-no-plaintext-secrets   -> "PASSED" over 0 scanned files
//   validate-no-theater          -> "PASSED" and printed "Scanned files: 0"
//   validate-baseline-packaging  -> "PASS" with required_checked: 0
//   validate-env-contract        -> "PASSED" and printed "Registered env vars: 0"
//   route-smoke                  -> "PASSED" with "Checked routes: 0"
//
// Each was given a hard-fail on an empty input set. This guard keeps the
// negative proof executable: it rebuilds the empty-input state for each one in
// a throwaway fixture and requires the failure to come back. If someone removes
// a guard, this goes red instead of the repo silently returning to green-on-nothing.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vaultEnvelope = JSON.stringify({
  format: 'west-peek-env-vault-v1', algorithm: 'aes-256-gcm', kdf: 'scrypt',
  salt: 'x', iv: 'x', authTag: 'x', ciphertext: 'x'
});
const gitignore = ['.env', '.env.*', '!secrets/*.env.vault.enc', 'secrets/*.env.vault.json', '.env.vault.key'].join('\n');

function write(dir, rel, contents) {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}

const cases = [
  {
    name: 'check-no-plaintext-secrets',
    emptiness: 'a source tree containing zero scannable files',
    expect: /examined ZERO scannable files/,
    script: 'scripts/check-no-plaintext-secrets.mjs',
    build: () => {}
  },
  {
    name: 'validate-no-theater',
    emptiness: 'no src/, functions/ or tests/ directories to scan',
    expect: /examined ZERO source files/,
    script: 'scripts/validate-no-theater.mjs',
    build: (dir) => {
      for (const doc of ['docs/NO_THEATER_IMPLEMENTATION_GATES.md', 'docs/PLAYWRIGHT_MASTER_GAUNTLET_PLAN.md', 'docs/VALIDATION_SIMPLIFICATION_MATRIX.md']) write(dir, doc, '# fixture\n');
    }
  },
  {
    name: 'validate-baseline-packaging-contract',
    emptiness: 'a packaging contract declaring zero required_root_files',
    expect: /ZERO required_root_files/,
    script: 'scripts/validate-baseline-packaging-contract.mjs',
    build: (dir) => write(dir, '_baseline_packaging_contract.json', JSON.stringify({ repo_name: 'fixture', required_root_files: [], forbidden_paths_or_globs: [] }))
  },
  {
    name: 'validate-env-contract',
    emptiness: 'an env registry declaring zero variables',
    expect: /declares ZERO variables/,
    script: 'scripts/validate-env-contract.mjs',
    build: (dir) => {
      write(dir, 'config/env.registry.json', JSON.stringify({ variables: [] }));
      write(dir, '.env.example', '');
      write(dir, '.env.local.example', '');
      write(dir, '.gitignore', gitignore);
      write(dir, 'secrets/pitch-lab.env.vault.enc', vaultEnvelope);
    }
  },
  {
    name: 'route-smoke',
    emptiness: 'a PHASE_2_ROUTES export containing zero routes',
    expect: /PHASE_2_ROUTES is empty/,
    // route-smoke imports ../src/runtime/phase2Routes.mjs relative to its own
    // location, so the real script is copied beside a stubbed empty export.
    script: 'scripts/route-smoke.mjs',
    copyScript: true,
    build: (dir) => {
      write(dir, 'src/runtime/phase2Routes.mjs', 'export const PHASE_2_ROUTES = [];\n');
      write(dir, 'dist/index.html', '<!doctype html><title>fixture</title>');
    }
  }
];

const failures = [];
let examined = 0;

for (const testCase of cases) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'zero-item-'));
  try {
    testCase.build(fixture);
    let scriptPath = path.join(repoRoot, testCase.script);
    if (testCase.copyScript) {
      const target = path.join(fixture, testCase.script);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(scriptPath, target);
      scriptPath = target;
    }
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: fixture, encoding: 'utf8', env: { ...process.env, SMOKE_PORT: '4399' }
    });
    examined += 1;
    const output = `${result.stdout || ''}${result.stderr || ''}`;
    if (result.status === 0) {
      failures.push(`${testCase.name}: PASSED (exit 0) while examining ${testCase.emptiness} — a validator that passes having checked nothing is not passing`);
    } else if (!testCase.expect.test(output)) {
      failures.push(`${testCase.name}: failed, but not with its named zero-item reason (expected ${testCase.expect}); got: ${output.trim().split('\n').slice(-2).join(' | ')}`);
    }
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

// Rule 0 applies to this guard too.
if (examined === 0) {
  console.error('ZERO-ITEM GUARD FAILED');
  console.error('- examined ZERO validators; the guard itself ran empty');
  process.exit(1);
}

if (failures.length) {
  console.error('ZERO-ITEM GUARD FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('ZERO-ITEM GUARD PASSED');
console.log(`Validators proven to hard-fail on an empty input set: ${examined}`);
