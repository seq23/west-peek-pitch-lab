# MVP V1 D-ID + HeyGen Provider Wiring — 06-10-26

## Decision

D-ID is the primary talking-avatar provider. HeyGen is the secondary fallback provider. ElevenLabs remains available for voice-only proof, but it is not a native talking-photo/video provider for this app.

## Provider order

1. `AVATAR_PROVIDER=did`
2. `AVATAR_SECONDARY_PROVIDER=heygen`

The runtime attempts configured providers in order and fails honestly to static/text fallback when neither provider is configured or when provider calls fail.

## Required live D-ID values

- `DID_API_KEY`
- `DID_SOURCE_URL`
- `DID_API_BASE_URL=https://api.d-id.com`
- `DID_VOICE_PROVIDER=microsoft`
- `DID_VOICE_ID=en-US-GuyNeural`

`DID_SOURCE_URL` must be a public URL to the approved Scooter source image. A local `/assets/...` path is not enough for a remote video provider.

## Required live HeyGen values

- `HEYGEN_API_KEY`
- either `HEYGEN_AVATAR_ID` or `HEYGEN_IMAGE_URL`
- `HEYGEN_API_BASE_URL=https://api.heygen.com`

## Vault update rule

Raw provider keys must not be committed. Use `npm run env:vault:upsert-providers` with the approved `ENV_VAULT_PASSPHRASE` and local env values to merge provider credentials into `secrets/pitch-lab.env.vault.enc`.

## Proof status

- D-ID adapter: wired to `POST /talks`.
- HeyGen adapter: wired to `POST /v3/videos`.
- Local validation can prove code paths and fallback behavior without provider calls.
- Live proof requires real provider env values and a public Scooter source image URL.
