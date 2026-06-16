# Pitch Lab lifecycle environment repair — 2026-06-16

## Incident

The deployed lifecycle close accepted `POSTDEPLOY_BASE_URL`, `SMOKE_BASE_URL`, and `PLAYWRIGHT_BASE_URL`, but the live-proof orchestrator only recognized `PITCH_LAB_DEPLOY_URL`. It also deleted an existing `.env.local` before provider proofs and then forced a vault restore, making locally managed provider configuration unavailable.

## Repair

- Normalize the four approved deployment URL aliases into one explicit remote HTTPS deployment target.
- Preserve an existing `.env.local` throughout the lifecycle.
- Temporarily hide `.env.local` only while static/no-secret and deterministic local-browser lanes run.
- Restore from the encrypted vault only when `.env.local` is absent and `ENV_VAULT_PASSPHRASE` is available.
- Remove `.env.local` after the run only when the orchestrator created it.
- Isolate local Playwright lanes from deployed URL variables and live opt-in flags.
- Bound Playwright to four workers by default and permit an explicit system Chromium path.
- Allow postdeploy function and journey runners to consume any approved deployment URL alias.
- Report configured/missing proof groups by name without printing secret values.

## Truth boundary

The repository can prove environment handling, alias normalization, preservation, and lane isolation without secrets. Real LLM, voice, avatar, and Network OS provider success still requires the user's locally configured `.env.local` and the deployed Cloudflare environment.
