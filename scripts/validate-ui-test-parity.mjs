import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contract = JSON.parse(fs.readFileSync(path.join(root, '_ui_test_parity_contract.json'), 'utf8'));
const excluded = new Set(['node_modules', '.git', 'dist', 'build', 'out', 'coverage', 'artifacts', 'test-results', 'playwright-report']);
const extensions = /\.(ts|tsx|js|jsx|mjs|cjs|md|json)$/;

function collect(relativeRoots = []) {
  const files = [];
  function walk(target) {
    if (!fs.existsSync(target)) return;
    const stat = fs.statSync(target);
    if (stat.isFile()) { if (extensions.test(target)) files.push(target); return; }
    for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
      if (excluded.has(entry.name) || entry.name === '_ui_test_parity_contract.json') continue;
      const next = path.join(target, entry.name);
      if (entry.isDirectory()) walk(next);
      else if (extensions.test(entry.name)) files.push(next);
    }
  }
  for (const relative of relativeRoots) walk(path.join(root, relative));
  return files;
}

function corpus(files) {
  return files.map((file) => { try { return fs.readFileSync(file, 'utf8'); } catch { return ''; } }).join('\n');
}

const requiredFiles = collect(contract.required_scan_roots || ['src', 'tests/e2e']);
const forbiddenFiles = collect(contract.forbidden_scan_roots || ['src']);
const requiredCorpus = corpus(requiredFiles);
const forbiddenCorpus = corpus(forbiddenFiles);
const failures = [];
for (const value of contract.forbidden_stale_strings || []) {
  if (forbiddenCorpus.includes(value)) failures.push(`stale active UI string still present: ${value}`);
}
for (const value of contract.required_current_strings || []) {
  if (!requiredCorpus.includes(value)) failures.push(`required current UI/test string missing: ${value}`);
}
if (failures.length) {
  console.error(`UI/TEST PARITY: FAIL\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`UI/TEST PARITY: PASS (${requiredFiles.length} required-scope files; ${forbiddenFiles.length} active-UI files)`);
