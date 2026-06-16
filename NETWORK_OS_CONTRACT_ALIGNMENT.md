# Pitch Lab ↔ Network OS Contract Alignment

Status: ACTIVE  
Updated: 2026-06-16

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
- `functions/api/pitch/profile-capture.js`
- `functions/api/pitch/share.js`

## Required paired proof

A complete two-repo proof requires:

1. Network OS Tier 3 passes for the signed Pitch Lab receiver.
2. Pitch Lab Tier 3 passes for the deployed browser share flow.
3. Both repos use the same shared secret value in their respective secret stores.
4. The test payload remains review-only: `human_review_required=true`, `execution_allowed=false`, no automatic contact creation, no investment decision, no guaranteed follow-up.

## Current patch scope

No sender-code signature repair was required in this Pitch Lab ZIP because the sender already matches the canonical Network OS signature contract. The required change here is validation/documentation alignment: Tier 3 is the ultimate provider/deployed proof gate, and live Network OS handoff must be explicit in the operations orchestrator.


## Profile-capture repair — 2026-06-16

The profile gate previously referenced `NETWORK_OS_PROFILE_CAPTURE_ENABLED` and `NETWORK_OS_PITCH_LAB_PROFILE_ENDPOINT` in runtime code without registering them in the canonical env registry or committed env examples. A deployed environment configured only with `NETWORK_OS_BASE_URL`, `NETWORK_OS_PITCH_LAB_ENDPOINT`, and `NETWORK_OS_HANDOFF_ENABLED` therefore returned `NETWORK_OS_PROFILE_URL_MISSING`, while the browser continued locally.

The sender now:

- derives `/api/intake/pitch-lab-profile` from `NETWORK_OS_BASE_URL` when no explicit profile endpoint is present;
- derives the profile endpoint from the packet endpoint as a second fallback;
- registers the canonical profile and packet endpoint variables;
- exposes a truthful synced/pending state in the founder profile UI;
- tests the derived URL, signature headers, success response, and env-registry parity.

Network OS source already contains the compatible public receiver at `/api/intake/pitch-lab-profile`; no consumer source change is required for this repair.
