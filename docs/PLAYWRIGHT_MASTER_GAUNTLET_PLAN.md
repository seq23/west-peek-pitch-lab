# Playwright Master Gauntlet Plan — West Peek Pitch Lab

**Status:** ACTIVE  
**Scope:** Phase 2 onward

## Purpose

Browser behavior must prove founder outcomes, not page existence.

A route rendering is not a product. A form submitting is not a transaction. A success message is not proof. Playwright must attempt to disprove readiness.

## Locked Depth

West Peek Pitch Lab requires **maximum reasonable Playwright depth** for its target complexity.

| Item | Requirement |
|---|---|
| Target depth | **DEEP JOURNEY / OUTCOME E2E** |
| Suite name | `tests/e2e/master-gauntlet.spec.mjs` |
| Local mode | headed/browser-visible by default |
| CI mode | headless allowed |
| Diagnostics | traces, screenshots, final URL, console/network errors |
| Postdeploy | deployed smoke required; critical-lane E2E required after Network OS handoff exists |

## Required Persona Journey Matrix

| Persona | Entry Route | Intended Outcome | Required State Change | Allowed Destinations | Forbidden Destinations | Proof Required |
|---|---|---|---|---|---|---|
| Anonymous founder | `/` → `/practice` | Complete pitch practice without sharing | Client-side draft story state only | story card, exit, privacy | Network OS share without consent | Story Card visible; no network handoff |
| Founder requesting card | `/story-card` → email option | Request card only if email consent is checked | Email request submitted or safe disabled state | thank-you/email-disabled | share-with-West-Peek implied | consent state + honest result |
| Founder sharing with West Peek | `/share` | Create pending Network OS intake | Network OS intake row/payload with pending review | thank-you | auto-contact, investment-decision page | API/persistence/readback proof |
| West Peek reviewer | Network OS intake | Review, convert, dismiss, or request more info | Review status changes only by reviewer | pending/converted/dismissed | auto-contact before review | integration/E2E proof when Network OS linked |
| Abuse/bot user | practice/share APIs | Fail safely | No Network OS write | rate-limit/error | fake success | error state + no persistence |

## Required Edge Case Inventory

The suite must cover:

- missing required founder fields
- very long pitch input
- malformed email
- founder exits before capture
- share clicked without consent
- consent checked then unchecked
- LLM unavailable
- malformed LLM output
- ElevenLabs unavailable
- HeyGen unavailable
- Network OS unavailable
- unsigned Network OS handoff
- duplicate submit attempt
- refresh/re-entry on Story Card screen
- mobile layout sanity
- privacy/terms visibility
- no funding/review/meeting guarantee language
- no “real Scooter reviewed this” claim
- no auto-contact creation
- no placeholder provider success in production mode

## Required Suites by Phase

| Phase | Minimum Playwright proof | Completion impact |
|---|---|---|
| Phase 2 | route smoke + visual smoke + locked copy/disclosure checks | Required for static-shell completion |
| Phase 3 | full non-AI founder practice journey + exit-without-share | Required for pitch-flow completion |
| Phase 4 | AI success/failure journey with schema-safe output | Required for LLM completion |
| Phase 5 | Scooter Wisdom inclusion + forbidden-claim checks | Required for persona completion |
| Phase 6 | voice/avatar disabled/failure/fallback + cost guard UI states | Required for provider completion |
| Phase 7 | consented Network OS handoff + no auto-contact proof | Required for integration completion |
| Phase 9 | full Master Gauntlet local headed run | Required before product COMPLETE |
| Phase 10 | deployed smoke + postdeploy critical lane | Required before deployed COMPLETE |

## Playwright Acceptance Rules

- Generated tests are incomplete until hostile review expands them; do not treat generated coverage as product proof.
- Tests must assert outcomes, not only copy presence.
- Success toasts do not prove state change.
- Screenshots do not prove human review.
- Every skip must include reason, affected journey, risk, and completion impact.
- A failing critical Playwright lane blocks COMPLETE.

## Final Rule

**Playwright must prove that a real founder can complete the promised workflow and that forbidden outcomes fail safely.**
