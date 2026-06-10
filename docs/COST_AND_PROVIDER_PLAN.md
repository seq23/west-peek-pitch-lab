# Cost and Provider Plan — West Peek Pitch Lab

**Status:** Phase 1 contract  
**Goal:** Lowest-cost practical build without pretending brittle free avatar tooling is good enough.

## 1. Lowest-Cost Practical Stack

The approved low-cost build path is:

| Layer | Provider | Cost Posture | Rule |
|---|---|---|---|
| Hosting / serverless | Cloudflare | Free tier first | Use existing Cloudflare-compatible approach |
| LLM reasoning | Gemini | Free-tier / low-cost first | Server-side only |
| Voice | ElevenLabs | Paid/limited use | Scooter voice for key moments |
| Avatar video | HeyGen | Pay-as-you-go / limited use | Dynamic video only for high-value moments |
| Avatar fallback | Static Scooter image | Free | Always available |
| CRM | Existing Network OS | Already owned | No duplicate CRM |
| Email | Disabled in V1 | $0 | Copy/download card instead |
| Vector DB | None in V1 | $0 | Static approved wisdom first |

## 2. Product Experience Cost Strategy

The app should feel like AI Scooter without rendering paid video for every response.

Approved V1 usage pattern:

1. **Video:** reusable welcome clip.
2. **Text:** main coaching flow.
3. **Voice:** optional Scooter audio for selected responses.
4. **Video:** optional final/high-value moment only.
5. **Static fallback:** always available.

This gives founders a premium experience while preventing paid-render runaway.

## 3. Provider Priority

### LLM

1. Gemini first for lowest-cost/free-tier path.
2. OpenAI remains optional fallback only.

### Voice

1. ElevenLabs for Scooter's actual approved voice.
2. Voice is more important than frequent video because it carries Scooter's presence at lower cost.

### Avatar

1. ElevenLabs first.
2. MakeUGC fallback if pay-as-you-go/API fit is better.
3. No open-source avatar rendering in the product path.

## 4. Cost Guardrail Requirements

Before dynamic provider usage is enabled, the app must enforce:

- `COST_GUARD_ENABLED=true`
- voice daily render cap;
- avatar daily render cap;
- avatar monthly render cap;
- max script length;
- max video seconds;
- dynamic avatar disabled by default;
- final-summary-only dynamic video mode by default.

Provider calls must fail closed when cost guardrails are missing.

## 5. V1 Paid Usage Policy

V1 should spend only where it improves founder trust:

- Use ElevenLabs for approved Scooter voice moments.
- Use HeyGen for a small number of reusable clips and possibly final summary tests.
- Do not pay for email, auth, database, vector DB, or deck storage in V1.

## 6. Future Upgrade Gates

Dynamic avatar generation for every response may be considered only if all are true:

1. Founder flow is validated.
2. Pitch Story Card quality is strong.
3. Provider cost is acceptable.
4. Render latency is acceptable.
5. Cost guardrails are implemented and tested.
6. User explicitly approves the upgrade.

## Phase 6 Cost Guard Boundary

Phase 6 enforces request-level cost controls: script length, estimated video length, disabled-by-default avatar rendering, and final-summary-only avatar rendering by default. Daily/monthly cap env vars are registered for deployment policy, but persistent metering is not claimed until a durable store exists. This avoids pretending in-memory counters are reliable quota control.
