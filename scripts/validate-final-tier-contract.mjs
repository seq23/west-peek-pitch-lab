#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredDocs = [
  'TIER_VALIDATION_MODEL.md',
  'MASTER_ADDENDUM_COMPLIANCE_LEDGER.md',
  'RUNTIME_CONTEXT_TRACE_MATRIX.md',
  'REAL_PROVIDER_LANE_MATRIX.md',
  'USER_JOURNEY_TEST_MATRIX.md',
  'TESTING_SEQUENCE.md',
  'LIVE_PROVIDER_EVIDENCE_TEMPLATE.md'
];
const failures = [];
function read(file) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    failures.push(`Missing required final-tier doc: ${file}`);
    return '';
  }
  return fs.readFileSync(p, 'utf8');
}
for (const file of requiredDocs) read(file);
const tierDoc = read('TIER_VALIDATION_MODEL.md');
if (!/Tier 3[\s\S]{0,600}(deployed|postdeploy)[\s\S]{0,600}(real-provider|provider proof|live provider)/i.test(tierDoc)) failures.push('TIER_VALIDATION_MODEL.md must define Tier 3 as deployed + real-provider proof.');
if (/Tier 4[\s\S]{0,200}(validation|proof layer)/i.test(tierDoc) && !/There is no Tier 4/i.test(tierDoc)) failures.push('Tier 4 must not be a validation tier.');
const providerDoc = read('REAL_PROVIDER_LANE_MATRIX.md');
if (!/\| Provider lane \| Provider \| Runtime\/surface/i.test(providerDoc)) failures.push('REAL_PROVIDER_LANE_MATRIX.md must contain the canonical provider lane table.');
if (!/Tier 3/i.test(providerDoc)) failures.push('REAL_PROVIDER_LANE_MATRIX.md must tie provider lanes to Tier 3.');
const journeyDoc = read('USER_JOURNEY_TEST_MATRIX.md');
if (!/\| Persona \| Action/i.test(journeyDoc)) failures.push('USER_JOURNEY_TEST_MATRIX.md must contain the canonical user journey table.');
const testingDoc = read('TESTING_SEQUENCE.md');
if (!/--tier=3/i.test(testingDoc)) failures.push('TESTING_SEQUENCE.md must include a Tier 3 command.');
if (!/explicit deployed/i.test(testingDoc) && !/deployed URL/i.test(testingDoc)) failures.push('TESTING_SEQUENCE.md must require explicit deployed URL/postdeploy target.');
const runtimeDoc = read('RUNTIME_CONTEXT_TRACE_MATRIX.md');
if (!/Playwright self-spawn/i.test(runtimeDoc) || !/Provider dashboard/i.test(runtimeDoc)) failures.push('RUNTIME_CONTEXT_TRACE_MATRIX.md must include self-spawn and provider runtime contexts.');
const matrixPath = path.join(root, '_repo_validation_matrix.json');
if (!fs.existsSync(matrixPath)) failures.push('Missing _repo_validation_matrix.json.');
else {
  const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  const rows = matrix.validation || matrix.entries || [];
  if (!matrix.tierPolicy || !String(matrix.tierPolicy.tier3 || '').match(/provider|deployed|postdeploy/i)) failures.push('_repo_validation_matrix.json must include tierPolicy.tier3 with deployed/provider proof.');
  const finalRows = rows.filter((row) => String(row.tier || '').toLowerCase().includes('3'));
  if (!finalRows.length) failures.push('_repo_validation_matrix.json must include Tier 3 rows.');
  const providerRows = finalRows.filter((row) => `${row.name || ''} ${row.command || ''} ${row.proofLayer || ''} ${row.category || ''}`.match(/provider|live|deployed|postdeploy|handoff|gmail|sheets|streamyard|livekit|llm|voice|media|pitch/i));
  if (!providerRows.length) failures.push('_repo_validation_matrix.json Tier 3 must include provider/deployed proof rows.');
}
const packagePath = path.join(root, 'package.json');
if (!fs.existsSync(packagePath)) failures.push('Missing package.json.');
else {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const scripts = pkg.scripts || {};
  if (!scripts['validate:final-tier-contract']) failures.push('package.json must expose validate:final-tier-contract.');
  if (!scripts['validate:final-tier']) failures.push('package.json must expose validate:final-tier.');
}
if (failures.length) {
  console.error('FINAL TIER CONTRACT VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('FINAL TIER CONTRACT VALIDATION OK — Tier 3 is final deployed + real-provider gate; no Tier 4 validation layer.');
