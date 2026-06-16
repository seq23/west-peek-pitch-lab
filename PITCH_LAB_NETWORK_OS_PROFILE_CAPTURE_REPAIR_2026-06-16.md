# Pitch Lab → Network OS Profile Capture Repair

**Date:** 2026-06-16  
**Status:** Source repaired in Pitch Lab; Network OS source unchanged; live deployment proof still required.

## Incident

A founder entered name, email, and company in Pitch Lab, but no corresponding row appeared in the Network OS Google Sheets backend.

## Root cause

Pitch Lab runtime attempted to use `NETWORK_OS_PITCH_LAB_PROFILE_ENDPOINT`, but that variable was not registered in `config/env.registry.json` and did not appear in committed env examples. The deployed environment could therefore have a working packet endpoint and handoff flag while profile capture returned `NETWORK_OS_PROFILE_URL_MISSING`. The browser saved the profile locally and previously displayed a generic continuation message, hiding the remote sync failure.

## Consumer comparison

The attached Network OS source already includes:

- public route `/api/intake/pitch-lab-profile`;
- matching HMAC-SHA256 verification over `${submittedAt}.${rawBody}`;
- replay protection;
- founder profile create/update logic against the `contacts` sheet;
- an `intake_queue` append for the profile event;
- Google Sheets append readback verification;
- focused profile and handoff tests.

No Network OS source change was required for this incident.

## Pitch Lab repair

1. Added canonical packet/profile endpoint and profile-capture flag entries to the env registry and examples.
2. Added deterministic profile endpoint derivation from `NETWORK_OS_BASE_URL` or the packet endpoint.
3. Preserved legacy endpoint aliases.
4. Added signed profile-delivery regression tests.
5. Added env registry/example parity checks.
6. Replaced the ambiguous browser message with explicit `synced` or `pending` status.

## Deployment requirements

The same shared secret must be present in both deployed projects:

- Pitch Lab: `NETWORK_OS_SHARED_SECRET`
- Network OS: `PITCH_LAB_SHARED_SECRET`

Pitch Lab production must have either:

- `NETWORK_OS_BASE_URL=https://network.joinwestpeek.com`, or
- an explicit `NETWORK_OS_PITCH_LAB_PROFILE_ENDPOINT=https://network.joinwestpeek.com/api/intake/pitch-lab-profile`.

Profile capture must be enabled explicitly with `NETWORK_OS_PROFILE_CAPTURE_ENABLED=true`, or inherit an enabled `NETWORK_OS_HANDOFF_ENABLED=true` when the profile flag is absent.

## Required live proof

After applying and deploying the Pitch Lab baseline:

1. submit a unique founder profile through `/practice`;
2. confirm the Pitch Lab UI reports `synced`;
3. confirm Network OS returns an `intake_id`, `profile_id`, and database write status;
4. verify the exact email appears in both the `contacts` and `intake_queue` tabs;
5. verify the corresponding profile-capture status persists in Pitch Lab local storage;
6. clean up only registered proof fixtures if a test identity was used.
