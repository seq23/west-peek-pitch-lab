#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const headed = args.has('--headed');
const includeLive = args.has('--live') || process.env.PITCH_LAB_RUN_LIVE_PROOFS === 'true';
const includePostdeploy = args.has('--postdeploy') || Boolean(process.env.PITCH_LAB_DEPLOY_URL);
const installBrowsers = args.has('--install-browsers');
const reportRoot = path.join(root, 'tmp', 'test-operations');
const logsDir = path.join(reportRoot, 'logs');

fs.rmSync(reportRoot, { recursive: true, force: true });
fs.mkdirSync(logsDir, { recursive: true });

const startedAt = new Date().toISOString();
const deployUrl = process.env.PITCH_LAB_DEPLOY_URL || '';
const results = [];

function redact(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replaceAll(root, '<repo>')
    .replace(/\/Users\/[^\s/]+/g, '/Users/<user>')
    .replace(/(authorization\s*[:=]\s*Basic\s+)[A-Za-z0-9+/=._-]+/gi, '$1[REDACTED]')
    .replace(/(bearer\s+)[A-Za-z0-9._-]+/gi, '$1[REDACTED]')
    .replace(/(sk-[A-Za-z0-9._-]+)/gi, '[REDACTED_OPENAI_KEY]')
    .replace(/([A-Z0-9_]*(?:API|TOKEN|SECRET|KEY|PASSWORD)[A-Z0-9_]*\s*[=:]\s*)[^\s"']+/gi, '$1[REDACTED]')
    .replace(/https:\/\/[^\s"]*\.mp4[^\s"]*/gi, '[redacted-media-url]')
    .replace(/https:\/\/[^\s"]*\.mp3[^\s"]*/gi, '[redacted-audio-url]')
    .replace(/https:\/\/[^\s"]*\.wav[^\s"]*/gi, '[redacted-audio-url]');
}

function removeLocalEnv() {
  const envPath = path.join(root, '.env.local');
  if (fs.existsSync(envPath)) fs.rmSync(envPath, { force: true });
}

function browserInstalled() {
  try {
    return fs.existsSync(chromium.executablePath());
  } catch {
    return false;
  }
}

function inferLikelyFix(step, output, status) {
  const lower = output.toLowerCase();
  if (status === 'UNPROVEN') return step.skipReason || 'Required input or runtime context was not available.';
  if (lower.includes('executable doesn\'t exist') || lower.includes('missing chromium') || lower.includes('browser preflight')) return 'Run: npx playwright install chromium';
  if (lower.includes('env_vault_passphrase') || lower.includes('vault')) return 'Set ENV_VAULT_PASSPHRASE and verify env vault access.';
  if (lower.includes('pitch_lab_deploy_url') || lower.includes('deploy url')) return 'Set PITCH_LAB_DEPLOY_URL=https://<deployed-url> for postdeploy/deployed browser proof.';
  if (lower.includes('api key') || lower.includes('provider') || lower.includes('missing required')) return 'Restore local env from vault and verify provider keys are configured.';
  if (lower.includes('timeout')) return 'Inspect Playwright trace/log; likely browser/provider/network timeout.';
  return step.failureHint || 'Open the referenced log and fix the first real failure.';
}

function runStep(step) {
  const started = Date.now();
  const logPath = path.join(logsDir, `${step.id}.log`);

  if (step.skip) {
    const item = {
      tier: step.tier,
      id: step.id,
      name: step.name,
      command: step.commandLine || '',
      status: 'UNPROVEN',
      exitCode: null,
      durationMs: 0,
      log: '',
      likelyFix: inferLikelyFix(step, '', 'UNPROVEN'),
      proves: step.proves,
      doesNotProve: step.doesNotProve
    };
    results.push(item);
    console.log(`UNPROVEN ${step.id} — ${item.likelyFix}`);
    return item;
  }

  if (step.removeEnvBefore) removeLocalEnv();

  const env = { ...process.env, ...(step.env || {}) };
  const result = spawnSync(step.command, step.args, {
    cwd: root,
    env,
    shell: false,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 80
  });

  if (step.removeEnvAfter) removeLocalEnv();

  const stdout = redact(result.stdout || '');
  const stderr = redact(result.stderr || '');
  const combined = [
    `$ ${[step.command, ...step.args].join(' ')}`,
    '',
    '--- STDOUT ---',
    stdout,
    '',
    '--- STDERR ---',
    stderr
  ].join('\n');
  fs.writeFileSync(logPath, combined);

  const exitCode = result.status ?? 1;
  const rawStatus = exitCode === 0 ? 'PASS' : (step.warnOnFailure ? 'WARN' : 'FAIL');
  const item = {
    tier: step.tier,
    id: step.id,
    name: step.name,
    command: [step.command, ...step.args].join(' '),
    status: rawStatus,
    exitCode,
    durationMs: Date.now() - started,
    log: path.relative(reportRoot, logPath),
    likelyFix: rawStatus === 'PASS' ? '' : inferLikelyFix(step, `${stdout}\n${stderr}`, rawStatus),
    proves: step.proves,
    doesNotProve: step.doesNotProve
  };
  results.push(item);
  console.log(`${item.status} ${step.id}`);
  return item;
}

const browserReady = browserInstalled();
const shouldSkipBrowser = !browserReady && !installBrowsers;
const liveEnvRequested = includeLive;
const postdeployRequested = includePostdeploy;

const steps = [
  {
    tier: 'TIER 1 — ZIP DELIVERY / STATIC CONTRACTS',
    id: 'static-validate-all',
    name: 'Full static, domain, matrix, build, route, no-secret, no-theater validation',
    command: 'npm',
    args: ['run', 'validate:all'],
    removeEnvBefore: true,
    removeEnvAfter: true,
    proves: 'Repo contracts, build, source validation, route smoke, matrix validation, no plaintext secrets, domain tests, e2e data trace.',
    doesNotProve: 'Real browser behavior, provider success, deployed runtime, visual quality.'
  },
  ...(installBrowsers ? [{
    tier: 'TIER 2 — LOCAL BROWSER PREREQUISITE',
    id: 'install-playwright-chromium',
    name: 'Install Playwright Chromium',
    command: 'npx',
    args: ['playwright', 'install', 'chromium'],
    proves: 'Local machine has Playwright Chromium installed or install completed.',
    doesNotProve: 'Any product journey.'
  }] : []),
  {
    tier: 'TIER 2 — LOCAL AUTOMATED BROWSER VALIDATION',
    id: 'master-gauntlet',
    name: 'Full local Playwright master gauntlet',
    command: 'npm',
    args: ['run', headed ? 'gauntlet:headed' : 'gauntlet'],
    skip: shouldSkipBrowser,
    skipReason: 'Chromium is not installed. Run with --install-browsers or run: npx playwright install chromium',
    proves: 'Local browser journeys, navigation, forms, persistence-visible behavior, consent boundaries, core app flows.',
    doesNotProve: 'Live provider success, deployed runtime, human visual approval.'
  },
  {
    tier: 'TIER 2 — LOCAL AUTOMATED BROWSER VALIDATION',
    id: 'real-journey-proof',
    name: 'Real journey proof runner',
    command: 'npm',
    args: ['run', headed ? 'proof:journey:headed' : 'proof:journey'],
    skip: shouldSkipBrowser,
    skipReason: 'Chromium is not installed. Run with --install-browsers or run: npx playwright install chromium',
    proves: 'Critical founder journey proof beyond static contract checks.',
    doesNotProve: 'Live providers or deployed runtime unless the runner explicitly reaches deployed services.'
  },
  {
    tier: 'TIER 2 — LOCAL AUTOMATED BROWSER VALIDATION',
    id: 'camera-proof',
    name: 'Founder camera rehearsal proof',
    command: 'npm',
    args: ['run', headed ? 'proof:camera:headed' : 'proof:camera'],
    skip: shouldSkipBrowser,
    skipReason: 'Chromium is not installed. Run with --install-browsers or run: npx playwright install chromium',
    warnOnFailure: true,
    proves: 'Camera/rehearsal fallback behavior where local browser/device permissions allow it.',
    doesNotProve: 'User camera hardware quality or subjective recording quality.'
  },
  {
    tier: 'TIER 3 — LIVE PROVIDER VALIDATION',
    id: 'env-vault-proof',
    name: 'Env vault proof',
    command: 'npm',
    args: ['run', 'env:proof'],
    skip: !liveEnvRequested,
    skipReason: 'Live provider mode not requested. Run: npm run validate:everything:live',
    proves: 'Encrypted env vault can be read without printing secrets.',
    doesNotProve: 'Provider APIs work.'
  },
  {
    tier: 'TIER 3 — LIVE PROVIDER VALIDATION',
    id: 'env-restore',
    name: 'Restore .env.local from vault for live provider proofs',
    command: 'npm',
    args: ['run', 'env:restore:force'],
    skip: !liveEnvRequested,
    skipReason: 'Live provider mode not requested. Run: npm run validate:everything:live',
    proves: 'Local provider env can be restored from vault on this machine.',
    doesNotProve: 'Provider APIs work.'
  },
  {
    tier: 'TIER 3 — LIVE PROVIDER VALIDATION',
    id: 'llm-live-provider',
    name: 'Live LLM provider proof',
    command: 'npm',
    args: ['run', 'proof:llm:live'],
    skip: !liveEnvRequested,
    skipReason: 'Live provider mode not requested. Run: npm run validate:everything:live',
    env: { PITCH_LAB_LIVE_LLM_PROOF: 'true' },
    proves: 'AI Scooter can generate a real provider-backed story card response.',
    doesNotProve: 'Browser rendering or deployed route unless paired with browser proof.'
  },
  {
    tier: 'TIER 3 — LIVE PROVIDER VALIDATION',
    id: 'voice-live-provider',
    name: 'Live voice provider proof',
    command: 'npm',
    args: ['run', 'proof:voice:live'],
    skip: !liveEnvRequested,
    skipReason: 'Live provider mode not requested. Run: npm run validate:everything:live',
    env: { MEDIA_PROOF_RUN_LIVE: 'true' },
    proves: 'Configured live voice provider can return playable-sized audio payload.',
    doesNotProve: 'Human approval of voice quality.'
  },
  {
    tier: 'TIER 3 — LIVE PROVIDER VALIDATION',
    id: 'media-live-provider',
    name: 'Live media/avatar provider proof',
    command: 'npm',
    args: ['run', 'proof:media:live'],
    skip: !liveEnvRequested,
    skipReason: 'Live provider mode not requested. Run: npm run validate:everything:live',
    env: { MEDIA_PROOF_RUN_LIVE: 'true' },
    proves: 'Configured live media/avatar provider path responds honestly and can prove provider availability where configured.',
    doesNotProve: 'Human approval of avatar/video quality.'
  },
  {
    tier: 'TIER 3 — LIVE DEPLOYED VALIDATION',
    id: 'llm-live-browser-deployed',
    name: 'Live deployed browser LLM response E2E',
    command: 'npm',
    args: ['run', 'proof:llm:live:browser'],
    skip: !liveEnvRequested || !postdeployRequested,
    skipReason: !liveEnvRequested ? 'Live provider mode not requested. Run: npm run validate:everything:live' : 'PITCH_LAB_DEPLOY_URL is not set.',
    env: { PITCH_LAB_LIVE_LLM_E2E: 'true', PITCH_LAB_DEPLOY_URL: deployUrl, PLAYWRIGHT_SKIP_WEBSERVER: 'true' },
    proves: 'Deployed browser can trigger live LLM route and render AI Scooter response.',
    doesNotProve: 'Voice/avatar providers or human approval.'
  },
  {
    tier: 'TIER 3 — LIVE DEPLOYED VALIDATION',
    id: 'postdeploy-functions',
    name: 'Postdeploy function gauntlet',
    command: 'npm',
    args: ['run', 'gauntlet:postdeploy:functions'],
    skip: !postdeployRequested,
    skipReason: 'PITCH_LAB_DEPLOY_URL is not set.',
    env: { PITCH_LAB_DEPLOY_URL: deployUrl },
    proves: 'Deployment function endpoints behave as expected against explicit deployed URL.',
    doesNotProve: 'Full browser journey unless paired with postdeploy journey gauntlet.'
  },
  {
    tier: 'TIER 3 — LIVE DEPLOYED VALIDATION',
    id: 'postdeploy-journey',
    name: 'Postdeploy browser journey gauntlet',
    command: 'npm',
    args: ['run', headed ? 'gauntlet:postdeploy:headed' : 'gauntlet:postdeploy'],
    skip: !postdeployRequested,
    skipReason: 'PITCH_LAB_DEPLOY_URL is not set.',
    env: { PITCH_LAB_DEPLOY_URL: deployUrl },
    proves: 'Deployed browser journeys against explicit deployed URL.',
    doesNotProve: 'Human visual approval or provider subjective quality.'
  }
];

try {
  for (const step of steps) runStep(step);
} finally {
  removeLocalEnv();
}

const finishedAt = new Date().toISOString();
const counts = results.reduce((acc, item) => {
  acc[item.status] = (acc[item.status] || 0) + 1;
  return acc;
}, { PASS: 0, WARN: 0, FAIL: 0, UNPROVEN: 0 });

const failed = results.filter((r) => r.status === 'FAIL');
const warned = results.filter((r) => r.status === 'WARN');
const unproven = results.filter((r) => r.status === 'UNPROVEN');
const finalStatus = failed.length ? 'FAILED' : warned.length ? 'PASSED_WITH_WARNINGS' : unproven.length ? 'PASSED_WITH_UNPROVEN_LAYERS' : 'PASSED';

const report = {
  summary: finalStatus,
  startedAt,
  finishedAt,
  headed,
  includeLive,
  includePostdeploy,
  deployUrl: deployUrl || null,
  counts,
  results
};
fs.writeFileSync(path.join(reportRoot, 'summary.json'), JSON.stringify(report, null, 2));

const grouped = new Map();
for (const item of results) {
  if (!grouped.has(item.tier)) grouped.set(item.tier, []);
  grouped.get(item.tier).push(item);
}
const md = [
  '# West Peek Pitch Lab Test Operations Report',
  '',
  `- Summary: ${finalStatus}`,
  `- Started: ${startedAt}`,
  `- Finished: ${finishedAt}`,
  `- Headed: ${headed}`,
  `- Live provider mode: ${includeLive}`,
  `- Postdeploy mode: ${includePostdeploy}`,
  `- Deploy URL: ${deployUrl || 'not provided'}`,
  `- Counts: PASS ${counts.PASS || 0} / WARN ${counts.WARN || 0} / FAIL ${counts.FAIL || 0} / UNPROVEN ${counts.UNPROVEN || 0}`,
  '',
  '## Results by Tier',
  ''
];
for (const [tier, items] of grouped.entries()) {
  md.push(`### ${tier}`, '', '| Status | ID | Name | Exit | Log |', '|---|---|---|---:|---|');
  for (const item of items) md.push(`| ${item.status} | ${item.id} | ${item.name} | ${item.exitCode ?? ''} | ${item.log || ''} |`);
  md.push('');
}
md.push('## Failure / Unproven Repair List', '');
if (!failed.length && !warned.length && !unproven.length) {
  md.push('- None.');
} else {
  for (const item of [...failed, ...warned, ...unproven]) {
    md.push(`- ${item.status}: ${item.id} — ${item.likelyFix}`);
  }
}
md.push('', '## Proof Boundary', '', '- Tier 1 can be run before ZIP delivery by the assistant/container.', '- Tier 2 must run locally because it requires Playwright Chromium/browser runtime.', '- Tier 3 must run locally because it requires restored secrets/provider env and may require deployed URLs.', '- Tier 4 remains human approval: AI answer quality, voice quality, avatar quality, visual/design judgment, business usefulness.');
fs.writeFileSync(path.join(reportRoot, 'summary.md'), md.join('\n'));

console.log(`TEST OPERATIONS ${finalStatus}`);
console.log(`Report: ${path.relative(root, reportRoot)}`);
console.log(JSON.stringify(counts, null, 2));
if (failed.length || warned.length || unproven.length) {
  console.log('Repair / unproven list:');
  for (const item of [...failed, ...warned, ...unproven]) console.log(`- ${item.status}: ${item.id} — ${item.likelyFix}`);
}
process.exit(failed.length ? 1 : 0);
