#!/usr/bin/env node
/**
 * validate-ci-workflow-contract
 *
 * Guards the defect that this repo actually had: NOT a red build, but SILENCE.
 * From the first commit until 2026-09-04 there was no `.github` directory on any
 * branch, `gh workflow list` returned nothing, and the repo's entire run history
 * was a single one-shot artifact-packaging job on an orphaned commit. Nothing was
 * failing because nothing ran.
 *
 * An empty workflow list must never read as "nothing to do". This validator turns
 * that silence into a hard failure.
 *
 * It asserts, over every workflow file it finds:
 *   1. ZERO-ITEM GUARD  - examining zero workflows is a FAILURE, never a pass.
 *   2. PARSE            - each file is real YAML. A workflow that fails to parse
 *                         produces a run with zero jobs and logs that never say why.
 *   3. NON-INERT        - each workflow declares >=1 job and each job >=1 step.
 *   4. WIRED TO MAIN    - some workflow triggers on BOTH push to main and
 *                         pull_request to main.
 *   5. ACTUALLY VALIDATES - that workflow invokes `npm run validate:all`, so CI
 *                         cannot be hollowed out into a green no-op.
 *   6. NO DEPLOYMENT    - no workflow issues a deploy command. Deployment stays
 *                         manual by decision; a production credential in Actions
 *                         is blast radius, and restoring an auto-deploy workflow
 *                         is what damaged the sibling repo west-peek-os.
 *
 * Override the scanned directory with CI_WORKFLOW_DIR (used by the negative proof
 * to point this validator at an empty directory and confirm it fails).
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflowDir = process.env.CI_WORKFLOW_DIR
  ? resolve(process.env.CI_WORKFLOW_DIR)
  : join(repoRoot, '.github', 'workflows');

const REQUIRED_BRANCH = 'main';
const REQUIRED_COMMAND = 'npm run validate:all';
const DEPLOY_PATTERNS = [
  /\bwrangler\s+(?:pages\s+)?deploy\b/,
  /\bwrangler\s+publish\b/,
  /\bnpm\s+run\s+deploy\b/,
  /cloudflare\/wrangler-action/,
];

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

// GitHub's `on:` key. YAML 1.1 parsers coerce a bare `on` to boolean true, so
// accept either spelling rather than silently reading an empty trigger set.
const triggersOf = (doc) => (doc && (doc.on ?? doc[true])) || null;

const branchList = (trigger) => {
  if (!trigger || typeof trigger !== 'object') return [];
  const b = trigger.branches;
  if (!b) return [];
  return Array.isArray(b) ? b.map(String) : [String(b)];
};

// --- 1. ZERO-ITEM GUARD -----------------------------------------------------
if (!existsSync(workflowDir) || !statSync(workflowDir).isDirectory()) {
  fail(
    `no workflow directory at ${workflowDir} — this repo has NO CI. ` +
      `An empty workflow list is the failure, not the absence of one.`
  );
}

let files = [];
if (failures.length === 0) {
  files = readdirSync(workflowDir)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .sort();

  if (files.length === 0) {
    fail(
      `examined ZERO workflow files in ${workflowDir}. A validator that passes ` +
        `having checked nothing is not passing. This repo must have CI.`
    );
  }
}

// --- 2..6 per-file assertions ----------------------------------------------
let jobsExamined = 0;
let stepsExamined = 0;
let wiredToMain = null;

for (const file of files) {
  const path = join(workflowDir, file);
  const raw = readFileSync(path, 'utf8');

  let doc;
  try {
    doc = yaml.load(raw);
  } catch (err) {
    fail(`${file}: YAML PARSE ERROR — GitHub would run this as zero jobs and the run logs would never say why: ${err.message}`);
    continue;
  }

  if (!doc || typeof doc !== 'object') {
    fail(`${file}: parsed to ${doc === null ? 'null' : typeof doc}, not a workflow mapping`);
    continue;
  }

  // 3. NON-INERT
  const jobs = doc.jobs;
  const jobNames = jobs && typeof jobs === 'object' ? Object.keys(jobs) : [];
  if (jobNames.length === 0) {
    fail(`${file}: declares ZERO jobs — it would run and do nothing (Rule 0 violation)`);
    continue;
  }

  for (const jobName of jobNames) {
    jobsExamined += 1;
    const job = jobs[jobName];
    const steps = job && Array.isArray(job.steps) ? job.steps : [];
    if (steps.length === 0 && !(job && job.uses)) {
      fail(`${file}: job "${jobName}" has ZERO steps — exits 0 having done nothing`);
    }
    stepsExamined += steps.length;

    // 6. NO DEPLOYMENT
    for (const step of steps) {
      const body = `${step?.run ?? ''}\n${step?.uses ?? ''}`;
      for (const pattern of DEPLOY_PATTERNS) {
        if (pattern.test(body)) {
          fail(
            `${file}: job "${jobName}" issues a DEPLOY command (${pattern}). ` +
              `CI in this repo is validation-only; deployment stays manual.`
          );
        }
      }
    }
  }

  // 4. WIRED TO MAIN
  const trigger = triggersOf(doc);
  if (!trigger || typeof trigger !== 'object') continue;

  const onPushMain = branchList(trigger.push).includes(REQUIRED_BRANCH);
  const onPrMain = branchList(trigger.pull_request).includes(REQUIRED_BRANCH);
  if (!onPushMain || !onPrMain) continue;

  // 5. ACTUALLY VALIDATES
  const allRuns = jobNames
    .flatMap((n) => (Array.isArray(jobs[n]?.steps) ? jobs[n].steps : []))
    .map((s) => s?.run ?? '')
    .join('\n');

  if (allRuns.includes(REQUIRED_COMMAND)) {
    wiredToMain = file;
  } else {
    fail(
      `${file}: triggers on push+pull_request to ${REQUIRED_BRANCH} but never runs ` +
        `\`${REQUIRED_COMMAND}\` — CI that gates main without validating it is theatre.`
    );
  }
}

if (files.length > 0 && !wiredToMain) {
  fail(
    `no workflow triggers on BOTH push to ${REQUIRED_BRANCH} and pull_request to ` +
      `${REQUIRED_BRANCH} while running \`${REQUIRED_COMMAND}\`. ` +
      `Pushes to ${REQUIRED_BRANCH} would land unvalidated.`
  );
} else if (wiredToMain) {
  notes.push(`root CI gate: ${wiredToMain}`);
}

// --- report -----------------------------------------------------------------
const summary = `examined ${files.length} workflow file(s), ${jobsExamined} job(s), ${stepsExamined} step(s)`;

if (failures.length > 0) {
  console.error('FAIL validate:ci-workflow-contract');
  console.error(`  ${summary}`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('PASS validate:ci-workflow-contract');
console.log(`  ${summary}`);
for (const n of notes) console.log(`  ${n}`);
