> **SUPERSEDED FOR NETWORK OS HANDOFF** — Historical planning reference only. Current handoff law is `founder_profile_lead` → `founder_story_packet` with `trigger_intent: relationship_routing`, Network OS database upsert, no email notification, no auto-execution, and no guaranteed follow-up. Do not use stale `pitch_practice`, `deal_flow`, or `pitch_story_card` framing for current implementation.

# Implementation Phase Plan — West Peek Pitch Lab

**Status:** Approved and locked  
**Phase 0:** Complete  
**Phase 1:** Complete / structurally checked  
**Phase 2+:** Not started

## Governing Implementation Rules

- Target product complexity is **Level 5** for planning and proof because the app is founder-facing, provider-integrated, consent/PII-adjacent, and connected to Network OS deal-flow intake.
- Phase sequencing is allowed; validation downgrades are not.
- Maximum reasonable Playwright depth is required for the target complexity.
- A dedicated Master Gauntlet suite is required before full product COMPLETE.
- No hidden stubs, fake provider success, production mocks, UI-only consent, or placeholder production behavior.
- Network OS remains the CRM. Pitch Lab must not create a duplicate CRM.
- No automatic contact creation from Pitch Lab submissions.
- Human review is required for all Pitch Lab deal-flow submissions.
- Disabled provider states are acceptable; fake working provider states are forbidden.

## Phase 0 — Final Build Approval

**Status:** COMPLETE / LOCKED

Approved decisions:

- West Peek Pitch Lab
- Pitch Practice with Scooter
- Good products need good stories.
- Good people should meet good people.
- warm founder coaching room
- AI Scooter avatar
- Scooter Wisdom Layer
- LLM founder/VC storytelling layer
- Pitch Story Card
- consented share
- Network OS handoff
- text-first coaching
- ElevenLabs for Scooter voice
- ElevenLabs first for managed avatar video
- MakeUGC fallback
- Gemini-first low-cost LLM path

## Phase 1 — Product Docs and Contracts

**Status:** COMPLETE / STRUCTURALLY CHECKED — LOCAL VALIDATION REQUIRED

Delivered artifacts:

- `REPO_IDENTITY.md`
- `REPO_VALIDATION_MATRIX.md`
- `ARCHITECTURAL_DECISIONS.md`
- `ENVIRONMENT_VARIABLES.md`
- `docs/PITCH_LAB_PRODUCT_SPEC.md`
- `docs/SCOOTER_WISDOM_LAYER.md`
- `docs/NETWORK_OS_HANDOFF_CONTRACT.md`
- `docs/PRIVACY_AND_CONSENT_MODEL.md`
- `docs/AVATAR_PROVIDER_PLAN.md`
- `docs/COST_AND_PROVIDER_PLAN.md`
- `docs/ENVIRONMENT_VAULT_PLAN.md`
- `docs/runbooks/ENVIRONMENT_SETUP.md`
- `docs/VALIDATION_SIMPLIFICATION_MATRIX.md`
- `docs/PLAYWRIGHT_MASTER_GAUNTLET_PLAN.md`
- `docs/NO_THEATER_IMPLEMENTATION_GATES.md`
- `docs/PHASE_2_PLUS_HOSTILE_REVIEW.md`

## Phase 1A — Deterministic Environment Vault Addendum

This addendum is part of Phase 1 and must remain complete before Phase 2 begins.

Required env artifacts:

- `config/env.registry.json`
- `.env.example`
- `.env.local.example`
- `scripts/env/create-local-env.mjs`
- `scripts/env/create-env-vault.mjs`
- `scripts/env/inspect-env-vault.mjs`
- `scripts/env/write-cloudflare-env-plan.mjs`
- `scripts/env/restore-local-env-from-vault.mjs`
- `secrets/pitch-lab.env.vault.enc`
- `docs/ENVIRONMENT_VAULT_PLAN.md`
- `docs/runbooks/ENVIRONMENT_SETUP.md`

Rules:

- Local `.env.local` must be script-generated from the registry.
- The encrypted vault is the persistent repo-safe env value carrier.
- Cloudflare env setup must come from the registry/vault, not memory or dashboard-only setup.
- Phase 1 Cloudflare sync is dry-run-by-default.
- Real apply behavior requires later explicit approval.
- Placeholder env values may exist locally and in examples only; they must be blocked from production sync/deploy.

## Phase 1B — Cost + Managed Provider Addendum

This addendum is part of Phase 1 and must remain complete before Phase 2 begins.

Locked provider posture:

- Gemini first for LLM cost control.
- ElevenLabs for Scooter's approved voice.
- ElevenLabs first for managed avatar video.
- MakeUGC fallback only if its API/pricing is better for the exact workflow.
- No open-source avatar rendering in the app path.
- Detailed coaching is text-supported, while talking AI Scooter is core at key moments.
- Voice may be used more often than video.
- Avatar video is limited to reusable or high-value moments.
- Cost guardrails are mandatory before dynamic provider calls.

## Phase 2 — Static Public App Shell

**Status:** NOT STARTED

Build:

- landing page
- brand system
- Scooter avatar card
- basic routes
- privacy/disclaimer pages
- how-it-works page if useful

Required routes:

- `/`
- `/practice`
- `/story-card`
- `/share`
- `/thank-you`
- `/privacy`
- `/terms`

Required UI copy:

- West Peek Pitch Lab
- Good products need good stories.
- Good people should meet good people.
- AI Scooter is an AI storytelling coach inspired by Scooter Taylor.

Required anti-theater rules:

- No fake AI output.
- No fake avatar output.
- No fake voice output.
- No fake Network OS submission.
- No provider stubs in production paths.
- Static avatar fallback must be labeled as fallback/intro surface, not proof of video provider.

Required validation:

- build
- typecheck
- static route smoke
- locked copy validator
- disclosure validator
- visual smoke desktop/mobile
- Playwright Phase 2 route smoke
- no-secrets check
- env registry check

Highest honest status if only Phase 2 passes:

- `STRUCTURALLY CHECKED — LOCAL VALIDATION REQUIRED` or `PARTIAL`, not full product COMPLETE.

## Phase 3 — Pitch Practice Flow

**Status:** NOT STARTED

Build:

- guided questions
- answer state
- progress flow
- input validation
- local Pitch Story Card shape
- founder can exit without sharing
- no login required

Required questions:

1. What are you building?
2. Who is it for?
3. What painful problem does it solve?
4. Why now?
5. Why are you or your team the right people?
6. What proof or traction do you have?
7. What kind of help, people, capital, customers, partners, or strategic relationships do you need next?

Required anti-theater rules:

- Local Story Card draft must be clearly code-generated/non-AI until LLM integration exists.
- No pretend pitch critique.
- No hidden capture.
- No share payload without explicit consent.

Required validation:

- domain tests for question flow
- input validation tests
- consent tests
- local Story Card schema tests
- Playwright non-AI founder journey
- refresh/re-entry where applicable
- exit-without-share proof

## Phase 4 — LLM Integration

**Status:** NOT STARTED

Build:

- server-side LLM provider
- Gemini-first low-cost path
- optional OpenAI fallback contract only
- pitch critique prompt
- story card prompt
- safe failures
- no client-side keys
- LLM output schema validation

Required anti-theater rules:

- Mock provider allowed only in explicit test/local lane.
- Mock provider must be impossible to use silently in production.
- Malformed LLM output must fail safely, not become fake success.
- No claim that real Scooter reviewed anything.
- No investment decision language.

Required validation:

- LLM success tests
- LLM missing-key tests
- malformed-output tests
- prompt guardrail tests
- provider failure tests
- server-only secret exposure checks
- Playwright AI success/failure journey

## Phase 5 — Scooter Wisdom Layer

**Status:** NOT STARTED

Build:

- approved wisdom content structure
- prompt integration
- forbidden claims validator
- update/approval workflow
- raw vs approved material separation

Required content lanes:

- `content/scooter-wisdom/raw/`
- `content/scooter-wisdom/approved/`

Required anti-theater rules:

- Raw Scooter material cannot enter runtime prompts automatically.
- Only approved wisdom can be used by the app.
- Generic AI with Scooter's face is a product failure.
- Forbidden claims must be validated.

Required validation:

- approved-only wisdom validator
- forbidden-claim tests
- prompt inclusion tests
- Playwright check that founder-visible language does not imply real Scooter review

## Phase 6 — Voice + Avatar Integration

**Status:** NOT STARTED

Build:

- ElevenLabs voice provider config for Scooter's approved voice
- ElevenLabs-first managed avatar provider config
- MakeUGC fallback provider contract
- intro clip embed
- static fallback
- text-first main coaching
- voice for selected coaching moments
- avatar video only for limited/high-value moments
- provider health checks
- cost guardrails before dynamic provider calls

Required anti-theater rules:

- Voice disabled state must be honest.
- Avatar disabled state must be honest.
- Provider failure cannot show fake success.
- Dynamic avatar generation must be off by default until cost guards and provider proof exist.
- No client-side ElevenLabs, HeyGen, or MakeUGC keys.

Required validation:

- ElevenLabs disabled/failure tests
- HeyGen disabled/failure tests
- MakeUGC fallback contract tests when used
- cost guard tests
- provider env tests
- server-only secret checks
- Playwright provider-disabled/fallback UI states

## Phase 7 — Network OS Handoff

**Status:** NOT STARTED

Build:

- Pitch Lab consent gate
- payload builder
- signed/secret-protected handoff
- Network OS `pitch_lab` endpoint
- pending review UI/labels
- no auto-contact creation

Required mapping:

- `source = pitch_lab`
- `capture_type = pitch_practice`
- `person_type = founder`
- `trigger_intent = deal_flow`
- `deal_flow_prospect = yes / unknown`
- `human_review_required = true`
- `execution_allowed = false`
- `review_status = pending_human_review`

Required anti-theater rules:

- Payload shape alone is not proof.
- Success toast alone is not proof.
- Network OS handoff must prove pending intake or show honest failure.
- No automatic contact creation.
- No hidden dashboard-only setup.

Required validation:

- signed request tests
- unsigned request rejection
- consent-required tests
- payload mapping tests
- Network OS persistence/readback proof
- no-auto-contact test
- reviewer convert/dismiss/request-more-info path where available
- Playwright consented-share path
- postdeploy critical-lane E2E before deployed COMPLETE

## Phase 8 — Email Card Option

**Status:** OPTIONAL / DEFERRED

Build only after provider choice:

- email me my Pitch Story Card
- email consent
- delivery failure handling

Required anti-theater rules:

- Email must remain disabled unless provider proof exists.
- Emailing card does not imply sharing with West Peek.
- Share with West Peek requires separate consent.

Required validation:

- email consent tests
- disabled email state tests
- provider failure tests if enabled
- server-only secret checks

## Phase 9 — E2E and Hostile Validation

**Status:** NOT STARTED

Run:

- typecheck
- build
- validators
- domain tests
- provider failure tests
- consent/privacy tests
- Network OS handoff tests
- secret checks
- visual smoke
- Playwright Master Gauntlet
- hostile review loop

Master Gauntlet must cover:

- anonymous practice without sharing
- share with consent
- no share without consent
- LLM failure
- voice/avatar failure
- Network OS failure
- duplicate submission
- refresh/re-entry
- mobile sanity
- no misleading Scooter/investment claims
- no auto-contact creation

## Phase 10 — Packaging / Deployment

**Status:** NOT STARTED

Deliver:

- full baseline ZIP
- reopened ZIP proof
- structural checks
- honest status label
- local updater path where applicable

Deployment proof requirements:

- Cloudflare env plan generated from registry/vault
- placeholder production values blocked
- deployed smoke with explicit deployed base URL
- provider status safe responses
- postdeploy critical-lane E2E after Network OS handoff exists
- GitHub Actions verification if workflows exist

## Phase 11 — Optional Post-MVP Upgrades

**Status:** FUTURE ONLY

Potential upgrades:

- founder account / saved sessions
- deck upload
- dynamic avatar video per session
- vector Scooter Wisdom Layer
- founder network matching
- internal scoring/routing

Rules:

- Each upgrade must trigger repo/app initialization review.
- Each upgrade must update the validation matrix.
- Each upgrade must update architectural decisions.
- High-risk additions may move the repo to Level 6.

## Final Rule

**Phase order controls sequencing. The validation matrix controls truth. The Master Gauntlet controls product completion. No theater.**

## Phase 2 Execution Note

Phase 2 may implement only the static public app shell. Provider integrations, AI coaching, email delivery, and Network OS handoff must remain absent. The static shell must truthfully disclose that no provider calls are active and must not present any generated pitch content, avatar video, or submission state as real.

---

## Phase 3 Execution Update — Local Pitch Practice Flow

**Status:** Implemented in artifact `west-peek-pitch-lab-main_BASELINE_06-09-26_0000005.zip`.

Phase 3 adds the local founder practice flow only. It does not add LLM, ElevenLabs, HeyGen, MakeUGC, email, auth, database, or Network OS handoff runtime behavior.

### Implemented Phase 3 Surfaces

- Seven locked founder questions.
- Browser-local answer state.
- Back/edit behavior.
- Progress indicator.
- Input minimum and maximum validation.
- Live local draft Pitch Story Card preview.
- `/story-card` local draft card route.
- `/share` inactive consent boundary.

### Phase 3 No-Theater Boundaries

- The local draft card is not AI-enhanced.
- Sharing remains inactive.
- Email remains inactive.
- No Network OS intake is created.
- No contact is created.
- No human review is implied.
- No provider call is made.

### Phase 3 Validation

- `npm run validate:phase3`
- `tests/domain/phase3-contracts.mjs`
- Existing Phase 1/2 validators remain active.
- `npm run validate:all` includes Phase 3 checks.

## Phase 4 execution addendum — server-side LLM integration

Status: IMPLEMENTED IN PHASE 4 ARTIFACT.

Phase 4 adds the Gemini-first server-side AI coaching contract with an OpenAI fallback router for cheapest practical resilience. The app now has a real `/api/pitch/analyze` and `/api/pitch/story-card` Pages Functions path backed by schema validation, provider routing, and provider failure handling. The browser never receives or references provider secrets. When Gemini/OpenAI are not configured, the UI and API return honest AI-unavailable states and do not display placeholder AI output.

Phase 4 includes:
- server-side answer validation before provider calls
- Gemini provider abstraction
- OpenAI fallback provider
- lowest-cost routing order: Gemini first, OpenAI fallback when enabled
- provider-attempt recording by provider name only
- explicit local/test provider lane for domain tests only
- strict JSON prompt contract
- schema validation for critique and Pitch Story Card
- malformed provider output failure path
- missing primary and fallback API key failure path
- AI disclosure and investment/review/funding boundary preservation
- share remains disabled
- voice/video/email/Network OS remain off

Phase 4 does not include:
- ElevenLabs voice
- HeyGen or MakeUGC video
- Scooter Wisdom runtime injection
- Network OS handoff
- email card delivery
- auth
- database or persistence beyond browser-local practice answers

---

## Phase 5 Execution Note — Scooter Wisdom Layer

**Status:** Phase 5 implemented as approved static seed runtime.

Phase 5 adds:

- raw/approved content folder separation;
- approved wisdom JSON registry;
- runtime Scooter Wisdom context builder;
- prompt integration;
- forbidden-claims guardrails;
- no fabricated Scooter quote rule;
- no vector DB MVP rule;
- validators and domain tests.

No new provider, API key, vector DB, auth, email, avatar, voice, or Network OS behavior is introduced in Phase 5.

Completion boundary: Phase 5 proves that AI prompts can include approved wisdom only. It does not prove live Gemini/OpenAI quality, live Scooter interview content, or human approval of future Scooter interview material.

## Phase 5 Patch — Non-Optional Scooter Wisdom Invariant

Scooter Wisdom is not a feature flag, mode, optional provider, or env-controlled switch. West Peek Pitch Lab cannot run its AI coaching identity without the approved Scooter Wisdom Layer. Runtime must always load approved wisdom from `content/scooter-wisdom/approved/approved-wisdom.json`; raw wisdom is never runtime material; vector/dynamic/raw modes are not available in MVP. Env vars must not turn Scooter Wisdom on/off, select a wisdom mode, or override the approved version.

## Phase 6 Execution Addendum — Managed Voice and Avatar Contracts

Status: implemented as provider contracts and safe UI hooks; live provider calls require local/server keys and are not proven in the artifact.

Locked behavior:
- ElevenLabs is the Scooter voice authority.
- HeyGen is the first managed avatar video provider.
- MakeUGC is a fallback avatar provider, not the primary default.
- Detailed coaching remains text-supported, but talking AI Scooter is core at welcome, final summary, and share/close.
- Voice/avatar requests are server-side only.
- Missing keys, disabled provider flags, provider errors, or cost-guard blocks return honest unavailable states.
- Static avatar/text fallback remains the default safe experience.
- No Network OS, email, auth, database, or persistent usage meter is added in Phase 6.

Validation boundary:
- Phase 6 hard-fails request-level provider/cost/fallback contract regressions.
- Phase 6 does not prove live ElevenLabs/HeyGen/MakeUGC quality or account status.
- Daily/monthly quota variables are admitted for deployment policy, but persistent metering is not claimed until a durable runtime store exists.


## Phase 7 Network OS handoff

Implemented consent-gated signed handoff from Pitch Lab to Network OS. Pitch Lab posts to `/api/pitch/share`; Network OS receives at `/api/intake/pitch-lab`. The handoff creates pending intake only, requires explicit consent, and forbids automatic contact creation. See `docs/PHASE_7_NETWORK_OS_HANDOFF_REVIEW.md`.


## Phase 9A Pitch Lab E2E / Completeness Review

Phase 9A hardens the founder journey before design overhaul: copy-card path, qualitative Story Strength Signals, no numeric/fundability scoring, no email feature, consented share only, and confirmed-submission-only thank-you behavior. See `docs/PHASE_9A_PITCH_LAB_E2E_AND_COMPLETENESS_REVIEW.md`.


## Phase 9B Design Overhaul
- Applied West Peek black/white/orange visual system.
- Added repo-owned West Peek logo and mark assets under `public/assets/brand/`.
- Locked product mantra to “Good products need good stories.” and retained brand mantra “Good people should meet good people.”
- Preserved Story Strength Signals, copy-card path, consent boundaries, no-email MVP scope, and no fake provider/media success.


# Phase 9B.1 — West Peek Design Parity Pass

Status: Implemented after owner approval. This pass corrected Phase 9B from generic West Peek-colored styling into the approved West Peek app-family direction using `westpeek.ventures` and `westpeek.live` as the preferred references. It installed the provided West Peek logo image, removed fabricated SVG logo assets, tightened black / white / restrained orange treatment, and added validation so future design work preserves parity anchors without weakening trust/consent boundaries.


## Phase 9D Update — ElevenLabs-First Talking Scooter MVP

Phase 9D supersedes prior HeyGen-first and text-first media posture. The MVP now uses ElevenLabs first for Scooter voice and talking-photo/video. Talking AI Scooter is a core product requirement at welcome, final personalized Pitch Story Card summary, and share/close. Text remains the detailed coaching artifact, but text-only/static mode is degraded fallback, not the intended product. Real env values and live provider proof are the final subset of 9D.
