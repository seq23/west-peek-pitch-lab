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
2. Generate or retrieve the cached reusable welcome clip; a committed file is optional if runtime generation/cache policy is complete.
3. Generate or retrieve the generic cached share-close clip, or generate a contextual variant scoped by session/content hash.
4. Generate the dynamic final Story Card summary clip from an LLM-produced script and cache it only for the same session/content hash.
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

Complete only when a founder can load the app, receive the reusable welcome media through cache/generation, generate a Story Card, receive text immediately, and then receive a real playable Scooter final summary generated for that session/content hash.

Until then, status is:

**MEDIA JOURNEY LOCKED — TALKING AVATAR PROVIDER PROOF REQUIRED.**


## Runtime cache contract

Required media moments do not need committed video files in the repo before the app can operate. The manifest must instead prove one of two acceptable states:

1. A committed, approved playable `src` exists; or
2. A complete runtime generation/cache contract exists with `generationMode`, `cacheStrategy`, `cacheKey`, `generationPath`, and fallback behavior.

Reusable moments such as `welcome` can use stable cache keys only when they contain no founder-specific content. Dynamic moments such as `final_summary` must use session/content-hash cache keys and must not be globally reused.
