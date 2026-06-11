# MVP v1 Live Media Headed Proof Runbook — 06-10-26

## Purpose

This runbook exists because the MVP v1 product contract requires talking AI Scooter at key moments. Static DOM checks and provider-status scripts are not enough. The repo needs a visible browser proof path that can run with the canonical encrypted env vault and test real provider behavior when credentials are available.

## What this adds

New commands:

```bash
npm run env:inspect
npm run env:restore
npm run env:restore:force
npm run proof:media:headed
npm run proof:media:live:headed
npm run proof:media:live:headed:from-vault
```

New local proof server:

```text
scripts/preview-media-proof.mjs
```

New headed Playwright proof runner:

```text
scripts/run-media-proof-headed.mjs
```

New focused Playwright suite:

```text
tests/e2e/media-provider-proof.spec.mjs
```

## Proof layers

### Non-live headed proof

```bash
npm run proof:media:headed
```

This opens the real app in a visible browser, proves the media slots and journey states, and confirms fallback states do not fake provider success. It does not require paid provider calls.

### Live headed proof from restored vault

```bash
ENV_VAULT_PASSPHRASE="<approved passphrase>" npm run proof:media:live:headed:from-vault
```

This restores `.env.local` from `secrets/pitch-lab.env.vault.enc`, starts a local media proof server with the restored env, opens Playwright headed, and requires real provider behavior.

Live mode requires:

- ElevenLabs voice configured and rendering real audio.
- Avatar/talking-photo provider configured and returning a real render contract.
- The browser journey still showing text-first Story Card output.
- No fake media success.

## Expected current truth

If the vault contains a working `ELEVENLABS_API_KEY` and the committed Scooter voice ID is valid, live voice proof should pass.

If the talking-photo/video provider endpoint/model/asset IDs are not yet confirmed, live avatar proof should fail clearly. That failure is useful. It proves the repo is not pretending Scooter's photo talks before the provider path is real.

## Hard product rule

Do not claim talking Scooter is production-proven until `npm run proof:media:live:headed` passes with real provider output or a real queued render contract.

## Validation philosophy

This is not a pixel QA test. It hard-fails only on:

- static shell / hydration failure
- missing MVP v1 media slots
- fake provider success
- live proof env missing when live mode is requested
- voice/avatar render contract failure in live mode
- Story Card blocking on media instead of text-first output
