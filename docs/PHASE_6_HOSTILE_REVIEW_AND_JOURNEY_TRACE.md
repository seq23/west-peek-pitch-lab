# Phase 6 Hostile Review + User/Data Journey Trace

## Verdict

Phase 6 provider contracts are useful, but the first implementation exposed too much provider machinery in the founder UI. A founder should not see or manage a `request limited avatar final-summary` action. The experience should feel like Scooter is present in the story-card moment, not like the founder is spending a render credit.

## Correction

- Removed public voice/avatar render request buttons.
- Removed `src/runtime/mediaMomentsClient.mjs` from the public build.
- Kept server-side voice/avatar endpoints as provider contracts.
- Moved non-secret provider identity IDs out of env into `src/server/media/scooterMediaIdentity.mjs`.
- API keys remain env/vault only.
- Scooter voice and avatar should be attached by product logic after a real AI card exists, not requested by the founder as a provider operation.

## Scooter media identity rule

The ElevenLabs voice ID and managed avatar IDs are account/object identifiers, not API secrets. They can be committed as repo identity assets after approval. The actual API keys, webhook secrets, Cloudflare tokens, and vault passphrases never belong in source.

## E2E user journey trace through Phase 6

1. Founder lands on West Peek Pitch Lab and sees the product promise and AI Scooter disclosure.
2. Founder starts practice and answers seven story prompts.
3. Answers stay local in browser until AI generation is requested.
4. Founder sees a local non-AI Pitch Story Card shell.
5. Founder requests AI Pitch Story Card; server-side LLM path uses Gemini primary then OpenAI fallback if configured.
6. Scooter Wisdom is mandatory and approved-only in the AI prompt path.
7. Text card remains the primary output.
8. Voice/avatar media are backend-managed enhancements for approved moments, not visible provider controls.
9. If voice/avatar providers are unconfigured or fail, the founder keeps text/static fallback and sees no fake success.
10. Share remains inactive until Phase 7; no Network OS record or contact is created.

## Hostile superior decision on the avatar button

The limited avatar final-summary button does not belong in the founder UI in Phase 6. It creates avoidable friction, cost ambiguity, and implementation leakage. If we later want founder choice, the label should be product-level, e.g. `Play Scooter summary`, and it should operate only after a real final summary exists with provider/cost guards behind the scenes. It should not say `request avatar` or expose render mechanics.
