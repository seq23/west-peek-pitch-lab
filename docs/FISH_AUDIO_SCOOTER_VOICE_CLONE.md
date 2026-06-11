# Fish Audio Scooter Voice Clone Contract

The uploaded Scooter MP3/M4A files are voice samples, not finished welcome/share clips.

## Runtime model

1. Fish Audio creates a private reusable Scooter voice model from `public/assets/avatar/scooter-voice-only.mp3`.
2. The returned Fish model id is stored as `FISH_VOICE_REFERENCE_ID`.
3. `renderScooterVoice` calls Fish Audio `/v1/tts` with `reference_id` to generate short dynamic Scooter audio.
4. D-ID avatar rendering receives that generated short audio as `audioUrl`.
5. ElevenLabs remains fallback-only.

## Secret handling

- `FISH_API_KEY` is a server secret.
- `FISH_API_KEY` must live only in `.env.local`, encrypted vault, or Cloudflare secret storage.
- The repo may store `FISH_VOICE_REFERENCE_ID` because it is a provider model identifier, not an API key; keep it in env if account scoping requires privacy.

## Local clone command

After restoring `.env.local` from vault or setting `FISH_API_KEY` locally:

```bash
npm run fish:clone:scooter
```

The command prints only the Fish `referenceId` and model state. It never prints the API key.
