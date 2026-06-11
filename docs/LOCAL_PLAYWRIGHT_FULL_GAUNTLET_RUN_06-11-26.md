# Local Playwright Full Gauntlet Run — 06-11-26

Status: SUPERSEDED BY CANONICAL TEST OPERATIONS RUNBOOK

Use this document only as historical context for why the browser preflight was added.

Canonical authority now lives at:

```text
docs/TEST_OPERATIONS_RUNBOOK.md
```

Canonical local command:

```bash
npm run validate:everything
```

Canonical command that installs Playwright Chromium first:

```bash
npm run validate:everything:install-browsers
```

Canonical live-provider command:

```bash
npm run validate:everything:live
```

Canonical live-provider + deployed proof command:

```bash
PITCH_LAB_DEPLOY_URL="https://<deployed-url>" npm run validate:everything:live:postdeploy
```

## Historical note

The original sandbox result on 06-11-26 was:

- `npm ci` — PASSED
- `npm run validate:all` — PASSED
- `npm run validate:e2e-data-trace` — PASSED as part of `validate:all`, 69 pass / 0 warn / 0 fail

Full Playwright browser execution did not complete in the sandbox because the Playwright Chromium binary was missing and the sandbox could not resolve `cdn.playwright.dev` to download it.

Observed blocker:

- Missing executable: `chromium_headless_shell`
- Download failure: `getaddrinfo EAI_AGAIN cdn.playwright.dev`

That was an environment prerequisite failure, not product-journey proof.

## Harness hardening retained

`scripts/run-master-gauntlet.mjs` still performs a browser-binary preflight before launching the suite. If Chromium is missing, it exits with a clear instruction instead of producing dozens of noisy browser-launch failures.
