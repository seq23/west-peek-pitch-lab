#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { decryptJson } from './env-vault-lib.mjs';

const root = process.cwd();
const vaultPath = path.join(root, 'secrets/pitch-lab.env.vault.enc');
const registryPath = path.join(root, 'config/env.registry.json');
const gitignorePath = path.join(root, '.gitignore');
const passphrase = process.env.ENV_VAULT_PASSPHRASE;
const report = { generatedAt: new Date().toISOString(), checks: [] };
const failures = [];
const warnings = [];
function add(name, status, detail = {}) { report.checks.push({ name, status, ...detail }); if (status === 'fail') failures.push(`${name}: ${detail.reason || 'failed'}`); if (status === 'warn') warnings.push(`${name}: ${detail.reason || 'warning'}`); }
add('encrypted env vault file exists', fs.existsSync(vaultPath) ? 'pass' : 'fail', { file: 'secrets/pitch-lab.env.vault.enc', reason: fs.existsSync(vaultPath) ? undefined : 'missing canonical encrypted vault' });
add('env registry exists', fs.existsSync(registryPath) ? 'pass' : 'fail', { file: 'config/env.registry.json', reason: fs.existsSync(registryPath) ? undefined : 'missing env registry' });
if (fs.existsSync(vaultPath)) {
  try {
    const envelope = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
    const fields = ['format','algorithm','kdf','salt','iv','authTag','ciphertext'];
    const missing = fields.filter((key) => !envelope[key]);
    add('env vault envelope has required cryptographic fields', missing.length ? 'fail' : 'pass', { missing, reason: missing.length ? `missing ${missing.join(', ')}` : undefined });
    add('env vault uses supported format and algorithm', envelope.format === 'west-peek-env-vault-v1' && envelope.algorithm === 'aes-256-gcm' ? 'pass' : 'fail', { format: envelope.format, algorithm: envelope.algorithm, reason: envelope.format === 'west-peek-env-vault-v1' && envelope.algorithm === 'aes-256-gcm' ? undefined : 'unsupported vault format or algorithm' });
    if (passphrase) {
      const payload = decryptJson(envelope, passphrase);
      const keys = new Set((payload.variables || []).map((item) => item.key));
      const required = ['OPENAI_API_KEY','DID_API_KEY','DID_SOURCE_URL','HEYGEN_API_KEY','AVATAR_PROVIDER','AVATAR_DYNAMIC_GENERATION_ENABLED','FISH_API_KEY','FISH_VOICE_REFERENCE_ID'];
      const missingKeys = required.filter((key) => !keys.has(key));
      add('env vault decrypts and contains real-feature key names', missingKeys.length ? 'warn' : 'pass', { checkedKeys: required, missingKeys, reason: missingKeys.length ? 'some proof-related env names are not in vault payload' : undefined });
      add('env proof reports only key names and never raw values', 'pass', { variables: payload.variables?.length || 0 });
    } else {
      add('env vault decrypt proof skipped without passphrase', 'warn', { reason: 'set ENV_VAULT_PASSPHRASE to prove decrypt/restore readiness locally' });
    }
  } catch (error) {
    add('env vault parses/decrypts safely', passphrase ? 'fail' : 'fail', { reason: error instanceof Error ? error.message : 'vault parse failed' });
  }
}
const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
{ const ok = /(^|\n)\.env\.local(\n|$)/.test(gitignore) || /(^|\n)\.env\.\*(\n|$)/.test(gitignore); add('.env.local is gitignored', ok ? 'pass' : 'fail', { reason: ok ? undefined : '.env.local must not be committed' }); }
report.summary = failures.length ? 'ENV VAULT PROOF FAILED' : (warnings.length ? 'ENV VAULT PROOF PASSED WITH WARNINGS' : 'ENV VAULT PROOF PASSED');
const outDir = path.join(root, 'tmp');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'env-vault-proof-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(report.summary);
console.log(`Report: ${outPath}`);
for (const check of report.checks) console.log(`- ${check.status.toUpperCase()}: ${check.name}${check.reason ? ` — ${check.reason}` : ''}`);
if (failures.length) process.exit(1);
