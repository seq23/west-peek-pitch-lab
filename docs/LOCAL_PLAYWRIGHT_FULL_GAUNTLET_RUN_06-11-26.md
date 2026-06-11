# Local Playwright Full Gauntlet Run — 06-11-26

## Purpose

This note records the local-validation boundary for the West Peek Pitch Lab full browser gauntlet.

The repo contains a full Playwright E2E suite for the current Pitch Lab product. The suite is intended to be run on the local machine after the baseline ZIP is applied with the repo updater.

## Full local command sequence

From the repo root:

1. Install dependencies:

   npm ci

2. Install Playwright Chromium if it is not already installed:

   npx playwright install chromium

3. Run structural validation:

   npm run validate:all

4. Run the full Playwright gauntlet:

   npm run gauntlet

5. Optional headed proof:

   npm run gauntlet:headed

## Live LLM browser proof

The live deployed LLM browser proof is intentionally separate from the local static gauntlet. It requires a deployed URL and live provider env.

Required command pattern:

PITCH_LAB_DEPLOY_URL="https://<deployed-url>" npm run proof:llm:live:browser

## Sandbox result on 06-11-26

Static/local non-browser validation passed in the sandbox:

- npm ci — PASSED
- npm run validate:all — PASSED
- npm run validate:e2e-data-trace — PASSED as part of validate:all, 69 pass / 0 warn / 0 fail

Full Playwright browser execution did not complete in the sandbox because the Playwright Chromium binary was missing and the sandbox could not resolve cdn.playwright.dev to download it.

Observed blocker:

- Missing executable: chromium_headless_shell
- Download failure: getaddrinfo EAI_AGAIN cdn.playwright.dev

This is an environment prerequisite failure, not product-journey proof.

## Harness hardening added

`scripts/run-master-gauntlet.mjs` now performs a browser-binary preflight before launching the suite. If Chromium is missing, it exits with a clear instruction instead of producing dozens of noisy browser-launch failures.

