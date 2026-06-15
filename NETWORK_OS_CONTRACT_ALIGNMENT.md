# Pitch Lab ↔ Network OS Contract Alignment

Status: ACTIVE  
Updated: 2026-06-11

## Current status

Pitch Lab runtime sender code already uses the canonical Network OS handoff headers and signature shape:

- `x-pitch-lab-submitted-at`
- `x-pitch-lab-signature`
- HMAC-SHA256 over `${submittedAt}.${rawBody}`
- base64url signature

Primary runtime files:

- `src/server/network/networkOsClient.mjs`
- `src/server/network/pitchLabHandoffContract.mjs`
- `src/server/network/profileLeadContract.mjs`
- `functions/api/pitch/share.js`

## Required paired proof

A complete two-repo proof requires:

1. Network OS Tier 3 passes for the signed Pitch Lab receiver.
2. Pitch Lab Tier 3 passes for the deployed browser share flow.
3. Both repos use the same shared secret value in their respective secret stores.
4. The test payload remains review-only: `human_review_required=true`, `execution_allowed=false`, no automatic contact creation, no investment decision, no guaranteed follow-up.

## Current patch scope

No sender-code signature repair was required in this Pitch Lab ZIP because the sender already matches the canonical Network OS signature contract. The required change here is validation/documentation alignment: Tier 3 is the ultimate provider/deployed proof gate, and live Network OS handoff must be explicit in the operations orchestrator.
