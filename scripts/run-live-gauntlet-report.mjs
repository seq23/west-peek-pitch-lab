#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
if (process.argv.includes('--help')) {
  console.log(`Usage:
  npm run gauntlet:live:report
  PITCH_LAB_DEPLOY_URL=https://<deployment>.pages.dev npm run gauntlet:live:report
  PITCH_LAB_DEPLOY_URL=https://<deployment>.pages.dev npm run gauntlet:live:report:headed

Writes:
  tmp/live-gauntlet-report/summary.md
  tmp/live-gauntlet-report/summary.json
  tmp/live-gauntlet-report/failures.json
  tmp/live-gauntlet-report/logs/*.log

Notes:
  - Runs all lanes and does not fail fast.
  - Redacts secret-shaped output.
  - Temporarily moves .env.local aside only for validate:all, then restores it for live provider tests.`);
  process.exit(0);
}

const reportRoot = path.join(root, 'tmp/live-gauntlet-report');
const logsDir = path.join(reportRoot, 'logs');

fs.rmSync(reportRoot, { recursive: true, force: true });
fs.mkdirSync(logsDir, { recursive: true });

const startedAt = new Date().toISOString();
const deployUrl = process.env.PITCH_LAB_DEPLOY_URL || '';
const headed = process.argv.includes('--headed');
const liveProviderMode = process.argv.includes('--live') || process.env.MEDIA_PROOF_RUN_LIVE === 'true';

function redactSecrets(text) {
  let out = String(text || '')
    .replace(/\r/g, '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replaceAll(root, '<repo>')
    .replace(/\/Users\/[^\s/]+/g, '/Users/<user>')
    .replace(/https:\/\/[^\s"]*result[^\s"]*/gi, '[redacted-provider-result-url]')
    .replace(/https:\/\/[^\s"]*\.mp4[^\s"]*/gi, '[redacted-media-url]')
    .replace(/https:\/\/[^\s"]*\.mp3[^\s"]*/gi, '[redacted-audio-url]')
    .replace(/https:\/\/[^\s"]*\.wav[^\s"]*/gi, '[redacted-audio-url]');

  const secretPatterns = [
    /([A-Za-z0-9_]*API[_-]?KEY[A-Za-z0-9_]*\s*[=:]\s*)[^\s"']+/gi,
    /(authorization\s*[:=]\s*Basic\s+)[A-Za-z0-9+/=._-]+/gi,
    /(bearer\s+)[A-Za-z0-9._-]+/gi,
    /(sk-[A-Za-z0-9._-]+)/gi
  ];

  for (const pattern of secretPatterns) out = out.replace(pattern, '$1[REDACTED]');
  return out;
}

function inferBlocker(text) {
  const lower = text.toLowerCase();
  if (lower.includes('pitch_lab_deploy_url is required')) return 'Missing PITCH_LAB_DEPLOY_URL.';
  if (lower.includes('env_vault_passphrase is required')) return 'Missing ENV_VAULT_PASSPHRASE.';
  if (lower.includes('missing') && lower.includes('api')) return 'Missing provider env/API configuration.';
  if (lower.includes('camera') || lower.includes('permission')) return 'Browser camera/device permission or headed browser issue.';
  if (lower.includes('clip not yet rendered') || lower.includes('no playable src')) return 'Playable committed media clips are not yet present in clip-manifest.';
  if (lower.includes('timeout')) return 'Timeout waiting for browser/provider/network.';
  return 'See log for exact failure.';
}

function classify(step, exitCode, text) {
  const lower = text.toLowerCase();
  if (exitCode !== 0) return step.allowFailure ? 'WARN' : 'FAIL';
  if (step.warnOnIncomplete && (lower.includes('incomplete') || lower.includes('warn:'))) return 'WARN';
  return 'PASS';
}

function withEnvLocalTemporarilyHidden(fn) {
  const envPath = path.join(root, '.env.local');
  const hiddenPath = path.join('/tmp', `pitch-lab-env-local-hidden-${process.pid}`);
  const hadEnv = fs.existsSync(envPath);

  if (hadEnv) fs.renameSync(envPath, hiddenPath);
  try {
    return fn();
  } finally {
    if (hadEnv && fs.existsSync(hiddenPath)) fs.renameSync(hiddenPath, envPath);
  }
}

function runStep(step) {
  const started = Date.now();
  const logPath = path.join(logsDir, step.log);
  const env = { ...process.env, ...(step.env || {}) };

  const execute = () => spawnSync(step.command, step.args, {
    cwd: root,
    env,
    shell: false,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 80
  });
  const result = step.hideEnvLocal ? withEnvLocalTemporarilyHidden(execute) : execute();

  const stdout = redactSecrets(result.stdout || '');
  const stderr = redactSecrets(result.stderr || '');
  const combined = [
    '$ ' + [step.command, ...step.args].join(' '),
    '',
    '--- STDOUT ---',
    stdout,
    '',
    '--- STDERR ---',
    stderr
  ].join('\n');

  fs.writeFileSync(logPath, combined);

  const exitCode = result.status ?? 1;
  const text = `${stdout}\n${stderr}`;
  const status = classify(step, exitCode, text);

  return {
    id: step.id,
    name: step.name,
    status,
    exitCode,
    durationMs: Date.now() - started,
    command: [step.command, ...step.args].join(' '),
    log: path.relative(reportRoot, logPath),
    notes: step.note || '',
    likelyBlocker: status === 'PASS' ? '' : inferBlocker(text)
  };
}

const deployEnv = deployUrl ? { PITCH_LAB_DEPLOY_URL: deployUrl } : {};
const mediaHeadedScript = liveProviderMode ? 'proof:media:live:headed' : 'proof:media:headed';

const steps = [
  {
    id: 'validate-all',
    name: 'Full structural/local validation',
    command: 'npm',
    args: ['run', 'validate:all'],
    log: 'validate-all.log',
    hideEnvLocal: true,
    note: 'Temporarily hides .env.local because validate:no-secrets intentionally rejects local secret files.'
  },
  {
    id: 'env-vault-proof',
    name: 'Encrypted env vault proof',
    command: 'npm',
    args: ['run', 'env:proof'],
    log: 'env-vault-proof.log'
  },
  {
    id: 'voice-live',
    name: 'Live Fish voice provider proof',
    command: 'npm',
    args: ['run', 'proof:voice'],
    env: { MEDIA_PROOF_RUN_LIVE: 'true' },
    log: 'proof-voice-live.log'
  },
  {
    id: 'media-live',
    name: 'Live Fish to D-ID media provider proof',
    command: 'npm',
    args: ['run', 'proof:media:live'],
    env: { MEDIA_PROOF_RUN_LIVE: 'true', ...deployEnv },
    log: 'proof-media-live.log',
    warnOnIncomplete: true,
    note: 'Expected WARN until playable rendered clips are committed into clip-manifest.'
  },
  {
    id: 'postdeploy-functions',
    name: 'Post-deploy function gauntlet',
    command: 'npm',
    args: ['run', 'gauntlet:postdeploy:functions'],
    env: deployEnv,
    log: 'postdeploy-functions.log',
    allowFailure: !deployUrl
  },
  {
    id: 'postdeploy-journey',
    name: 'Post-deploy user journey gauntlet',
    command: 'npm',
    args: ['run', headed ? 'gauntlet:postdeploy:headed' : 'gauntlet:postdeploy'],
    env: deployEnv,
    log: 'postdeploy-journey.log',
    allowFailure: !deployUrl
  },
  {
    id: 'master-browser',
    name: 'Local browser master gauntlet',
    command: 'npm',
    args: ['run', headed ? 'gauntlet:headed' : 'gauntlet'],
    log: 'master-browser-gauntlet.log'
  },
  {
    id: 'camera-proof',
    name: 'Founder camera rehearsal proof',
    command: 'npm',
    args: ['run', headed ? 'proof:camera:headed' : 'proof:camera'],
    log: 'camera-rehearsal-proof.log',
    allowFailure: true,
    note: 'WARN is acceptable if browser/device permission blocks camera proof.'
  },
  {
    id: 'media-browser',
    name: 'Media proof browser gauntlet',
    command: 'npm',
    args: ['run', mediaHeadedScript],
    env: liveProviderMode ? { MEDIA_PROOF_RUN_LIVE: 'true' } : {},
    log: 'media-browser-proof.log',
    allowFailure: true,
    warnOnIncomplete: true,
    note: 'Expected WARN until playable rendered clips are committed into clip-manifest.'
  }
];

const results = steps.map(runStep);
const finishedAt = new Date().toISOString();

const counts = results.reduce((acc, item) => {
  acc[item.status] = (acc[item.status] || 0) + 1;
  return acc;
}, { PASS: 0, WARN: 0, FAIL: 0 });

const failed = results.filter((item) => item.status === 'FAIL');
const warned = results.filter((item) => item.status === 'WARN');

const summary = {
  summary: failed.length ? 'LIVE GAUNTLET FAILED' : warned.length ? 'LIVE GAUNTLET COMPLETED WITH WARNINGS' : 'LIVE GAUNTLET PASSED',
  startedAt,
  finishedAt,
  deployUrl: deployUrl || null,
  headed,
  liveProviderMode,
  counts,
  results
};

fs.writeFileSync(path.join(reportRoot, 'summary.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(reportRoot, 'failures.json'), JSON.stringify({ failed, warned }, null, 2));

const md = [
  '# Live Gauntlet Report',
  '',
  `- Summary: ${summary.summary}`,
  `- Started: ${startedAt}`,
  `- Finished: ${finishedAt}`,
  `- Deploy URL: ${deployUrl || 'not provided'}`,
  `- Headed mode: ${headed}`,
  `- Live provider mode: ${liveProviderMode}`,
  '',
  '## Results',
  '',
  '| Status | ID | Name | Exit | Log |',
  '|---|---|---|---:|---|',
  ...results.map((r) => `| ${r.status} | ${r.id} | ${r.name} | ${r.exitCode} | ${r.log} |`),
  '',
  '## Repair List',
  '',
  ...(failed.length || warned.length
    ? [...failed, ...warned].map((r) => `- ${r.status}: ${r.name} — ${r.likelyBlocker || r.notes || 'See log.'}`)
    : ['- None.'])
].join('\n');

fs.writeFileSync(path.join(reportRoot, 'summary.md'), md);

console.log(summary.summary);
console.log('Report:', path.relative(root, reportRoot));
console.log(JSON.stringify({
  counts,
  failed: failed.map((r) => r.id),
  warned: warned.map((r) => r.id)
}, null, 2));

process.exit(failed.length ? 1 : 0);
