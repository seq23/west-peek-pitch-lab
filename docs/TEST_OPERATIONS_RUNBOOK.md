# West Peek Pitch Lab — Canonical Test Operations Runbook

**Status:** AUTHORITATIVE  
**Date:** 2026-06-11  
**Scope:** all validation, Playwright, live-provider proof, env vault handling, postdeploy proof, failure reporting, and new-chat continuity for this repo.

---

## 0. Plain-English Rule

This repo has one testing authority: this file.

Do **not** rediscover the test system from `package.json` one script at a time. `package.json` contains implementation details. This runbook defines the operating model.

The default operator command is:

```bash
npm run validate:everything
```

The default live-provider command is:

```bash
npm run validate:everything:live
```

The default deployed proof command is:

```bash
PITCH_LAB_DEPLOY_URL="https://<deployed-url>" npm run validate:everything:live:postdeploy
```

Everything else is a lower-level lane used for debugging.

---

## 1. Why This Exists

The repo contains many legitimate proof lanes:

- static validators
- domain contract tests
- build checks
- Playwright gauntlets
- camera/rehearsal proof
- real journey proof
- LLM provider proof
- voice provider proof
- media/avatar provider proof
- deployed function checks
- deployed browser checks
- env vault restore/remove scripts

Before this runbook, those lanes were scattered and easy to confuse.

This runbook makes the system deterministic:

1. assistant/container proof is Tier 1 only
2. local browser proof is Tier 2
3. live-provider/deployed proof is Tier 3
4. human approval is Tier 4
5. `.env.local` is restored only when needed and removed afterward
6. generated reports stay under `tmp/` and must not be committed
7. reports use `PASS`, `WARN`, `FAIL`, and `UNPROVEN`

---

## 2. Canonical Command Hierarchy

### 2.1 Tier 1 only — static/contract/build validation

```bash
npm run validate:all
```

Use this for baseline source validation and assistant-pre-delivery proof.

### 2.2 Tier 1 + Tier 2 — full local non-live proof

```bash
npm run validate:everything
```

Use this after applying a ZIP locally when you want the normal full local proof bundle.

### 2.3 Tier 1 + Tier 2 with browser install

```bash
npm run validate:everything:install-browsers
```

Use this if Playwright Chromium is missing.

### 2.4 Tier 1 + Tier 2 in visible browser mode

```bash
npm run validate:everything:headed
```

Use this when you want to watch browser behavior.

### 2.5 Tier 1 + Tier 2 + Tier 3 live-provider proof

```bash
npm run validate:everything:live
```

Use this when local provider secrets are available in the env vault.

### 2.6 Tier 1 + Tier 2 + Tier 3 live-provider proof in visible browser mode

```bash
npm run validate:everything:live:headed
```

Use this when validating live proof and watching browser behavior.

### 2.7 Tier 1 + Tier 2 + Tier 3 + deployed proof

```bash
PITCH_LAB_DEPLOY_URL="https://<deployed-url>" npm run validate:everything:live:postdeploy
```

Use this after deploy, once you know the deployed app URL.

### 2.8 Tier 1 + Tier 2 + Tier 3 + deployed proof in visible browser mode

```bash
PITCH_LAB_DEPLOY_URL="https://<deployed-url>" npm run validate:everything:live:postdeploy:headed
```

Use this for final human-observable deployed browser proof.

---

## 3. Post-Push Operator Sequence

After applying a new baseline ZIP with the generic v3 updater and after the updater pushes to GitHub, do this:

### Step 1 — Confirm clean repo

```bash
git status --short
```

Expected output: nothing.

### Step 2 — Verify GitHub Actions triggered

```bash
gh run list --limit 20
```

If any new workflow failed, inspect it:

```bash
gh run view <RUN_ID> --log-failed
```

### Step 3 — Run the canonical local non-live proof bundle

```bash
npm run validate:everything:install-browsers
```

This runs Tier 1 and Tier 2, installs Chromium if needed, and prints one clean report.

### Step 4 — Read the report

```bash
cat tmp/test-operations/summary.md
```

Interpretation:

- `PASS` means that lane passed.
- `WARN` means the lane produced a non-blocking warning.
- `FAIL` means the lane failed and needs repair.
- `UNPROVEN` means the lane was intentionally skipped because the required context was unavailable.

### Step 5 — Run live-provider proof if provider vault is configured

```bash
npm run validate:everything:live
```

This restores `.env.local` from vault only for live lanes and removes `.env.local` when finished.

### Step 6 — Run deployed proof after you have a deployed URL

```bash
PITCH_LAB_DEPLOY_URL="https://<deployed-url>" npm run validate:everything:live:postdeploy
```

### Step 7 — Confirm `.env.local` is gone

```bash
ls -la .env.local
```

Expected result: file not found.

### Step 8 — Confirm generated reports are not tracked

```bash
git status --short
```

Expected result: nothing, or only ignored generated files outside git tracking.

If `tmp/`, `playwright-report/`, `test-results/`, `.env.local`, or provider output appears as tracked/staged, stop and clean before committing.

---

## 4. Environment Handling Law

### 4.1 `.env.local` is never source code

`.env.local` must never be committed.

### 4.2 Static validation runs without `.env.local`

The orchestrator removes `.env.local` before Tier 1 validation so `validate:no-secrets` proves the artifact is clean.

### 4.3 Live validation restores `.env.local` from vault

For live provider proof, the orchestrator runs:

```bash
npm run env:restore:force
```

### 4.4 Cleanup removes `.env.local`

At the end of the orchestrator, cleanup removes `.env.local`.

Manual cleanup command:

```bash
npm run env:remove
```

Backup cleanup command:

```bash
npm run env:remove:backup
```

The cleanup script never modifies the vault.

---

## 5. Tier Model

### Tier 1 — ZIP delivery / assistant-pre-delivery validation

Can be run by the assistant/container before delivering a ZIP.

Canonical command:

```bash
npm run validate:all
```

Proves:

- validation matrix passes
- env contract exists
- no plaintext secrets are packaged
- no-theater checks pass
- locked copy checks pass
- canonical runtime checks pass
- static app builds
- domain contracts pass
- phase validators pass
- master gauntlet is structurally present
- E2E data trace passes
- route smoke passes
- profile lead contracts pass

Does not prove:

- real Chromium browser behavior
- real local Playwright execution
- live provider success
- deployed runtime
- human visual quality

### Tier 2 — Local automated browser validation

Requires local Playwright Chromium.

Canonical command:

```bash
npm run validate:everything
```

Underlying lanes:

- `npm run gauntlet`
- `npm run gauntlet:headed`
- `npm run proof:journey`
- `npm run proof:journey:headed`
- `npm run proof:camera`
- `npm run proof:camera:headed`

Proves:

- browser routes load
- founder journey works in browser
- browser-visible persistence/state behavior works
- consent boundaries are visible and enforced
- camera/rehearsal path and fallbacks are covered where local browser permissions allow
- Playwright suite is executable on the local machine

Does not prove:

- live provider success
- deployed runtime
- human approval of UI/design/media quality

### Tier 3 — Live provider and deployed validation

Requires local provider env restored from vault.

Canonical live command:

```bash
npm run validate:everything:live
```

Canonical deployed command:

```bash
PITCH_LAB_DEPLOY_URL="https://<deployed-url>" npm run validate:everything:live:postdeploy
```

Underlying lanes:

- `npm run env:proof`
- `npm run env:restore:force`
- `npm run proof:llm:live`
- `npm run proof:voice:live`
- `npm run proof:media:live`
- `npm run proof:llm:live:browser` when `PITCH_LAB_DEPLOY_URL` exists
- `npm run gauntlet:postdeploy:functions` when `PITCH_LAB_DEPLOY_URL` exists
- `npm run gauntlet:postdeploy` when `PITCH_LAB_DEPLOY_URL` exists

Proves, when configured:

- env vault can restore local provider variables
- AI Scooter can produce real provider-backed LLM output
- voice provider can return a real audio payload
- media/avatar provider path is live or fails honestly
- deployed browser can call live LLM route when deploy URL exists
- deployed function and journey checks can run against explicit deployed URL

Does not prove:

- subjective AI answer quality
- voice quality approval
- avatar/video quality approval
- investor/founder business usefulness

### Tier 4 — Human approval

No script can prove:

- whether the UI feels premium enough
- whether AI Scooter sounds like the right person
- whether the avatar looks acceptable
- whether the founder would actually use the product
- whether an investor would value the output
- whether the language feels strategically correct

These require human review.

---

## 6. Test Catalog

| Script | Tier | Purpose |
|---|---:|---|
| `npm run validate:all` | 1 | Full structural/static/domain/build validation |
| `npm run validate:e2e-data-trace` | 1 | Confirms required E2E promise coverage exists |
| `npm run gauntlet` | 2 | Local full Playwright master gauntlet |
| `npm run gauntlet:headed` | 2 | Local full Playwright master gauntlet in headed mode |
| `npm run proof:journey` | 2 | Real local journey proof |
| `npm run proof:journey:headed` | 2 | Real local journey proof in headed mode |
| `npm run proof:camera` | 2 | Camera/rehearsal proof |
| `npm run proof:camera:headed` | 2 | Camera/rehearsal proof in headed mode |
| `npm run env:proof` | 3 | Proves encrypted env vault can be inspected safely |
| `npm run env:restore:force` | 3 | Restores `.env.local` from vault |
| `npm run env:remove` | 3 | Removes `.env.local` after proofs |
| `npm run proof:llm` | 1/3 | Dry LLM honesty proof by default; live with env flag |
| `npm run proof:llm:live` | 3 | Live LLM provider proof |
| `npm run proof:llm:live:browser` | 3 | Deployed browser LLM proof; requires deployed URL |
| `npm run proof:voice` | 1/3 | Dry voice honesty proof by default; live with env flag |
| `npm run proof:voice:live` | 3 | Live voice provider proof |
| `npm run proof:media` | 1/3 | Dry media honesty proof by default; live with env flag |
| `npm run proof:media:live` | 3 | Live media/avatar provider proof |
| `npm run gauntlet:postdeploy:functions` | 3 | Deployed function checks |
| `npm run gauntlet:postdeploy` | 3 | Deployed browser journey checks |
| `npm run validate:everything` | 1+2 | Canonical local non-live orchestrator |
| `npm run validate:everything:live` | 1+2+3 | Canonical local live orchestrator |
| `npm run validate:everything:live:postdeploy` | 1+2+3 | Canonical local live + deployed orchestrator |

---

## 7. Playwright E2E Suite Catalog

Current E2E files:

- `tests/e2e/master-gauntlet.spec.mjs`
- `tests/e2e/founder-camera-rehearsal-proof.spec.mjs`
- `tests/e2e/founder-context-and-accessibility-proof.spec.mjs`
- `tests/e2e/media-provider-proof.spec.mjs`
- `tests/e2e/post-deploy-functions.spec.mjs`
- `tests/e2e/post-deploy-journey.spec.mjs`
- `tests/e2e/llm-live-response.spec.mjs`

The operator should not need to remember which spec belongs to which command. Use `npm run validate:everything` unless debugging one specific lane.

---

## 8. Report Output

The canonical orchestrator writes:

```text
tmp/test-operations/summary.md
tmp/test-operations/summary.json
tmp/test-operations/logs/*.log
```

`tmp/` is generated output and is ignored by git.

Read the human report:

```bash
cat tmp/test-operations/summary.md
```

---

## 9. Failure Handling

The orchestrator does not stop on first failure. It records all lane statuses.

When a failure appears:

1. open the lane log listed in `summary.md`
2. fix the smallest real root cause
3. rerun the specific failing lane if known
4. rerun `npm run validate:everything`
5. do not weaken tests to pass broken behavior
6. do not commit generated `tmp/`, `test-results/`, or `playwright-report/`
7. do not commit `.env.local`

---

## 10. New Chat Continuation Packet

Paste this into any new chat when continuing this repo:

```text
We are working on repo: west-peek-pitch-lab.
Use docs/TEST_OPERATIONS_RUNBOOK.md as the canonical test operations authority.
Do not guess from package.json alone.
The canonical all-tests command is npm run validate:everything.
For local browser proof with live providers, use npm run validate:everything:live.
For deployed proof, set PITCH_LAB_DEPLOY_URL and use npm run validate:everything:live:postdeploy.
The runner restores .env.local from vault only for live lanes and removes .env.local at the end.
Static ZIP delivery validation is Tier 1 only and cannot prove browser/live-provider behavior.
Local Playwright is Tier 2.
Live providers/deployed proof are Tier 3.
Human visual/media/business approval is Tier 4.
Generated reports live under tmp/test-operations and must not be committed.
After push, run gh run list --limit 20 and inspect failures with gh run view <RUN_ID> --log-failed.
Report only PASS / WARN / FAIL / UNPROVEN.
```

---

## 11. Operator Rule

Do not run scattered tests manually unless debugging a known failing lane.

Default to:

```bash
npm run validate:everything
```

For all live/local proof:

```bash
npm run validate:everything:live
```

For full deployed proof:

```bash
PITCH_LAB_DEPLOY_URL="https://<deployed-url>" npm run validate:everything:live:postdeploy
```
