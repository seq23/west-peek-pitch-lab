# No-Theater Implementation Gates — West Peek Pitch Lab

**Status:** ACTIVE  
**Scope:** Phase 2 onward

## Purpose

Prevent placeholder-driven implementation and fake completion.

The app may be built in phases, but each phase must be honest about what works, what is disabled, and what remains unproven.

## Forbidden Patterns

The following are forbidden in production paths:

- hidden stubs
- fake provider success
- empty handlers
- hardcoded success responses
- `return true` authorization
- automatic contact creation from Pitch Lab
- demo credentials
- TODO comments in required paths
- UI-only consent/auth
- client-side provider secrets
- placeholder env values pushed to production
- mock LLM/voice/avatar/Network OS behavior presented as real
- “Scooter personally reviewed this” claims
- investment decision or funding guarantee language

## Allowed Placeholders

Safe placeholders are allowed only in explicit setup artifacts:

- `.env.example`
- `.env.local.example`
- locally generated `.env.local` before real values are filled
- disabled-provider UI states
- test fixtures
- explicit local/test mocks

Every placeholder must be labeled as placeholder/test/disabled. No placeholder may masquerade as production behavior.

## Phase Gates

| Phase | Required anti-theater gate |
|---|---|
| Phase 2 | Static shell cannot include fake provider behavior or fake AI output |
| Phase 3 | Local Story Card draft must be labeled non-AI until LLM is integrated |
| Phase 4 | Mock provider must be impossible to use in production mode |
| Phase 5 | Raw Scooter notes cannot enter runtime prompt until approved |
| Phase 6 | Avatar/voice disabled states must be honest; no fake render success |
| Phase 7 | Network OS handoff must prove pending intake or show honest failure |
| Phase 8 | Email card option must be disabled unless provider proof exists |
| Phase 9 | Tests cannot be weakened to pass broken outcomes |
| Phase 10 | Deploy success cannot be claimed from local build alone |

## Required Production Mode Guards

Production mode must fail closed when required providers are enabled but misconfigured:

- LLM enabled + missing Gemini key = hard runtime configuration failure or safe disabled state, not fake output
- Voice enabled + missing ElevenLabs key = safe disabled state, not fake audio success
- Avatar dynamic enabled + missing HeyGen key = safe disabled state, not fake video success
- Network OS handoff enabled + missing shared secret = no handoff and safe error
- Cloudflare deploy with placeholder secrets = blocked

## Final Rule

**Disabled is acceptable. Fake working is not.**

## Phase 2 No-Theater Gate

The static shell may show inactive routes and future-state descriptions only if the page text clearly says those functions are not active yet. It may not simulate AI coaching, avatar rendering, email delivery, or Network OS submission. Static fallback UI is allowed only when labeled as static shell behavior, not as provider success.

---

## Phase 3 Gate — Local Practice Only

Phase 3 may show a local draft Pitch Story Card shell generated from browser-local answers. It must not describe this card as AI-enhanced, reviewed by Scooter, submitted, emailed, shared, or accepted into Network OS.

Required inactive states:

- `aiEnhanced` must remain `false`.
- `shareEnabled` must remain `false`.
- Email must remain disabled.
- Network OS handoff must remain disabled.
- Provider calls must remain absent from the browser flow.

## Phase 4 no-theater gates

Phase 4 may expose AI controls only if they call the server-side AI endpoint. The server may route Gemini first and OpenAI fallback when enabled. If no configured provider succeeds, the app must show an unavailable state and must not render a hardcoded AI card.

Allowed:
- explicit local/test provider lane inside domain tests
- schema validation fixtures inside tests
- honest `ai_unavailable` responses
- local draft card clearly separated from AI-enhanced card

Forbidden:
- client-side Gemini/OpenAI API key usage
- placeholder AI story card after primary or fallback provider failure
- marking failed provider responses as `aiEnhanced`
- enabling share from AI output before Phase 7
- implying Scooter personally reviewed the pitch
- claiming funding, investment fit, meeting, review, or intro

---

## Phase 5 No-Theater Gate — Scooter Wisdom

Forbidden:

- fabricated Scooter quotes;
- raw interview material loaded into runtime;
- unapproved wisdom chunks in prompts;
- vector DB presented as implemented;
- generic founder coach copy presented as Scooter-approved interview wisdom;
- claims that Scooter personally reviewed or authored the AI response.

Required:

- approved-only runtime registry;
- explicit wisdom version;
- forbidden claims in runtime context;
- tests proving raw sources are not loaded;
- prompt contract uses approved wisdom context.

## Phase 5 Patch — Non-Optional Scooter Wisdom Invariant

Scooter Wisdom is not a feature flag, mode, optional provider, or env-controlled switch. West Peek Pitch Lab cannot run its AI coaching identity without the approved Scooter Wisdom Layer. Runtime must always load approved wisdom from `content/scooter-wisdom/approved/approved-wisdom.json`; raw wisdom is never runtime material; vector/dynamic/raw modes are not available in MVP. Env vars must not turn Scooter Wisdom on/off, select a wisdom mode, or override the approved version.

## Phase 6 No-Theater Gate

Voice and avatar media may not be represented as generated unless the corresponding server endpoint returns a real provider-backed response. Missing keys, disabled providers, provider failures, and cost-guard blocks must show an honest unavailable state. Static fallback is acceptable; fake media success is not.


## Phase 9A Pitch Lab E2E / Completeness Review

Phase 9A hardens the founder journey before design overhaul: copy-card path, qualitative Story Strength Signals, no numeric/fundability scoring, no email feature, consented share only, and confirmed-submission-only thank-you behavior. See `docs/PHASE_9A_PITCH_LAB_E2E_AND_COMPLETENESS_REVIEW.md`.
