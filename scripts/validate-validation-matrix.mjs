#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const matrixPath = path.join(root, '_repo_validation_matrix.json');
const packagePath = path.join(root, 'package.json');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { failures.push(`Invalid JSON: ${path.relative(root, file)} (${error.message})`); return null; }
}

const matrix = readJson(matrixPath);
const pkg = readJson(packagePath);

if (matrix && pkg) {
  if (!matrix.policy?.matrixIsAdmissionAuthority) failures.push('Matrix policy must declare matrixIsAdmissionAuthority=true.');
  if (!matrix.policy?.hardFailOnlyForRealProductionRisk) failures.push('Matrix policy must declare hardFailOnlyForRealProductionRisk=true.');
  if (!Array.isArray(matrix.entries) || matrix.entries.length === 0) failures.push('Matrix has no entries.');

  const entriesByScript = new Map((matrix.entries || []).map((entry) => [entry.script, entry]));
  const scripts = pkg.scripts || {};
  const proofScriptNames = Object.keys(scripts).filter((name) =>
    name === 'build' ||
    name === 'test:domain' ||
    name.startsWith('validate:') ||
    name.startsWith('smoke:') ||
    name.startsWith('env:create') ||
    name.startsWith('env:local') ||
    name.startsWith('env:cloudflare')
  );

  for (const script of proofScriptNames) {
    if (!entriesByScript.has(script)) failures.push(`Package proof script is not admitted to matrix: ${script}`);
  }

  for (const entry of matrix.entries || []) {
    for (const field of ['script', 'command', 'category', 'severity', 'productionRisk', 'proves', 'doesNotProve', 'failureHandling']) {
      if (!entry[field]) failures.push(`Matrix entry ${entry.script || '<unknown>'} missing required field: ${field}`);
    }
    if (entry.severity?.includes('HARD_FAIL') && String(entry.productionRisk || '').length < 20) {
      failures.push(`Hard-fail entry lacks clear production risk: ${entry.script}`);
    }
    if (entry.severity === 'WARNING' && (matrix.validateAllHardFailCommands || []).includes(entry.script)) {
      failures.push(`WARNING script cannot be in validateAllHardFailCommands: ${entry.script}`);
    }
  }

  const validateAll = scripts['validate:all'] || '';
  for (const required of matrix.validateAllHardFailCommands || []) {
    if (!validateAll.includes(`npm run ${required}`) && required !== 'build' && required !== 'test:domain') {
      failures.push(`validate:all missing admitted hard-fail command: ${required}`);
    }
    if ((required === 'build' || required === 'test:domain') && !validateAll.includes(`npm run ${required}`)) {
      failures.push(`validate:all missing admitted hard-fail command: ${required}`);
    }
  }

  for (const warningOnly of matrix.warningOnlyCommands || []) {
    if (validateAll.includes(`npm run ${warningOnly}`)) failures.push(`Warning-only command must not hard-fail validate:all: ${warningOnly}`);
  }

  if (validateAll.includes('smoke:visual')) failures.push('Visual smoke is a strong warning in this environment and must not be in validate:all.');
}

if (failures.length) {
  console.error('VALIDATION MATRIX VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('VALIDATION MATRIX VALIDATION PASSED');
console.log(`Admitted matrix entries: ${matrix.entries.length}`);
