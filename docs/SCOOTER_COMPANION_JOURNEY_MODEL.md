# AI Scooter Companion Journey Model

Pitch Lab is a conversational UI with a structured engine. The founder should feel like they are talking to AI Scooter while the app captures structured story fields behind the scenes.

## Core rules

- AI Scooter remains visible throughout the session.
- Desktop uses a sticky side companion.
- Mobile uses a compact sticky top companion.
- The camera appears only in optional Practice Out Loud mode after the Pitch Story Card exists.
- Text first. Video follows. Video never blocks the Pitch Story Card.
- Founder Story Packet sharing is optional and consent-gated.
- The packet is for network review and relationship routing, not investment review.

## States

welcome_ready, profile_gate_ready, deck_context_optional, practice_listening, practice_encouraging, midpoint_checkin_ready, story_reviewing, story_text_ready, final_video_pending, final_video_ready, final_video_unavailable, practice_out_loud_ready, share_decision, handoff_pending, handoff_confirmed, handoff_failed, update_later.

## Media moments

welcome_cached, practice_idle, practice_encouragement, midpoint_checkin, final_summary_dynamic, share_close_cached, practice_out_loud_prompt.

## Practice Out Loud

Practice Out Loud is local-first. Browser MediaRecorder captures local playback only. No env var or pay-as-you-go provider is required for MVP. Upload/storage/transcoding remain future-gated and default off.
