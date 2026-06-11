> **Current source-of-truth note:** For MVP v1 founder experience, `docs/MVP_V1_AI_SCOOTER_EXPERIENCE_CONTRACT.md` and `docs/MVP_V1_SCOOTER_SPEAKING_AND_COST_DISCIPLINE.md` control. Older language about optional media means degraded fallback only; it does not make talking Scooter optional at the required MVP moments.

# Phase 9D — ElevenLabs-First Master Gauntlet Plan

## Status

Phase 9D is the Pitch Lab capstone proof phase. Environment intake has now been completed for the uploaded env file and encrypted into the repo vault. Live provider, Network OS shared-secret parity, Cloudflare deployment, and headed Playwright proof remain outstanding.

## Locked Product Experience

Pitch Lab is not a text form with an optional video. The intended MVP experience is that the founder feels coached by AI Scooter.

Text can carry the detailed coaching, but talking AI Scooter media is core at key moments:

1. **Welcome / orientation** — cached or pre-rendered talking Scooter.
2. **Final personalized Pitch Story Card summary** — dynamic, concise talking Scooter.
3. **Share / close decision** — cached or lightly dynamic talking Scooter.

If a provider is unavailable, the app must degrade honestly to text/static media. That fallback is acceptable for failure handling, but it is not the intended product experience.

## MVP Provider Decision

ElevenLabs is the first MVP provider for voice and talking-photo/video.

Reasoning:

- The MVP needs one coherent provider path before optimizing for cost.
- ElevenLabs already owns the voice layer and now exposes image/video/lip-sync style workflows in its product/docs.
- Cheaper alternatives can be reassessed after the product journey works.

## Current Provider Priority

### Voice

1. ElevenLabs

### Talking Photo / Video

1. ElevenLabs image/video or lip-sync workflow if it supports the configured Scooter photo + Scooter voice/script workflow.
2. HeyGen fallback after MVP proof if ElevenLabs does not satisfy quality/cost/workflow.
3. MakeUGC secondary fallback only if needed.
4. Fish Audio, Replicate, LongCat, Hugging Face, SadTalker, and LivePortrait are future optimization/research lanes, not the MVP runtime lane.

## Required Media Inputs

- Official Scooter source photo: `public/assets/avatar/scooter-avatar-source.png`
- Optional driving video reserved path: `public/assets/avatar/scooter-driving-video-source.mp4`
- ElevenLabs voice ID: committed in `src/server/media/scooterMediaIdentity.mjs` after approval
- Provider keys: encrypted env vault only

## Required Media Moments

| Moment | Type | Dynamic | Max Target |
|---|---|---:|---:|
| Welcome | Talking Scooter | Cached / pre-rendered | 15–20 sec |
| Midpoint check-in | Optional later | Dynamic or cached | 10–15 sec |
| Final summary | Talking Scooter | Dynamic personalized | 25–40 sec |
| Share close | Talking Scooter | Cached or lightly dynamic | 10–15 sec |

## Env Timing

Real env values are the last subset of Phase 9D.

The uploaded env file has been validated against `config/env.registry.json` and encrypted into `secrets/pitch-lab.env.vault.enc`. The artifact contains no plaintext `.env.local` file.

Final 9D env subset completed:

1. uploaded env file validated against `config/env.registry.json`
2. unregistered variables rejected; none were present
3. real uploaded values encrypted into `secrets/pitch-lab.env.vault.enc`
4. plaintext `.env.local` deleted before packaging
5. no-secrets validation rerun

Outstanding env item: `NETWORK_OS_SHARED_SECRET` was uploaded blank and must be set to the same value in Pitch Lab and Network OS before live handoff proof.

## Cost Control Without Killing the Product

Cost is controlled by:

- concise scripts
- cached welcome/share clips
- one dynamic final summary as the main personalized media moment
- request-level max character/seconds caps
- provider choice after MVP proof

Cost is not controlled by making AI Scooter video optional.

## Master Gauntlet Rule

The Master Gauntlet must test talking AI Scooter as the intended experience and text/static fallback as degraded mode.


## Env Values Final Subset

Status update: the updated env upload with OpenAI key has been encrypted into the vault. A shared handoff secret was generated because the uploaded value was blank. Network OS still needs the matching receiver-side value as `PITCH_LAB_SHARED_SECRET`.

## Media Asset Intake Update — 0000023

Official Scooter driving/source video has been added at `public/assets/avatar/scooter-driving-video-source.mp4` and registered in `public/assets/avatar/clip-manifest.json`.

Owner reported that the avatar photo and driving video have also been uploaded to ElevenLabs assets. The repo does not assume a live ElevenLabs asset ID until the provider workflow exposes one and the value is intentionally recorded.
