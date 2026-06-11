# MVP v1 Talking AI Scooter Provider Proof Plan

**Status:** REQUIRED BEFORE CLAIMING TALKING-AVATAR MVP MEDIA COMPLETE  
**Latest proof pass:** 2026-06-10/11 sandbox/static proof executed; live provider proof is still required.

## Why this exists

The MVP v1 product contract says AI Scooter must talk at the opening, final personalized Story Card summary, and share close moments. The repo has media slots, source assets, provider-gated routes, fallback behavior, and no-fake-success checks. That is not enough by itself.

A real provider-generated, playable talking Scooter clip must exist before anyone claims the MVP media experience is complete.

## Locked truth

Do not claim that the photo talks, that ElevenLabs video works, or that the MVP media experience is complete until a real provider-generated, playable output is produced and tested.

## Current provider reality

ElevenLabs can support voice generation through the TTS API path already represented in this repo. ElevenLabs also documents image/video lip-sync capabilities that animate a source image or source video from speech audio, including image-to-video and video-to-video lip-sync models. However, the repo has not yet proven the exact API/workflow endpoint, model ID, asset ID, returned media URL, and playback lifecycle for the required MVP talking Scooter moments.

Therefore, `elevenlabs_video` remains proof-gated. It must not mark itself configured merely because an ElevenLabs API key exists.

## Required proof

1. Confirm the selected provider can create the required talking-photo/video output from the approved Scooter source asset.
2. Generate and play the cached welcome clip.
3. Generate and play the cached or lightly dynamic share-close clip.
4. Generate and play the dynamic final Story Card summary clip from an LLM-produced script.
5. Return or store a playable media URL without exposing provider internals to founders.
6. Keep the Story Card text-first; video must follow asynchronously and never block copy/share utility.
7. Confirm provider failure degrades honestly without fake success.
8. Run local provider proof and deployed post-deploy provider proof before calling this complete.

## Provider proof command

Static/dry-run proof:

```bash
npm run proof:media
```

Live proof when real provider env is configured:

```bash
MEDIA_PROOF_RUN_LIVE=true npm run proof:media
```

The command writes:

```text
tmp/scooter-media-provider-proof-report.json
```

## Env gates

`ELEVENLABS_VIDEO_ENDPOINT_CONFIRMED` must remain `false` until a real talking-photo/video endpoint/workflow is proven.

Required proof variables:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_MODEL`
- `ELEVENLABS_VIDEO_ENDPOINT_CONFIRMED`
- `ELEVENLABS_VIDEO_MODEL_ID`
- `AVATAR_PROVIDER`
- `AVATAR_DYNAMIC_GENERATION_ENABLED`
- `AVATAR_MAX_SCRIPT_CHARS`
- `AVATAR_MAX_VIDEO_SECONDS`

## Completion standard

Complete only when a founder can load the app, see the cached welcome talking Scooter moment, generate a Story Card, receive text immediately, and then receive a real playable Scooter final summary clip.

Until then, status is:

**MEDIA JOURNEY LOCKED — TALKING AVATAR PROVIDER PROOF REQUIRED.**
