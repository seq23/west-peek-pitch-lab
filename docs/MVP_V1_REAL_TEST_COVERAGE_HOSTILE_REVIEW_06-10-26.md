# MVP v1 Real Test Coverage Hostile Review — 06-10-26

## Status

CURRENT SUPPORTING TEST PLAN. This doc records the real-test expansion added after the media proof discussion. It is not a pixel-polish validation plan.

## Why this pass exists

Static validators and docs can confirm contracts exist, but they cannot prove important founder runtime behavior. The missing proof class was real browser behavior: camera/mic rehearsal, playback, local persistence, env-vault live proof readiness, voice proof, cached media readiness, optional founder context, and basic keyboard usability.

## Added proof layers

### 1. Founder camera rehearsal proof

Files:

- `tests/e2e/founder-camera-rehearsal-proof.spec.mjs`
- `scripts/run-camera-proof.mjs`

Commands:

```bash
npm run proof:camera
npm run proof:camera:headed
```

Covers:

- fake camera/mic happy path in Chromium;
- camera preview visibility;
- countdown and local recording;
- stop recording and local playback element;
- transcript save;
- best-take selection;
- selected-take metadata persistence;
- rehearsal consent status;
- share preview reflects rehearsal context only when consented;
- delete clears local selected-take state;
- permission denied fails honestly;
- `MediaRecorder` unavailable fails honestly;
- no local video upload claim in MVP.

### 2. Voice provider proof

Files:

- `scripts/proof-voice-provider.mjs`

Commands:

```bash
npm run proof:voice
MEDIA_PROOF_RUN_LIVE=true npm run proof:voice
npm run proof:voice:live
```

Covers:

- committed Scooter voice identity exists;
- provider status is honest;
- invalid requests fail safely;
- dry-run does not fake audio;
- live mode requires a real ElevenLabs voice render;
- response does not expose secret-shaped content.

### 3. Env-vault proof

Files:

- `scripts/env/proof-env-vault.mjs`

Commands:

```bash
npm run env:proof
ENV_VAULT_PASSPHRASE="<approved passphrase>" npm run env:proof
```

Covers:

- canonical encrypted vault exists;
- envelope cryptographic fields are present;
- vault format and algorithm are supported;
- `.env.local` is gitignored;
- optional decrypt proof checks only key names, not raw values.

### 4. Cached media manifest proof

Updated:

- `scripts/proof-scooter-media-provider.mjs`

Covers:

- required clip slots exist;
- missing cached clips are warnings in dry-run;
- configured local clip src values must exist;
- remote clip src values are accepted as references for live/provider proof.

### 5. Founder context + basic accessibility proof

Files:

- `tests/e2e/founder-context-and-accessibility-proof.spec.mjs`
- `scripts/run-real-journey-proof.mjs`

Commands:

```bash
npm run proof:journey
npm run proof:journey:headed
```

Covers:

- optional 8th question can carry manual context instead of a confidential deck;
- blank optional context does not create a blocker;
- manual context appears in the local Story Card;
- rehearsal metadata appears in share preview only when consented;
- basic keyboard/label journey works without relying only on glow or mouse;
- founder can start the practice flow from accessible labels and controls.

## Hard-fail boundary

These proof suites intentionally hard-fail on real product outcomes only:

- camera opens or fails honestly;
- recording/playback state works;
- selected take and consent metadata persist;
- env vault exists and can be proven safely;
- live voice proof works only when requested;
- optional founder context travels through the right surfaces;
- basic labels/keyboard access are present;
- no fake upload/media/success claims.

They do not hard-fail on:

- exact glow intensity;
- exact animation timing;
- pixel layout;
- every tooltip sentence;
- exact video duration down to the second;
- decorative visual polish.

## Remaining proof boundary

The repo still cannot claim talking-avatar MVP media is complete until live provider proof produces a real playable talking Scooter output for the locked MVP moments. The new proof harnesses make that testable; they do not fake completion.
