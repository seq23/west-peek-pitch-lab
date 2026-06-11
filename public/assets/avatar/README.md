# Scooter Avatar Assets

Canonical public-safe media assets for West Peek Pitch Lab.

- `scooter-avatar-source.png` — official approved Scooter avatar source photo.
- `scooter-voice-only.mp3` — official uploaded Scooter voice recording. Primary fixed-clip voice source for D-ID `audio_url` avatar renders. Size: 4091534 bytes. SHA-256: `de55b92a091f7c7f4ca1df5a9be0b834cc4a87ce3c16140ba5262dd1f7ddbe2d`.
- `scooter-voice-only.m4a` — uploaded Scooter voice recording backup/source format. Size: 698634 bytes. SHA-256: `f8a52639bf13ff4af875ba73aed662a92d58b4ab23bf566c2ffc6a8c55800bc0`.
- `scooter-driving-video-source.mp4` — official approved driving/source video reserved for future provider workflows. Size: 27347394 bytes. SHA-256: `c46759420f2721b6270b89dcabb4f95e395fd15ba84595b166a5a15d0847fcec`.
- `clip-manifest.json` — approved media moments and render status.

Fixed reusable media should prefer uploaded Scooter audio passed into D-ID as `audio_url`. Fish Audio is reserved for dynamic custom speech generation only. ElevenLabs remains fallback-only.

API keys and provider secrets never live here.
