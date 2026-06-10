# Post-Deploy Journey Gauntlet

Post-deploy tests prove the deployed frontend and deployed function honesty without pretending live provider success.

## Tiers

1. Local hostile gauntlet: mocks providers and proves surface, state, consent, persistence, and trust boundaries.
2. Deployed frontend journey gauntlet: runs against `PITCH_LAB_DEPLOY_URL` with routed mocks where needed to prove the deployed app UI and client flow.
3. Deployed Functions gauntlet: calls deployed APIs directly and verifies honest success/failure behavior.
4. Live-gated provider proof: runs only when explicit env flags are set.

## Required deployed frontend proof

The deployed journey must prove AI Scooter naming, canonical image, sticky companion, profile gate, deck-as-context, practice flow, Pitch Story Card, Practice Out Loud optional panel, share consent, pending network review language, footer policy routes, and no forbidden claims.

## Required functions proof

Functions must reject malformed payloads, never leak secrets, never fake AI/video success, and never return investment-review or guaranteed-follow-up language.

## Live-gated proof

Network OS live proof requires `PITCH_LAB_LIVE_NETWORK_OS_E2E=true` and production-intake permission or a safe test endpoint. Avatar live proof requires `PITCH_LAB_LIVE_AVATAR_E2E=true`.
