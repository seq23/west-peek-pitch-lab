# MVP v1 Playwright E2E Hostile Review — West Peek Pitch Lab

**Status:** ACTIVE SUPPORTING QA TRACE  
**Parent source:** `docs/MVP_V1_AI_SCOOTER_EXPERIENCE_CONTRACT.md`  
**Validation posture:** common-sense hard failures only; do not turn subjective design polish into brittle CI gates.

## Purpose

This pass reviews the Playwright master gauntlet from the point of view of a senior product engineer and UX lead. The test suite should protect the end-to-end founder journey, real transactions, local persistence, consent boundaries, media journey contract, and edge cases that could make the product unsafe or fake.

The goal is not to assert every animation, glow, tooltip pixel, or exact copy line. The goal is to prevent the app from regressing into:

- a static website,
- a generic form,
- a fake AI demo,
- an unsafe share flow,
- a mute/static Scooter mascot,
- a payload that silently drops consent or rehearsal context.

## Coverage map

| Layer | Covered by Playwright | What matters | What should not be over-tested |
|---|---|---|---|
| Surface | Public routes, navigation, brand, trust copy, AI Scooter presence | Product renders as Pitch Lab and exposes no false claims. | Exact spacing, glow intensity, animation duration. |
| Guidance | Profile helpers, deck explanation, question hints, examples, avoid guidance, next-step cues | Founder understands what to do next without a tutorial modal. | Exact wording of every helper. |
| Practice transaction | Profile start, deck skip, seven required answers plus optional context, thin-answer block, local persistence | Founder can complete the private practice journey. | Every possible invalid text variant. |
| Story transaction | Local card, AI unavailable state, AI success state, copy path | No fake AI output; useful text appears before media. | Provider-specific implementation detail. |
| Scooter media contract | Required welcome, final summary, and share close moments | Talking Scooter is a product requirement at key moments; fallback is honest degraded mode. | Live provider success when env is not configured. |
| Rehearsal journey | Camera-room surface, countdown/record/playback/choose/consent states | Founder sees how Practice Out Loud works and that local video is not uploaded. | Forcing browser camera/mic in CI. |
| Rehearsal persistence | Selected take metadata/transcript persists into share preview only with consent | Packet can include selected take context without uploading video blobs. | Actual video blob upload; that is future storage scope. |
| Share transaction | Explicit consent, payload shape, Network OS success/failure, thank-you truth | No handoff without consent; no fake success. | Full Network OS persistence; that belongs in Network OS validation. |
| Security/privacy | No secret names/raw env/file paths; no internal implementation language | Founder UI does not leak backstage details. | Internal hidden test anchors unless visible to user. |
| Live-provider proof | Explicit opt-in tests only | Avoid accidental provider spend or false local guarantees. | Running live media/Network OS tests by default. |

## New test coverage added in this pass

1. **Guidance surface test**
   - Confirms profile/deck helpers exist.
   - Confirms question helper panel includes why/hint/example/avoid guidance.
   - Confirms the next action becomes visually identifiable when the answer is useful.

2. **Practice Out Loud surface and edge-state test**
   - Confirms camera-room, countdown, record, playback, choose, and consent steps are visible.
   - Confirms no video upload claim is made.
   - Confirms selecting rehearsal consent without a best take produces a helpful local error.

3. **Selected take persistence preview test**
   - Seeds a selected rehearsal take and explicit rehearsal consent.
   - Confirms share preview shows selected take status, transcript status, and packet inclusion consent.

4. **Scooter speaking journey contract test**
   - Confirms the welcome required talking-Scooter slot exists.
   - Confirms Story Card text appears first and final Scooter media summary follows non-blocking.
   - Confirms share close is a required Scooter speaking moment.

5. **Consented rehearsal payload test**
   - Confirms selected take transcript/status can travel with the share packet only when consented.
   - Confirms local video blobs/base64/video URLs do not travel in the payload.

## Edge cases intentionally not hard-failed here

These should remain manual/UX review or future specialized tests, not default hard failures:

- exact tooltip phrasing,
- exact animation/glow timing,
- provider render quality,
- real camera/mic capture in CI,
- actual video upload and retention,
- live avatar generation cost/proof,
- full Network OS database persistence.

## Remaining local validation

`npm run validate:all` proves static/domain/contract safety. `npm run gauntlet` remains the local browser validation command. Live Network OS and live avatar/video tests remain opt-in via environment flags.
