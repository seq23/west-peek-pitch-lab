# Avatar + Voice Provider Plan — AI Scooter

**Status:** Phase 1 contract — updated after provider decision  
**Locked direction:** Managed provider path. No open-source avatar rendering in the app path.

## 1. Purpose

AI Scooter is the warm visual and emotional interface for West Peek Pitch Lab. The avatar supports trust, warmth, and brand feel, but the product outcome remains the Pitch Story Card.

The app must never become “generic AI with Scooter's face.” It must combine:

1. Scooter's approved likeness/photo;
2. Scooter's approved voice via ElevenLabs;
3. Scooter Wisdom Layer content;
4. broader LLM founder/VC storytelling intelligence;
5. clear AI disclosure and consent boundaries.

## 2. Provider Decision

The open-source avatar-rendering path is rejected for the product implementation path because the operational burden is too high and output quality/reliability is not consistent enough for this brand surface.

Approved provider posture:

- **Avatar video provider:** ElevenLabs first.
- **Fallback managed provider:** MakeUGC if it proves cheaper/better for the exact workflow.
- **Voice provider:** ElevenLabs for Scooter's approved/authorized voice.
- **LLM provider for V1 cost path:** Gemini first.
- **Main coaching surface:** talking-Scooter-at-key-moments, with text carrying detailed coaching.

## 3. V1 Experience Model

V1 should not generate a new avatar video for every AI response.

Recommended V1 experience:

1. Founder sees AI Scooter visually throughout the flow.
2. A reusable Scooter welcome clip plays at the beginning.
3. Main coaching happens through text responses.
4. Selected key moments may use Scooter voice audio.
5. Avatar video generation is reserved for high-value moments only, such as:
   - welcome intro;
   - transition into Pitch Story Card;
   - final summary;
   - share-with-West-Peek CTA.

This keeps the product premium while controlling cost, latency, and implementation complexity.

## 4. Voice Architecture

ElevenLabs is the voice authority.

Preferred flow for generated video moments:

1. LLM creates short approved script.
2. ElevenLabs generates Scooter voice audio.
3. HeyGen uses the uploaded/attached audio to render the avatar video.
4. The app displays the video only if render succeeds.
5. If video render fails, the app falls back to text/audio/static avatar.

Voice/audio may be used more frequently than video because audio is cheaper and faster than avatar video.

## 5. Video Architecture

HeyGen is the default managed avatar provider.

MakeUGC remains a fallback only if it provides a better price/API/quality path for:

- Scooter photo avatar;
- script or uploaded audio input;
- manageable render time;
- pay-as-you-go or low-commitment pricing;
- acceptable API behavior.

## 6. Cost Guardrails

The app must include cost controls before dynamic provider usage is enabled.

Required env-controlled guardrails:

- `COST_GUARD_ENABLED=true`
- `VOICE_DAILY_MAX_RENDERS=50`
- `AVATAR_DAILY_MAX_RENDERS=5`
- `AVATAR_MONTHLY_MAX_RENDERS=50`
- `AVATAR_DYNAMIC_GENERATION_ENABLED=false` by default
- `AVATAR_RENDER_FINAL_SUMMARY_ONLY=true` if dynamic video is enabled
- `AVATAR_MAX_SCRIPT_CHARS=900`
- `AVATAR_MAX_VIDEO_SECONDS=45`

No implementation should silently render unlimited paid video.

## 7. Required Disclosures

Near avatar:

> AI Scooter is an AI storytelling coach inspired by Scooter Taylor. This is not the real-time human Scooter and does not represent an investment decision or guarantee of review, funding, or a meeting.

## 8. Provider Contract

Future provider abstractions should support:

- provider name;
- provider configured/missing status;
- static image URL;
- reusable intro video URL;
- approved clip manifest;
- optional text-to-speech render;
- optional video render;
- render cost guard checks;
- safe failure response;
- no secret exposure to client.

## 9. Failure Behavior

If ElevenLabs fails:

- app must still show text response;
- app must not fake audio success;
- user should still complete pitch practice.

If HeyGen/avatar provider fails:

- app must still load;
- static Scooter image/fallback remains;
- founder can still complete pitch practice;
- no fake provider success;
- health route reports configured/missing without printing secrets.

## 10. Approval Requirements

Before public deployment:

- Scooter approves main image use;
- Scooter approves voice clone/use;
- Scooter approves AI-avatar positioning;
- Scooter approves initial intro script;
- West Peek approves disclosure language;
- no generated clip implies live human Scooter participation;
- no generated clip implies real Scooter personally reviewed a pitch.

## 11. V1 Non-Goals

V1 must not require:

- real-time avatar response for every AI message;
- open-source Colab/notebook rendering;
- founder auth;
- vector database;
- deck upload;
- paid email provider;
- unlimited paid video generation.
