# MVP v1 Scooter Speaking and Cost Discipline

**Status:** CURRENT SOURCE OF TRUTH  
**Scope:** when AI Scooter speaks, when text is enough, and how paid media remains controlled without damaging the coaching-session feel.

## Principle

Cost control comes from moment selection, caching, reuse, duration targets, render caps, and honest fallback.

Cost control must not turn Scooter into a mute form mascot.

## Required speaking moments

Scooter must speak at these MVP v1 moments:

1. **Welcome** — cached/pre-rendered clip.
2. **Final personalized coaching summary** — dynamic talking Scooter clip after the text Story Card appears.
3. **Share close** — cached or lightly dynamic clip.

## Optional speaking moments

Scooter may speak at:

- section encouragement transitions
- midpoint check-in after 3–4 answers
- return-user greeting
- “improve this section” coaching moments

These are optional expansion points, not blockers for MVP v1.

## Text-only moments

Scooter does not need paid media for:

- every practice question
- every validation message
- every tooltip/helper
- every field explanation
- every legal disclosure
- every packet detail
- every share preview line

The detailed Founder Story Packet stays text-based.

## Speaking length guidance

These are editorial targets, not brittle word-count traps. The system should aim for concise, human-feeling coaching and use duration ceilings as safety rails and word ranges as editorial guidance.

| Moment | Target length | Hard ceiling | Notes |
|---|---:|---:|---|
| Welcome | 15–25 sec | 35 sec | Warm, premium, clear. |
| Section encouragement | 6–12 sec | 18 sec | One focused nudge. |
| Midpoint check-in | 15–25 sec | 35 sec | Responsive but not deep analysis. |
| Final personalized summary | 30–50 sec | 65 sec | Main dynamic coaching moment. |
| Share close | 12–22 sec | 30 sec | Consent-forward, no pressure. |

## Script guidance

- Write in Scooter’s coaching voice.
- Be direct, warm, specific, and useful.
- Prefer 2–5 short sentences.
- Mention only the most important coaching signal.
- Do not verbally summarize the entire card.
- Do not repeat legal disclaimers except in the share close.
- Do not use “as an AI.”
- Do not provide legal, tax, securities, or investment advice.
- Do not discuss unrelated topics.
- Do not promise funding, meetings, intros, investment review, acceptance, a response, or follow-up.

## Dynamic script ranges

| Dynamic script | Comfort word range | Hard ceiling |
|---|---:|---:|
| Midpoint check-in | 55–95 | 130 |
| Final personalized summary | 100–165 | 220 |
| Share close, if dynamic | 45–85 | 85 |

## Render/cost controls

- Welcome clip should be cached/pre-rendered.
- Share close should be cached or lightly dynamic.
- Final personalized summary is the main dynamic video render.
- Dynamic video should not be generated for every question.
- One dynamic final summary render per Story Card generation by default.
- Provider failures must degrade honestly to text/static media.
- Founder UI must not expose provider internals, API keys, render controls, or internal handoff language.

## Provider evaluation requirement

Provider 9D evaluation must test whether a provider can support:

1. cached welcome clip
2. dynamic 30–50 second final coaching clip
3. cached/lite share close clip
4. acceptable likeness/voice quality
5. sane cost at 100 users/month
6. API workflow that does not create operational chaos
7. no fake success states
