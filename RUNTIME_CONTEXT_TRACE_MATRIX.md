# Runtime Context Trace Matrix — west-peek-pitch-lab

Status: ACTIVE
Date: 2026-06-11

## Purpose

This matrix prevents local/test/deployed/provider-context drift. Before debugging any browser, auth, provider, webhook, deploy, or postdeploy failure, compare the contexts below.

| Context | What must be compared | Required proof |
|---|---|---|
| Working tree static inspection | source files, matrix, docs, env examples | Tier 1 report |
| Manual local server | command, port, host, env source, runtime store | local log / browser proof |
| Playwright self-spawn server | webServer command, env overrides, reuseExistingServer behavior | Tier 2 headed/self-spawn report |
| Playwright test process | env visible to test signer/client, base URL, provider toggles | test report |
| Unit/integration process | env defaults and mocked provider mode | test output |
| Local `.env.local` | existence only; never values; compare keys and hashes if needed | env parity report |
| Env examples/registry | required/optional/local-only/public/server-only keys | env validator report |
| CI/GitHub Actions env | secret names, workflow status, build command | gh evidence |
| Cloudflare/deployed env | required secret names, runtime deploy target | platform audit/sync report |
| Deployed runtime | explicit deployed base URL, API status, auth behavior | postdeploy report |
| Postdeploy smoke target | never localhost for final tier | smoke report |
| Provider dashboard/runtime state | provider account, sandbox/prod mode, evidence IDs | provider evidence report |

## Critical final-tier rule

Tier 3 fails when required context is missing. Missing context is not a skip; it is BLOCKED/UNPROVEN until resolved.

## Required final-tier env/input names

- PITCH_LAB_DEPLOY_URL
- PITCH_LAB_RUN_LIVE_PROOFS=true
- PITCH_LAB_LIVE_LLM_PROOF=true
- PITCH_LAB_LIVE_NETWORK_OS_E2E=true
- NETWORK_OS_API_BASE_URL
- PITCH_LAB_SHARED_SECRET
