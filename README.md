> **Repo update lifecycle:** Start with [`REPO_UPDATE_LIFECYCLE.md`](REPO_UPDATE_LIFECYCLE.md). The single postdeploy closure command is `npm run release:close-lifecycle`.

# West Peek Pitch Lab

**Good products need good stories.**  
**Good people should meet good people.**

West Peek Pitch Lab is a public founder-facing AI pitch coaching tool. Founders practice their pitch with AI Scooter, receive a Pitch Story Card, and may optionally share it with West Peek for future relationship or deal-flow review.

## Current Phase

**Phase 9E.2 — Coaching-room UX, Network OS profile capture, and local-browser gate repair.**

The production application UI, APIs, provider contracts, consent boundaries, local persistence, Network OS handoff, desktop/mobile browser gauntlet, packaging contracts, and deployment runbooks are present. The current release candidate is updater-ready after container validation; the v3.1 updater must still run the canonical local headed Playwright gate before commit and push.

## Locked Decisions

- Product: **West Peek Pitch Lab**
- Feature: **Pitch Practice with Scooter**
- Founder line: **Good products need good stories.**
- Brand line: **Good people should meet good people.**
- Tone: warm founder coaching room
- Avatar: AI Scooter using Scooter's approved likeness/photo via managed provider; ElevenLabs first for MVP talking-photo/video; HeyGen and MakeUGC fallback/research after MVP proof
- Voice: ElevenLabs for Scooter's approved voice
- LLM: Gemini first for lowest-cost/free-tier V1 path
- Intelligence: Scooter Wisdom Layer + broader LLM founder/VC storytelling layer
- Output: Founder Story Card
- Capture: value first, consented share second
- Internal destination: existing West Peek Network OS intake queue
- CRM rule: no duplicate CRM and no automatic contact creation

## Phase Order

1. Product docs and contracts
2. Static public app shell
3. Pitch practice flow
4. LLM integration
5. Scooter Wisdom Layer
6. Avatar integration
7. Network OS handoff
8. Email card option
9. E2E and hostile validation
10. Packaging/deployment

## Local Phase 1 Validation

```bash
npm run validate:phase1
```

This checks that required Phase 1 documents exist and locked copy/guardrails are present.

## Deterministic Environment System

Phase 1 now includes a deterministic env contract:

- `config/env.registry.json` lists every env var in the repo.
- `.env.local` is generated locally with safe placeholders by `npm run env:create-local`.
- `secrets/pitch-lab.env.vault.enc` is the committed encrypted vault for persistent env values.
- Cloudflare env sync starts as a dry-run plan: `npm run env:cloudflare:plan`.
- Provider envs now include Gemini, ElevenLabs, HeyGen, MakeUGC fallback, cost guards, and Network OS handoff.

Local setup:

```bash
npm run env:create-local
```

Encrypt local values into the vault:

```bash
ENV_VAULT_PASSPHRASE="use-a-real-passphrase-from-password-manager" npm run env:vault:from-local
```

Validate Phase 1:

```bash
npm run validate:all
```

## Phase 2+ Hostile Review Hardening

Before implementation continues, the plan has been hardened against the Master Operating Contract:

- Target product proof level is **Level 5**.
- Playwright depth is **DEEP JOURNEY / OUTCOME E2E**.
- A `tests/e2e/master-gauntlet.spec.mjs` suite is required before full product COMPLETE after Network OS handoff exists.
- Deep Validation is required once runtime code exists.
- No-theater gates are required for every implementation phase.
- Placeholders are allowed only in explicit examples, local setup, disabled-provider states, or test fixtures.
- Fake provider success, hidden stubs, production mocks, UI-only consent, and automatic contact creation are forbidden.

Key hardening docs:

- `docs/VALIDATION_SIMPLIFICATION_MATRIX.md`
- `docs/PLAYWRIGHT_MASTER_GAUNTLET_PLAN.md`
- `docs/NO_THEATER_IMPLEMENTATION_GATES.md`
- `docs/PHASE_2_PLUS_HOSTILE_REVIEW.md`

## Phase 2 Status

Phase 2 implements the static public app shell only. It includes the locked routes, locked copy, AI Scooter disclosure, static avatar fallback, and no-provider truth boundary. AI, voice, avatar video, email, and Network OS handoff remain intentionally inactive until their approved phases.

Validation command: `npm run validate:all`.

---

## Phase 3 Local Practice Flow

Phase 3 adds the local founder pitch-practice workflow:

- seven founder story prompts
- browser-local answer state
- input validation and progress
- local draft Pitch Story Card shell
- inactive share boundary

Phase 3 does not call Gemini, ElevenLabs, HeyGen, MakeUGC, email, or Network OS. The card is explicitly not AI-enhanced until Phase 4.

Run:

```bash
npm run validate:all
```

## Phase 4 status

Phase 4 adds server-side LLM integration contracts and routes:

- `functions/api/pitch/analyze.js`
- `functions/api/pitch/story-card.js`
- `src/server/ai/*`
- `src/runtime/aiStoryCardClient.mjs`

The default routing order is Gemini first, then OpenAI fallback when `LLM_FALLBACK_ENABLED=true` and OpenAI is configured. Missing or placeholder LLM credentials fail safely with `ai_unavailable`; the app does not fabricate AI feedback. Voice, avatar video, email, and Network OS handoff are still intentionally off.

## Phase 5 — Scooter Wisdom Layer

Phase 5 adds the approved-only Scooter Wisdom runtime layer.

Key files:

- `content/scooter-wisdom/raw/README.md`
- `content/scooter-wisdom/approved/approved-wisdom.json`
- `src/server/ai/scooterWisdomRegistry.mjs`
- `src/server/ai/scooterWisdom.mjs`
- `scripts/validate-scooter-wisdom.mjs`
- `tests/domain/phase5-contracts.mjs`

Rules:

- raw sources are not loaded at runtime;
- only approved chunks enter prompts;
- no fabricated Scooter quotes;
- no vector DB in MVP;
- Phase 5 adds no new provider keys.

## Phase 5 Patch — Non-Optional Scooter Wisdom Invariant

Scooter Wisdom is not a feature flag, mode, optional provider, or env-controlled switch. West Peek Pitch Lab cannot run its AI coaching identity without the approved Scooter Wisdom Layer. Runtime must always load approved wisdom from `content/scooter-wisdom/approved/approved-wisdom.json`; raw wisdom is never runtime material; vector/dynamic/raw modes are not available in MVP. Env vars must not turn Scooter Wisdom on/off, select a wisdom mode, or override the approved version.

## Phase 6 Current Boundary

The app now includes server-side contracts for ElevenLabs voice and managed avatar video. HeyGen is primary, MakeUGC is fallback, and static/text fallback is the default safe path when providers are disabled or unconfigured. Voice/avatar endpoints never return placeholder media as if it were real provider output.


## Phase 7 Network OS handoff

Implemented consent-gated signed handoff from Pitch Lab to Network OS. Pitch Lab posts to `/api/pitch/share`; Network OS receives at `/api/intake/pitch-lab`. The handoff creates pending intake only, requires explicit consent, and forbids automatic contact creation. See `docs/PHASE_7_NETWORK_OS_HANDOFF_REVIEW.md`.


## Phase 9A Pitch Lab E2E / Completeness Review

Phase 9A hardens the founder journey before design overhaul: copy-card path, qualitative Story Strength Signals, no numeric/fundability scoring, no email feature, consented share only, and confirmed-submission-only thank-you behavior. See `docs/PHASE_9A_PITCH_LAB_E2E_AND_COMPLETENESS_REVIEW.md`.


## Phase 9B Design Overhaul
- Applied West Peek black/white/orange visual system.
- Added repo-owned West Peek logo and mark assets under `public/assets/brand/`.
- Locked product mantra to “Good products need good stories.” and retained brand mantra “Good people should meet good people.”
- Preserved Story Strength Signals, copy-card path, consent boundaries, no-email MVP scope, and no fake provider/media success.


## Phase 9B.1 — West Peek design parity

Pitch Lab now uses the provided West Peek logo image as the canonical brand asset and aligns its visual direction to the preferred West Peek app-family references: `westpeek.ventures` and `westpeek.live`. The style direction is black / white with restrained orange, editorial founder-facing language, sharper app surfaces, and no generic SaaS-blue or fake AI-media controls.


## Authenticated Product Usability Governance

This repo adopts `REPO_MASTER_CONTRACT_ADDENDUM_AUTHENTICATED_PRODUCT_USABILITY_2026-06-13.md`. Route, lifecycle, control, hostile fixture, normalization, maintenance, Hallmark, and final-proof artifacts govern release closure.


## Autonomous Engineering Lifecycle v5

This repo implements the suite Revision 3 lifecycle: machine-readable route manifest, container validation, bounded strategy-rotating self-heal, mandatory predeploy Hallmark, applicable public/authenticated/role postdeploy audits, exact cleanup, rollback/containment, and final proof reporting.


## Canonical West Peek brand authority

- [`WEST_PEEK_BRAND_SYSTEM.md`](WEST_PEEK_BRAND_SYSTEM.md) — locked cross-suite visual system and Hallmark acceptance criteria.

## Baseline ZIP preflight

Before applying a baseline ZIP, use `docs/runbooks/PRE_UPDATER_BASELINE_CHECKLIST.md`. It is the canonical checklist for required root files, safe environment examples, forbidden generated artifacts, ZIP integrity, updater preflight, and localhost-before-push execution.


## Phase 9E — Network OS profile-capture repair

Pitch Lab now derives the Network OS profile endpoint from the configured Network OS base URL or packet endpoint, registers the canonical profile/packet env variables, and reports whether the founder profile actually synchronized or remains pending locally. The attached Network OS source already contained the compatible signed receiver and Google Sheets write/readback path, so this repair changes Pitch Lab only. Live deployment still requires the paired shared secret in both projects.


## Phase 9E.1 — Local browser gate repair

The first v3.1 updater run correctly stopped before commit after local Chromium exposed a mixed product/test failure set. This repair fixes blank-optional-answer draft leakage, desktop first-viewport CTA geometry, rehearsal-consent readiness, trust and text-first guidance, and stale E2E selectors/copy. The browser suite remains 112 tests across desktop and mobile; the updater must rerun the full local browser gate before commit or push. See `PITCH_LAB_LOCAL_BROWSER_GATE_REPAIR_2026-06-16.md`.

### Lifecycle environment repair (2026-06-16)

`release:close-lifecycle` now preserves an existing local `.env.local`, uses the encrypted vault only as a fallback, isolates deterministic local browser tests from live/deployed variables, normalizes approved deployment URL aliases, and bounds browser concurrency. See `PITCH_LAB_LIFECYCLE_ENV_REPAIR_2026-06-16.md`.
