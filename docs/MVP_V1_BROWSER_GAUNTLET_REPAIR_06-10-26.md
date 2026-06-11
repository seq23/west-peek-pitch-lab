# MVP v1 Browser Gauntlet Repair — 06-10-26

## Status

This pass repairs the browser-level Playwright failures discovered after the MVP v1 AI Scooter media/journey updates were applied locally.

## Root cause

The built static app copied `scooterJourneyModel.mjs` into `dist/assets/`, but did not copy its new dependency, `scooterMediaContract.mjs`. Because browser modules resolve relative imports at runtime, the client-side modules failed to hydrate. That left `/practice` stuck at `Loading guided practice flow...` and left the AI Story Card root empty on `/story-card`.

## Fixes

- Added `scooterMediaContract.mjs` to the static client module copy list.
- Preserved the MVP v1 AI Scooter media contract in browser runtime.
- Restored client hydration for:
  - founder profile gate
  - deck context helper
  - guided practice flow
  - local story card preview
  - Practice Out Loud camera-room guidance
  - AI Story Card generation states
  - share and thank-you status states
- Aligned founder-facing helper copy with the browser gauntlet contract without adding petty visual hard-fails.

## Validation approach

This pass follows the validation simplification matrix:

- Hard-fail production-risk behavior only.
- Do not hard-fail animation intensity, exact glow strength, or visual polish minutiae.
- Keep E2E checks focused on surface, transaction, persistence, consent, and honest degraded states.

## Checks run in sandbox

- `npm run validate:all` passed.
- Static build passed.
- Client module import audit passed.
- Dist journey string audit passed.

## Browser gauntlet note

Full browser Playwright execution still requires a local machine with Playwright browser binaries installed. The previous local failure pattern is addressed by the runtime hydration fix and copy alignment above.
