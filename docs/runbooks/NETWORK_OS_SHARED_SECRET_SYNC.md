# Network OS Shared Secret Sync Runbook

Status: ACTIVE
Scope: Phase 9D Pitch Lab → Network OS signed handoff

## Purpose

Pitch Lab signs handoff requests to Network OS. Network OS verifies those requests before accepting a pending human-review intake.

This requires one matching shared secret in two places:

| App | Env key | Purpose |
|---|---|---|
| Pitch Lab | `NETWORK_OS_SHARED_SECRET` | Signs outgoing Pitch Lab handoff requests |
| Network OS | `PITCH_LAB_SHARED_SECRET` | Verifies incoming Pitch Lab handoff requests |

The value must be identical.

## Current Phase 9D State

A new high-entropy shared secret was generated during the Phase 9D env intake and encrypted into the Pitch Lab vault.

The plaintext value is intentionally not written into repo docs, source files, examples, logs, or artifacts.

## How to sync it

Preferred path:

1. Restore the Pitch Lab local env from the encrypted vault in a safe local shell.
2. Copy only the value of `NETWORK_OS_SHARED_SECRET`.
3. Add that same value to Network OS as `PITCH_LAB_SHARED_SECRET` in Cloudflare / local env.
4. Delete any plaintext local env files after syncing.

Do not create a second secret for Network OS.

## Required proof before live handoff

- Pitch Lab has `NETWORK_OS_SHARED_SECRET` configured.
- Network OS has matching `PITCH_LAB_SHARED_SECRET` configured.
- Bad signature request is rejected.
- Missing signature request is rejected.
- Correctly signed Pitch Lab request is accepted as `pending_human_review`.
- No contact is auto-created.

## Safety rule

Never print the shared secret in logs, browser UI, screenshots, repo docs, or committed files.
