# MVP v1 AI Scooter Media Journey — Hostile Review

**Status:** CURRENT IMPLEMENTATION REVIEW  
**POV:** 20-year software/product/UX review standard  
**Date:** 06-10-26

## Finding

The prior implementation risk was not a technical failure; it was a product-governance failure.

The locked experience had already been defined: the founder should feel like they are in a short coaching session with AI Scooter. The app drifted because older phase docs and runtime language allowed softer interpretations such as “optional video,” “provider gated,” or “text-only fallback” to read like the intended product rather than degraded mode.

That is not acceptable for this product.

## Corrected invariant

AI Scooter is the session host.

Talking Scooter is required at:

1. opening / welcome
2. final personalized coaching summary
3. share decision close

Cost is controlled through cached clips, selected dynamic moments, duration guidance, render caps, and failure fallback. Cost is not controlled by removing the talking-Scooter moments that make the product feel like coaching.

## What changed

- Added a docs hierarchy so the source of truth is no longer scattered across phase docs.
- Added the MVP v1 AI Scooter Experience Contract.
- Added the Scooter Speaking and Cost Discipline contract.
- Updated runtime media contract and moment metadata.
- Updated founder-facing Story Card language to say text appears first and Scooter's talking summary follows.
- Updated cost guidance from brittle tiny caps to target duration ranges and duration ceilings.
- Preserved validation simplification: no new petty hard-fail validators were added.

## What remains intentionally not overbuilt

- No fake rendered welcome/share clips were claimed.
- No WebRTC/live-streaming/video-call infrastructure was added.
- No storage bucket upload path was added.
- No broad new validation gauntlet was added just to satisfy documentation aesthetics.

## Hard product boundary going forward

Any future implementation that makes talking Scooter look like optional decoration is wrong.

Any implementation that blocks the Story Card while video renders is wrong.

Any implementation that generates paid media for every small prompt is wrong.

The correct MVP v1 balance is:

- Scooter appears immediately.
- Scooter talks at the opening.
- Scooter stays present during practice.
- Text gives the detailed Story Card first.
- Scooter gives the final personalized coaching summary.
- Scooter closes the share decision.
- Fallback is honest when media providers/assets are not ready.
