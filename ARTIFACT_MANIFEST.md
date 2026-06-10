# Artifact Manifest — West Peek Pitch Lab

## Current artifact

- Artifact: `west-peek-pitch-lab-main_BASELINE_06-09-26_0000024.zip`
- Phase: 9D — Hostile Master Gauntlet + local dependency lock
- Source artifact: `west-peek-pitch-lab-main_BASELINE_06-09-26_0000023.zip`
- Root: `west-peek-pitch-lab-main/`

## Phase 9A changes

- Added qualitative Story Strength Signals.
- Added copy-card path for local and AI Pitch Story Cards.
- Added founder-safe confidentiality reminder.
- Added no-account / share-only-if-you-choose reassurance.
- Added what-happens-next copy to share flow.
- Added confirmed-submission-only thank-you behavior.
- Added Phase 9A audit doc, validator, and domain tests.
- Preserved scrapped Phase 8: no email-me-card feature.
- Preserved no numeric/fundability scoring rule.

## Validation run before package

- `npm run validate:all` — PASSED
- `npm run env:vault:inspect` — PASSED
- `npm run env:cloudflare:plan` — PASSED

## Not proven

- Live provider calls with real keys.
- Live deployed Cloudflare routing.
- Live deployed Network OS handoff.
- Browser Playwright Master Gauntlet in this container.
- Phase 9B design overhaul.


## Phase 9B Design Overhaul
- Applied West Peek black/white/orange visual system.
- Added repo-owned West Peek logo and mark assets under `public/assets/brand/`.
- Locked product mantra to “Good products need good stories.” and retained brand mantra “Good people should meet good people.”
- Preserved Story Strength Signals, copy-card path, consent boundaries, no-email MVP scope, and no fake provider/media success.

## Phase 9B.1 update

- Added provided West Peek logo image assets:
  - `public/assets/brand/west-peek-logo.jpg`
  - `public/assets/brand/west-peek-logo.png`
  - `public/assets/brand/west-peek-mark.png`
- Removed fabricated SVG logo/mark assets from the previous design pass.
- Added West Peek design parity report:
  - `docs/PHASE_9B1_WEST_PEEK_DESIGN_PARITY.md`
- Added validation:
  - `scripts/validate-phase9b1.mjs`
  - `tests/domain/phase9b1-contracts.mjs`
- Updated `package.json` and `_repo_validation_matrix.json` so Phase 9B.1 is admitted to current hard-fail validation.

## Phase 9D Provider/Gauntlet Patch

- Added official Scooter avatar source photo: `public/assets/avatar/scooter-avatar-source.png`.
- Added reserved driving-video path documentation: `public/assets/avatar/README.md`.
- Updated media identity to ElevenLabs-first MVP voice + talking-photo/video.
- Added Master Gauntlet docs, Playwright config, fixtures, runner, static preview server, and validator.
- Real env values remain the final Phase 9D subset and are not included in plaintext.

## Phase 9D Provider/Gauntlet Patch

- Added official Scooter avatar source photo: `public/assets/avatar/scooter-avatar-source.png`.
- Added reserved driving-video path documentation: `public/assets/avatar/README.md`.
- Updated media identity to ElevenLabs-first MVP voice + talking-photo/video.
- Added Master Gauntlet docs, Playwright config, fixtures, runner, static preview server, and validator.
- Real env values remain the final Phase 9D subset and are not included in plaintext.


## Phase 9D Env Vault Intake Patch

- Parsed uploaded env txt file against `config/env.registry.json`.
- Unknown uploaded keys: 0.
- Uploaded keys accepted: 62.
- Registry variables encrypted into vault: 74.
- Real uploaded values encrypted into `secrets/pitch-lab.env.vault.enc`.
- Added env intake audit: `docs/PHASE_9D_ENV_INTAKE_AUDIT.md`.
- Patched Cloudflare env plan script to read array-shaped vault payloads correctly when using `--from-vault`.
- Deleted plaintext `.env.local` before validation and packaging.
- Outstanding: `NETWORK_OS_SHARED_SECRET` was uploaded blank and must be set before live Network OS handoff proof.
- Outstanding: headed Playwright Master Gauntlet, live ElevenLabs provider proof, and deployed Cloudflare proof remain not run.


## Phase 9D Env Intake Update — 0000022

- Updated encrypted env vault from the latest uploaded env file.
- Added OpenAI API key into encrypted vault.
- Generated `NETWORK_OS_SHARED_SECRET` because uploaded value was blank.
- Added approved ElevenLabs Coach Scooter voice ID to `src/server/media/scooterMediaIdentity.mjs`.
- Added `docs/runbooks/NETWORK_OS_SHARED_SECRET_SYNC.md`.
- Plaintext env files were deleted before packaging.
- Live Network OS receiver sync remains outstanding.

## Phase 9D Media Asset Intake Update — 0000023

- Added official Scooter driving/source video: `public/assets/avatar/scooter-driving-video-source.mp4`.
- Updated `public/assets/avatar/clip-manifest.json` so required AI Scooter media moments now have source photo + driving video ready status.
- Added media intake audit: `docs/PHASE_9D_MEDIA_ASSET_INTAKE_AUDIT.md`.
- ElevenLabs dashboard upload was reported complete by owner for the avatar photo and driving video.
- Live ElevenLabs API proof remains outstanding until provider workflow/asset IDs are confirmed and provider calls are run.

## Phase 9D Hostile Master Gauntlet Update — 0000024

- Replaced thin 4-test Master Gauntlet with hostile max-depth Playwright suite: 13 behavioral tests across desktop and mobile projects.
- Added first-class local dependency lock for `@playwright/test` so `npm ci` works before GitHub setup.
- Expanded gauntlet proof to cover public routes, navigation, answer validation, local persistence, local Story Card copy path, qualitative-only signals, AI unavailable state, AI success copy-only state, share consent gating, Network OS failure, Network OS success, thank-you truthfulness, media fallback, and UI secret exposure checks.
- Removed runtime-facing “fundability score” language and replaced it with funding-prediction / investment-rating language.
- Hardened `validate:master-gauntlet` so it scans all relevant runtime surfaces and refuses thin gauntlet coverage.
- Local static validation passed. Browser execution still requires local Playwright browser runtime / headed run.


## Phase 9D.1 Gauntlet Assertion Patch — 0000025
- Fixed hostile gauntlet false-positive promise detection so explicit negative boundary copy is allowed.
- Fixed localStorage test seeding so share-status receipts are not wiped on navigation to thank-you.
- Maintains 13 behavioral tests across desktop and mobile.

## Network Sync Semantics Patch — 06-10-26

- Reframed Pitch Lab handoff guard from stale “no contact auto-create” semantics to current “profile/database upsert allowed; auto-execution/follow-up promise forbidden” semantics.
- Updated Network OS handoff contract docs to allow database-backed profile upsert while preserving no outreach, no intro, no investment review, and no guaranteed follow-up.
- Added superseded headers to stale historical docs that still mention old `pitch_practice`, `deal_flow`, or `pitch_story_card` handoff framing.
- Updated share and thank-you UI copy to show database write status instead of contact-creation status.
- Updated hostile Master Gauntlet copy expectations.

Validation run before package:

- `npm run validate:all` — PASSED

Not proven:

- Browser Playwright execution.
- Live deployed Network OS handoff.
- Postdeploy functions/E2E.
