# MVP v1 AI Scooter Experience Contract

**Status:** CURRENT SOURCE OF TRUTH  
**Scope:** MVP v1 Pitch Lab product experience  
**Supersedes:** Any older implementation language that frames talking AI Scooter as optional decoration instead of the intended founder experience.

## Product standard

West Peek Pitch Lab is a private AI Scooter pitch-coaching room. It must not feel like a static website, generic form, or ordinary chatbot.

The founder should leave thinking:

> “That felt like a short coaching session with Scooter.”

Not:

- “I filled out a form.”
- “I used a chatbot.”
- “I watched a novelty avatar.”
- “Scooter maybe talks if something happens to be configured.”

## Locked MVP v1 journey

### 1. Opening: talking Scooter welcomes the founder

- Required MVP moment.
- Media model: cached or pre-rendered talking Scooter clip.
- Target: 15–25 seconds.
- Hard ceiling: 35 seconds.
- Purpose: immediately establish that the founder is in an AI Scooter coaching session.
- The welcome clip should not be dynamically regenerated for every founder.

Example direction:

> “Welcome to West Peek Pitch Lab. Good products need good stories. Tell me what you’re building, and let’s sharpen the story.”

### 2. Practice questions: Scooter stays present

- Founder answers one focused question at a time.
- Scooter remains visually present as the session host.
- The interface should communicate: “Scooter is listening.”
- We do not generate a new video for every question.
- Optional reusable encouragement clips can appear at section breaks.

### 3. Midpoint check-in: optional v1.1 coaching moment

- Optional in MVP v1, designed into the journey for later activation.
- Target: 15–25 seconds.
- Hard ceiling: 35 seconds.
- Can be cached, lightly dynamic, voice-over-static, or talking video depending on provider cost.
- Must never block progress.

### 4. Final Pitch Story Card: main dynamic talking Scooter moment

- Required MVP moment.
- Text Story Card appears first.
- Dynamic personalized talking Scooter summary follows.
- Target: 30–50 seconds.
- Hard ceiling: 65 seconds.
- This is the primary paid dynamic media moment.

The final video gives emotional coaching. The text card gives utility.

### 5. Detailed Founder Story Packet stays text-based

The detailed artifact remains text-based and copyable:

- one-line pitch
- company summary
- customer/problem/solution
- proof / traction
- founder edge
- why now
- Story Strength Snapshot
- biggest story gap
- next relationship suggestions
- copy/share controls

### 6. Share decision: Scooter closes the room

- Required MVP moment.
- Media model: cached or lightly dynamic talking Scooter close.
- Target: 12–22 seconds.
- Hard ceiling: 30 seconds.
- Consent-forward, no pressure, no guarantees.

Example direction:

> “You can keep practicing privately, or share this with West Peek for network review. No guarantees — just a chance to start the right conversation.”

## Text-first / video-follows rule

The app must not wait for dynamic video before showing the Story Card.

Correct sequence:

1. Founder submits answers.
2. App immediately shows: “Scooter is sharpening your story.”
3. LLM returns the Story Card and final Scooter script.
4. Text artifact appears immediately.
5. Short Scooter video renders/follows for the final coaching moment.
6. Copy/share remains available even when media rendering fails.

## Runtime media decision table

| Moment | Required | Media | Dynamic | Target | Hard ceiling | Blocks UI |
|---|---:|---|---:|---:|---:|---:|
| Welcome | Yes | Talking Scooter | Cached/pre-rendered | 15–25 sec | 35 sec | No |
| Question flow | Yes | Persistent visual presence | No | N/A | N/A | No |
| Section encouragement | Optional | Cached clip/audio | No | 6–12 sec | 18 sec | No |
| Midpoint check-in | Optional v1.1 | Audio/video or text | Maybe | 15–25 sec | 35 sec | No |
| Story Card text | Yes | Text artifact | Yes, LLM | concise | schema/copy limits | Yes |
| Final summary | Yes | Talking Scooter | Yes | 30–50 sec | 65 sec | No |
| Share close | Yes | Talking Scooter/audio | Cached/light dynamic | 12–22 sec | 30 sec | No |

## MVP v1 vs future V2

MVP v1 uses cached media, selected dynamic media, local camera rehearsal, and text-first coaching output.

Future V2 is the true live/near-real-time coaching room: live voice input, live transcription, live turn-taking, low-latency responses, WebRTC/websockets/streaming, and AI Scooter responding like a real-time participant.

## Degraded fallback rule

Fallback is allowed. Fake media success is not.

If a cached clip or provider render is unavailable, the app may fall back to static image and text, but the product contract remains: talking Scooter is the intended experience at the key moments.
