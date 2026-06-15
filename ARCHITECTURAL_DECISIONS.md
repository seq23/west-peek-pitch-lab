# Architectural Decisions — West Peek Pitch Lab

## Decision ID: AD-001
**Date:** 2026-06-10  
**Status:** Accepted

### Context
West Peek wants a founder-facing AI pitch coaching tool that strengthens the brand, helps founders, and creates permissioned deal-flow signal.

### Decision
Build **West Peek Pitch Lab** as a separate public app, likely deployed at `pitchlab.joinwestpeek.com`, with Network OS as the internal CRM destination.

### Alternatives Considered
- Add Pitch Lab directly into `joinwestpeek.com`.
- Add Pitch Lab directly into `network.joinwestpeek.com`.
- Build a second CRM inside Pitch Lab.

### Reasoning
A separate public app gives clean brand positioning and avoids exposing internal Network OS surfaces. Network OS already owns relationship storage and human review, so duplicating CRM functionality would create drift.

### Tradeoffs
Requires a safe handoff contract between apps.

### Risks Accepted
Cross-repo integration must be validated before COMPLETE.

### Validation Impact
Requires contract tests and E2E proof for public founder flow and Network OS intake handoff.

### Future Reversal Conditions
If West Peek later consolidates founder tools into a single frontend shell, Pitch Lab can become a route under that shell while preserving the Network OS handoff contract.

---

## Decision ID: AD-002
**Date:** 2026-06-10  
**Status:** Accepted

### Context
The product concept began as an AI avatar of Scooter Taylor.

### Decision
AI Scooter is the warm interface, not the product. The product is a founder storytelling workflow that produces a Pitch Story Card.

### Alternatives Considered
- Avatar-first novelty experience.
- Static form with no avatar.
- AI investment evaluator.

### Reasoning
The avatar builds trust and brand warmth, but the founder outcome must be story clarity. Investment evaluator language creates legal, trust, and brand risk.

### Tradeoffs
V1 may feel less technically flashy than real-time avatar tools.

### Risks Accepted
Avatar realism can be improved after the core pitch workflow proves useful.

### Validation Impact
Tests must prove Pitch Story Card generation and consent/share behavior, not merely avatar load.

---

## Decision ID: AD-003
**Date:** 2026-06-10  
**Status:** Accepted

### Context
Scooter's real charisma, founder instincts, and networking philosophy are the differentiator.

### Decision
Create a **Scooter Wisdom Layer** from approved interviews, voice notes, sayings, founder questions, red flags, and relationship philosophy. Scooter-approved wisdom outranks generic LLM advice.

### Alternatives Considered
- Generic AI prompt with Scooter branding.
- Full fine-tuning before V1.
- Vector database in V1.

### Reasoning
Generic advice with Scooter's face would feel fake. Static curated wisdom is safer, easier to approve, and sufficient for V1.

### Tradeoffs
Requires content capture and approval workflow.

### Risks Accepted
Early V1 may have limited Scooter Wisdom until interviews are completed.

### Validation Impact
Prompt tests and content validators must ensure required Scooter boundaries and forbidden claims are present.

---

## Decision ID: AD-004
**Date:** 2026-06-10  
**Status:** Accepted

### Context
Founder information may be sensitive and the app is also a deal-flow capture surface.

### Decision
Use value-first, consented-share architecture. Founders can practice without sharing. Network OS submission requires explicit consent.

### Alternatives Considered
- Email required before use.
- Automatic CRM capture after pitch practice.
- Hidden lead capture.

### Reasoning
Trust compounds brand value. Hidden capture damages founder goodwill.

### Tradeoffs
Some anonymous usage will not become deal flow.

### Risks Accepted
Higher trust is more important than maximum immediate capture.

### Validation Impact
Consent tests must prove no Network OS payload is created without explicit share consent.

---

## Decision ID: AD-005
**Date:** 2026-06-10  
**Status:** Accepted

### Context
Network OS already includes intake queue, founder classification, deal-flow fields, review status, and Google Sheets persistence.

### Decision
Pitch Lab may create only pending intake records in Network OS. It must not automatically create contacts, touches, approvals, or investment decisions.

### Alternatives Considered
- Direct contact creation.
- Separate Pitch Lab CRM.
- Auto-scored deal pipeline.

### Reasoning
Human review preserves relationship quality and prevents CRM pollution.

### Tradeoffs
Requires reviewer workflow inside Network OS.

### Risks Accepted
Internal team must process intake queue.

### Validation Impact
Network OS tests must prove pitch_lab submissions are pending review and do not auto-create contacts.

---

## Decision ID: AD-006
**Date:** 2026-06-09  
**Status:** Accepted

### Context
Pitch Lab will need local env values on the owner machine, LLM/avatar/provider secrets, Network OS handoff secrets, and Cloudflare deployment configuration. Dashboard-only environment setup would create drift and make deployment non-deterministic.

### Decision
Create a deterministic env system with three coordinated sources: `config/env.registry.json` for every env var name and binding type, `.env.local` generated from safe placeholders for local machine use, and `secrets/pitch-lab.env.vault.enc` as the committed encrypted env vault.

### Alternatives Considered
- Only `.env.example` files.
- Dashboard-only Cloudflare secrets.
- Plaintext committed env backup.
- Add real values manually during deploy.

### Reasoning
The registry gives the repo a deterministic env map. The local env generator gives the owner an easy setup path. The encrypted vault preserves the full env set without committing plaintext values. Cloudflare sync can later be driven from the same registry and vault.

### Tradeoffs
Requires passphrase management outside the repo. The encrypted file is recoverable only if the passphrase is preserved in the owner password manager.

### Risks Accepted
If the passphrase is lost, the vault cannot be decrypted and must be regenerated from the owner/local provider dashboards.

### Validation Impact
Phase 1 validation must check the env registry, example env coverage, encrypted vault envelope, `.gitignore` safety patterns, and no plaintext secret files.

### Future Reversal Conditions
If West Peek later adopts a formal secret manager, this vault can become a bootstrap/export artifact while the registry remains the source of truth for env names and binding types.

---

## Decision ID: AD-007
**Date:** 2026-06-10  
**Status:** Superseded by AD-009

### Context
The initial low-cost exploration considered open-source talking-photo tools, but those tools are operationally complicated, brittle, and not quality/reliability aligned with a West Peek founder-facing brand surface. Scooter's actual voice is also more important to perceived authenticity than frequent generated video.

### Decision
Use a managed provider approach for avatar/voice. This decision originally selected ElevenLabs voice with HeyGen-first avatar. It is superseded by AD-009, which selects ElevenLabs first for MVP voice + talking-photo/video and treats text-only/static as degraded fallback.

### Alternatives Considered
- Open-source SadTalker/LivePortrait/Wav2Lip-style production path.
- HeyGen-only voice and video.
- Avatar video for every AI response.
- No voice/video, text-only.

### Reasoning
Open-source avatar tooling creates too much operational drag. Full dynamic video for every response creates cost, latency, and failure risk. ElevenLabs better preserves Scooter's actual voice identity. HeyGen/MakeUGC keep avatar generation managed and switchable.

### Tradeoffs
This tradeoff was superseded after the product requirement was clarified: the app must feel like coaching from AI Scooter at key media moments.

### Risks Accepted
Managed providers may change pricing or API behavior. Provider abstraction and MakeUGC fallback reduce lock-in.

### Validation Impact
Validation must cover provider envs, cost guardrails, safe provider failure states, no client-side secret exposure, and no fake success states for voice/avatar rendering.

### Future Reversal Conditions
Dynamic video for more responses may be approved only after founder flow quality, render latency, cost guardrails, and usage demand are proven.

---

Decision ID: ADR-006
Date: 2026-06-09
Status: Accepted

Context:
The implementation plan was reviewed against the Master Operating Contract before Phase 2. The product is not merely a static app; it is a founder-facing product with AI, voice, managed avatar video, consented PII capture, and Network OS deal-flow handoff.

Decision:
Treat the target product as Level 5 for proof planning. Require maximum reasonable Playwright depth, a Master Gauntlet before full product COMPLETE, Deep Validation once runtime code exists, and phase-specific no-theater gates.

Alternatives Considered:
- Keep target classification as Level 4.
- Require only lightweight/moderate Playwright.
- Defer anti-theater gates until provider implementation.

Reasoning:
Level 4 understates the cross-system provider and CRM handoff risk. The app affects founder trust, brand credibility, PII handling, and internal deal-flow records. Surface validation is insufficient.

Tradeoffs:
Higher validation burden and more implementation work. Lower risk of fake completion, CRM pollution, secret exposure, or broken founder journeys.

Risks Accepted:
Build phases may take longer. Some proof layers cannot run until their implementation phase exists.

Validation Impact:
Added `docs/VALIDATION_SIMPLIFICATION_MATRIX.md`, `docs/PLAYWRIGHT_MASTER_GAUNTLET_PLAN.md`, `docs/NO_THEATER_IMPLEMENTATION_GATES.md`, and `docs/PHASE_2_PLUS_HOSTILE_REVIEW.md`. Updated `REPO_VALIDATION_MATRIX.md` and `docs/IMPLEMENTATION_PHASE_PLAN.md`.

Future Reversal Conditions:
Only if the product is intentionally reduced to a non-provider static demo with no Network OS handoff and no founder PII capture. Such reduction requires explicit owner approval and validation matrix update.

---

## AD-008 — Approved-Only Scooter Wisdom Runtime

**Decision:** Phase 5 uses a static approved Scooter Wisdom registry and blocks raw source material from runtime.

**Reason:** The product must avoid generic AI with Scooter's face while also avoiding fabricated Scooter quotes or unreviewed transcript leakage.

**Consequences:**

- Raw files live under `content/scooter-wisdom/raw/` and are never loaded automatically.
- Approved runtime chunks live in `content/scooter-wisdom/approved/approved-wisdom.json`.
- Prompt contracts load only the approved runtime context.
- V1 does not use vector DB retrieval.
- Future Scooter interview material requires explicit promotion into the approved registry.

## Phase 5 Patch — Non-Optional Scooter Wisdom Invariant

Scooter Wisdom is not a feature flag, mode, optional provider, or env-controlled switch. West Peek Pitch Lab cannot run its AI coaching identity without the approved Scooter Wisdom Layer. Runtime must always load approved wisdom from `content/scooter-wisdom/approved/approved-wisdom.json`; raw wisdom is never runtime material; vector/dynamic/raw modes are not available in MVP. Env vars must not turn Scooter Wisdom on/off, select a wisdom mode, or override the approved version.

## Decision ID: AD-009 — ElevenLabs-First MVP Media Provider

**Date:** 2026-06-10  
**Status:** Accepted

### Context
Pitch Lab must feel like coaching from AI Scooter, not a text form with optional media. The product needs talking Scooter at key moments: welcome, final personalized Pitch Story Card summary, and share/close.

### Decision
Use ElevenLabs first for MVP Scooter voice and talking-photo/video provider posture. Treat HeyGen, MakeUGC, Fish Audio, Replicate, LongCat, Hugging Face, SadTalker, and LivePortrait as future optimization/research lanes unless explicitly re-approved.

### Alternatives Considered
- Fish Audio primary voice with separate video provider
- HeyGen-first managed avatar
- open-source avatar runtime
- text-first with optional video

### Reasoning
The MVP needs one coherent path before cost optimization. ElevenLabs is already the voice layer and has image/video/lip-sync product surfaces suitable for talking-avatar research/proof. Cheaper alternatives can be reassessed after the journey works.

### Tradeoffs
This may not be the cheapest final provider. It reduces immediate decision complexity and keeps the MVP focused.

### Risks Accepted
Live provider API shape, pricing, and asset IDs remain unproven until the final 9D env/provider subset.

### Validation Impact
The Master Gauntlet must treat talking Scooter as a core intended lane and fallback as degraded mode, not normal product behavior.

### Future Reversal Conditions
If ElevenLabs cost/latency/API quality fails the gauntlet or account test, switch provider posture after updating docs, media identity, env registry, provider service, validators, and architectural decision ledger.

## Decision ID: AD-009 — ElevenLabs-First MVP Media Provider

**Date:** 2026-06-10  
**Status:** Accepted

### Context
Pitch Lab must feel like coaching from AI Scooter, not a text form with optional media. The product needs talking Scooter at key moments: welcome, final personalized Pitch Story Card summary, and share/close.

### Decision
Use ElevenLabs first for MVP Scooter voice and talking-photo/video provider posture. Treat HeyGen, MakeUGC, Fish Audio, Replicate, LongCat, Hugging Face, SadTalker, and LivePortrait as future optimization/research lanes unless explicitly re-approved.

### Alternatives Considered
- Fish Audio primary voice with separate video provider
- HeyGen-first managed avatar
- open-source avatar runtime
- text-first with optional video

### Reasoning
The MVP needs one coherent path before cost optimization. ElevenLabs is already the voice layer and has image/video/lip-sync product surfaces suitable for talking-avatar research/proof. Cheaper alternatives can be reassessed after the journey works.

### Tradeoffs
This may not be the cheapest final provider. It reduces immediate decision complexity and keeps the MVP focused.

### Risks Accepted
Live provider API shape, pricing, and asset IDs remain unproven until the final 9D env/provider subset.

### Validation Impact
The Master Gauntlet must treat talking Scooter as a core intended lane and fallback as degraded mode, not normal product behavior.

### Future Reversal Conditions
If ElevenLabs cost/latency/API quality fails the gauntlet or account test, switch provider posture after updating docs, media identity, env registry, provider service, validators, and architectural decision ledger.

### Decision ID: ADM-2026-06-15-01
* **Date:** 2026-06-15
* **Status:** Accepted
* **Context:** Pitch Lab had conflicting tier language, a local prepush path that did not execute Playwright, stale browser project identity, unregistered conditional skips, and no single runtime-proof contract.
* **Decision:** Adopt the repo-specific three-tier model; enforce 52 desktop and 52 mobile Playwright tests before commit/push; add durable local proof evidence, populated public postdeploy scenarios, exact local deletion proof, and explicit public-only N/A lanes.
* **Alternatives Considered:** Retaining generic Tier 3A/3B/Tier 4 language; leaving Playwright as a separate optional command.
* **Reasoning:** The selected model matches Pitch Lab’s public, consent-sensitive, provider-backed runtime and the Master Contract lifecycle without importing irrelevant auth machinery.
* **Tradeoffs:** Exact browser counts require deliberate contract updates when tests change.
* **Risks Accepted:** Live provider and deployed proof remain environment-bound until local updater and deployed lifecycle execution.
* **Validation Impact:** Tier 1 container proof now validates governance; Tier 2 local browser proof blocks commit/push; Tier 3 closure blocks COMPLETE.
* **Future Reversal Conditions:** Product authentication, roles, tenants, or persistence architecture materially changes.
### Decision ID: ADM-2026-06-15-02
*   **Date:** 2026-06-15
*   **Status:** Accepted
*   **Context:** Local Chromium proof exposed that the static HTML rendered while all interactive routes remained unhydrated because the build copied browser entry files but omitted shared sibling ESM dependencies.
*   **Decision:** Package every `src/runtime/*.mjs` module into `dist/assets`, retain stable browser entry aliases, and hard-fail builds through `validate:browser-runtime-bundle` when any reachable relative import is missing. Restore `.nvmrc` as explicit Node authority.
*   **Alternatives Considered:** Manually maintain a partial dependency list; weaken or update Playwright assertions; bypass the local browser gate. All were rejected because they preserve a fragile build or manufacture green.
*   **Reasoning:** Complete runtime copying is deterministic, low-cost, framework-appropriate, and prevents the exact static-shell/runtime-dead failure that Tier 1 previously missed.
*   **Tradeoffs:** A few additional small runtime modules are shipped even when a route does not use them directly.
*   **Risks Accepted:** The validator proves module presence, not execution; real local Chromium remains mandatory before commit.
*   **Validation Impact:** Tier 1 build/import-graph validation plus full Tier 2 desktop and mobile Playwright on the operator machine.
*   **Future Reversal Conditions:** Replace only when a bundler or import-map pipeline provides equal or stronger graph resolution and artifact proof.
## ADM-2026-06-15-03 — One-time browser fixture seeding

**Decision:** Playwright persistence fixtures must seed local storage once per browser session, guarded by a non-product `sessionStorage` marker. They must never reseed on reload or route navigation.

**Reason:** `page.addInitScript()` runs for every document. An unguarded fixture resurrected the seven Pitch Lab keys immediately after the Delete My Info flow correctly removed them, producing a false product failure.

**Enforcement:** `tests/e2e/persistence-and-deletion-proof.spec.mjs` uses `west-peek-pitch-lab-proof-seeded` as a session-only marker, and the fixture is included in critical source-to-artifact parity.

