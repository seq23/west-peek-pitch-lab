#!/usr/bin/env node
// Retention for local browser proof evidence.
//
// run-local-browser-proof.mjs writes every run to a fresh timestamped directory
// under artifacts/diagnostics/local-browser/ and mirrors it to
// ~/repo-validation-evidence/<repo>/. Nothing ever removed an old one, so eight
// runs from two days in June accumulated 2.1 GB - 99.9% of it Playwright
// trace.zip files under test-results/, some single traces over 90 MB.
//
// What actually has to survive is narrow. validate-local-browser-proof.mjs sorts
// the run directories and reads summary.json from runs.at(-1) only: the newest
// run's summary is the proof, older runs are never opened, and test-results/ is
// never opened at all. So retention keeps:
//
//   - the newest KEEP_RUNS run directories (their small JSON evidence), and
//   - test-results/ for only the newest KEEP_TRACES of those.
//
// The newest run is never touched, so the validator cannot be starved by a
// sweep. Traces stay available for the run you most likely want to debug, and
// the JSON history stays readable much further back for almost no disk.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const pkgName = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).name;
  } catch {
    return null;
  }
})();

const KEEP_RUNS = Math.max(1, Number(process.env.LOCAL_BROWSER_PROOF_KEEP_RUNS || 3));
const KEEP_TRACES = Math.max(1, Number(process.env.LOCAL_BROWSER_PROOF_KEEP_TRACES || 1));
const dryRun = process.argv.includes('--dry-run');

// The heavy subdirectory Playwright writes; the JSON evidence beside it is tiny.
const HEAVY = 'test-results';

function dirSize(target) {
  let total = 0;
  let stack = [target];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(abs);
      else {
        try {
          total += fs.statSync(abs).size;
        } catch {
          /* vanished mid-walk */
        }
      }
    }
  }
  return total;
}

function remove(target) {
  const size = dirSize(target);
  if (!dryRun) fs.rmSync(target, { recursive: true, force: true });
  return size;
}

// Run ids are `<pkg>-local-browser-<ISO timestamp>`, so a lexicographic sort is
// chronological - the same ordering the validator relies on.
function pruneBase(base, label, stats) {
  let runs;
  try {
    runs = fs
      .readdirSync(base, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();
  } catch {
    return;
  }
  if (!runs.length) return;

  const keep = runs.slice(-KEEP_RUNS);
  const drop = runs.slice(0, Math.max(0, runs.length - KEEP_RUNS));

  for (const name of drop) {
    stats.bytes += remove(path.join(base, name));
    stats.runsRemoved += 1;
    stats.details.push(`${label}: removed run ${name}`);
  }

  // Strip traces from the retained runs that are not recent enough to keep them,
  // newest-first so KEEP_TRACES counts from the newest end.
  const traceKeep = new Set(keep.slice(-KEEP_TRACES));
  for (const name of keep) {
    if (traceKeep.has(name)) continue;
    const heavy = path.join(base, name, HEAVY);
    if (!fs.existsSync(heavy)) continue;
    stats.bytes += remove(heavy);
    stats.tracesStripped += 1;
    stats.details.push(`${label}: stripped ${HEAVY}/ from ${name}`);
  }
}

const stats = { bytes: 0, runsRemoved: 0, tracesStripped: 0, details: [] };

pruneBase(path.join(root, 'artifacts', 'diagnostics', 'local-browser'), 'repo', stats);
// The runner mirrors each run here with cpSync, so it grows in lockstep and
// needs the same policy or the reclaim is only half real.
if (pkgName) {
  pruneBase(path.join(os.homedir(), 'repo-validation-evidence', pkgName), 'external', stats);
}

const out = {
  status: 'PASS',
  mode: dryRun ? 'dry-run' : 'apply',
  keep_runs: KEEP_RUNS,
  keep_traces: KEEP_TRACES,
  runs_removed: stats.runsRemoved,
  runs_trace_stripped: stats.tracesStripped,
  bytes_reclaimed: stats.bytes,
  details: stats.details,
  generated_at: new Date().toISOString(),
};
fs.mkdirSync(path.join(root, 'artifacts', 'diagnostics', 'cleanup'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'artifacts', 'diagnostics', 'cleanup', 'browser-diagnostics-retention.json'),
  JSON.stringify(out, null, 2) + '\n'
);
console.log(
  `[diagnostics:prune] PASS: runs_removed=${stats.runsRemoved}; traces_stripped=${stats.tracesStripped}; ` +
    `reclaimed=${(stats.bytes / 1073741824).toFixed(2)}GB (keep_runs=${KEEP_RUNS}, keep_traces=${KEEP_TRACES})`
);
