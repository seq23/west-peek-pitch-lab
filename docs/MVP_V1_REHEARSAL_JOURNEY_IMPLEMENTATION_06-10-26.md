> **Current source-of-truth note:** For MVP v1 founder experience, `docs/MVP_V1_AI_SCOOTER_EXPERIENCE_CONTRACT.md` and `docs/MVP_V1_SCOOTER_SPEAKING_AND_COST_DISCIPLINE.md` control. Older language about optional media means degraded fallback only; it does not make talking Scooter optional at the required MVP moments.

# MVP v1 Rehearsal Journey Implementation — 06-10-26

## Locked intent

The current Pitch Lab architecture remains in place. This is still the MVP v1 product experience: a polished current-stack rehearsal journey that helps founders practice out loud without adding WebRTC, sockets, storage buckets, or new provider dependencies. The fuller live/near-real-time AI Scooter coaching room remains documented separately as the later roadmap.

## MVP v1 implemented flow

1. **Practice with AI Scooter** — founders continue through the guided prompt flow.
2. **Practice Out Loud** — founders open a dedicated camera-room experience from the Story Card review studio.
3. **Camera Room Opens** — AI Scooter remains present in the product shell, the founder camera appears, and the app presents a clear pitch prompt.
4. **Countdown + Record** — the founder gets a three-second countdown and records local takes through browser-native camera/mic APIs.
5. **Playback + Coaching** — the founder can replay a take and receive structured local coaching signals from transcript/self-review text.
6. **Choose Best Take** — the founder can keep multiple takes, play them back, delete weak takes, and mark one as selected.
7. **Consent Gate** — the founder decides whether selected take transcript/status can be included with the Founder Story Packet.
8. **Share** — the packet preview includes Practice Out Loud state. Consent controls whether rehearsal transcript/status travels with the packet.

## Current-stack boundaries

The selected video file is stored locally in the founder browser through IndexedDB when available. The current repo does not upload the video file to West Peek because no video storage/upload path has been configured.

The share path can include selected take metadata and transcript/status with explicit founder consent. The UI states this plainly so the product does not imply video upload before storage infrastructure exists.

## Browser APIs used

- `navigator.mediaDevices.getUserMedia` for camera/mic access.
- `MediaRecorder` for local video recording.
- `IndexedDB` for local video blob persistence when available.
- `SpeechRecognition` / `webkitSpeechRecognition` for optional browser dictation when supported.
- `localStorage` for selected take metadata, transcript, and consent status.

## No new provider dependency

This pass intentionally avoids:

- WebRTC rooms.
- WebSocket sessions.
- live avatar streaming.
- video upload storage.
- long-running render jobs.
- external transcription APIs.

Those remain later infrastructure expansion candidates, not blockers for the MVP v1 rehearsal journey.
