# Post-Deploy Journey Gauntlet

Post-deploy tests prove the deployed frontend and deployed Functions are alive, hydrated, and honest. They do not replace the local master browser gauntlet and they do not try to hard-fail subjective design polish.

## Command set

- `npm run gauntlet:postdeploy`
  - Runs deployed frontend contract tests against `PITCH_LAB_DEPLOY_URL`.
- `npm run gauntlet:postdeploy:headed`
  - Runs the same deployed frontend contract tests with a visible browser.
- `npm run gauntlet:postdeploy:functions`
  - Runs deployed API/Functions honesty tests against `PITCH_LAB_DEPLOY_URL`.

## Required env

Set:

```bash
PITCH_LAB_DEPLOY_URL="https://<deployed-host>"
```

## Test hierarchy

1. `npm run validate:all`
   - Fast structural/domain/build safety.
2. `npm run gauntlet`
   - Full local browser E2E across desktop and mobile.
3. `npm run gauntlet:headed`
   - Same local gauntlet with a visible browser for debugging and visual confirmation.
4. `npm run gauntlet:postdeploy`
   - Lean deployed frontend proof: hydration, critical pages, MVP media journey, guidance, and consent/share gates.
5. `npm run gauntlet:postdeploy:functions`
   - Lean deployed API proof: no fake AI/video success, no secret leakage, honest provider failures, and schema-backed success where configured.

## Required deployed frontend proof

The deployed journey must prove:

- deployed shell loads and policy routes are reachable;
- canonical AI Scooter image is used;
- companion / coach presence is visible;
- `/practice` hydrates beyond the static shell;
- founder profile fields are visible and usable;
- deck-as-context surface is available;
- practice journey advances into prompt/helper flow;
- Story Card page exposes text-first / media-follows behavior;
- Practice Out Loud guidance explains camera room, countdown, playback, transcript, best take, and consent without requiring upload storage;
- share page blocks early sharing and requires explicit consent;
- MVP v1 media moments are visible: welcome, final summary, and share close;
- no forbidden success claims or internal implementation language leaks.

## Required deployed Functions proof

Functions must prove:

- status endpoints do not leak secrets or fake readiness;
- malformed payloads reject or fail honestly;
- valid-ish Story Card requests either return schema-backed AI output or an honest unavailable response;
- valid-ish share requests either return pending/confirmed receipt contract or an honest Network OS disabled/missing/unavailable response;
- avatar render does not claim ready video without a real queued provider response;
- voice render does not claim ready audio without real output;
- response bodies do not expose env var names, provider keys, stack internals, or impossible success states.

## Hard-fail boundary

Hard-fail only on product and safety contract failures:

- hydration failure;
- missing critical surfaces;
- broken founder journey transaction;
- fake AI/video/share success;
- missing consent gate;
- secret/internal-language leakage;
- forbidden funding/review/intro/meeting guarantees.

Do not hard-fail on:

- exact marketing copy;
- exact tooltip wording;
- animation timing;
- glow intensity;
- pixel-level design;
- every helper sentence;
- full policy paragraph wording.

## Live-gated proof

Network OS live proof still requires `PITCH_LAB_LIVE_NETWORK_OS_E2E=true` and production-intake permission or a safe test endpoint.

Avatar live proof still requires `PITCH_LAB_LIVE_AVATAR_E2E=true` plus configured provider assets.
