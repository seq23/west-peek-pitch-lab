# Scooter Avatar Assets

Canonical public-safe media assets for West Peek Pitch Lab.

- `scooter-avatar-source.png` — official approved Scooter avatar source photo.
- `scooter-voice-only.mp3` — official uploaded Scooter voice sample for cloning/reference. Not a finished welcome/share clip. Size: 4091534 bytes. SHA-256: `de55b92a091f7c7f4ca1df5a9be0b834cc4a87ce3c16140ba5262dd1f7ddbe2d`.
- `scooter-voice-only.m4a` — uploaded Scooter voice sample backup/source format. Size: 698634 bytes. SHA-256: `f8a52639bf13ff4af875ba73aed662a92d58b4ab23bf566c2ffc6a8c55800bc0`.
- `scooter-driving-video-source.mp4` — official approved driving/source video reserved for future provider workflows. Size: 27347394 bytes. SHA-256: `c46759420f2721b6270b89dcabb4f95e395fd15ba84595b166a5a15d0847fcec`.
- `clip-manifest.json` — approved media moments and render status.

The uploaded Scooter audio is a voice sample / clone source. Do not pass the full sample into D-ID as a finished welcome/share clip. D-ID `audio_url` should receive short generated or explicitly approved clip audio. Fish Audio or D-ID voice clone may generate that short audio. ElevenLabs remains fallback-only.

API keys and provider secrets never live here.


## Runtime generated media cache contract

`clip-manifest.json` does not require every MVP moment to have a committed video file. The real product path is runtime generation plus cache policy:

- `welcome` is reusable static media: generate once, review, cache by `scooter_welcome_v1`, and optionally commit as a fallback asset later.
- `final_summary` is dynamic session media: generate from the founder's Story Card script and cache only by session/content hash.
- `share_cta` may reuse a generic approved clip only when it contains no founder-specific content; contextual variants must use session/content-hash cache scope.

Committed `src` files are allowed as approved fallbacks, but no validator should require a committed video for a moment that has a complete runtime generation path and cache strategy.
