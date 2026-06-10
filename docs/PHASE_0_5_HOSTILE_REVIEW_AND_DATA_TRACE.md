# Phase 0–5 Hostile Review + Data Trace — West Peek Pitch Lab

**Status:** ACTIVE AUDIT RECORD  
**Scope:** Phases 0–5 as implemented through the Phase 5 Scooter Wisdom invariant patch  
**Review posture:** hostile review for overengineering, validation complication, drift, technical debt, user-journey common sense, and no-theater risk

## Executive Verdict

The Phase 0–5 build is directionally sound and the user journey makes common sense: a founder lands, understands the AI boundary, practices privately, creates a local draft, optionally requests AI coaching, receives an AI-enhanced Pitch Story Card when providers are configured, and cannot share with West Peek yet.

The core product model is still correct:

1. Warm founder coaching room, not VC evaluation.
2. Text-first pitch practice.
3. Server-side AI only.
4. Scooter Wisdom is mandatory and approved-only.
5. Sharing/capture remains off until Phase 7 consented Network OS handoff.

## Hostile Review Findings

### Finding 1 — Cloudflare env plan was too broad

**Finding:** The Cloudflare dry-run plan previously listed every registered env var, including future Phase 6–10 variables and local deploy/vault tooling variables.

**Risk:** This creates operator confusion and increases the chance of pushing future placeholders or local-only tooling variables into the app runtime.

**Fix applied:** `scripts/env/write-cloudflare-env-plan.mjs` now defaults to variables through the current implemented phase only and skips local tooling vars. Future variables require explicit `--through-phase=phaseN` or `--all`.

**Current rule:** The env registry may know future variables, but Cloudflare app runtime planning is phase-scoped by default.

### Finding 2 — Scooter Wisdom env configuration was overengineered

**Finding:** Earlier Scooter Wisdom env variables implied the Wisdom Layer could be toggled or selected.

**Risk:** That was wrong because the app cannot be AI Scooter without approved Scooter Wisdom.

**Fix already applied before this audit:** Scooter Wisdom is now a non-optional product invariant. Runtime always loads `content/scooter-wisdom/approved/approved-wisdom.json`; there is no env mode, no on/off switch, and no alternate runtime source.

### Finding 3 — RESOLVED: `.ts` scaffold files and `.mjs` runtime files can drift

**Resolved finding:** The repo now uses one canonical implementation path: plain `.mjs` runtime plus JSON contracts. The previous `.ts` scaffold mirrors under `src/` were removed.

**Remaining risk:** Drift can return only if future work reintroduces TypeScript mirrors without a real build migration. `npm run validate:canonical-runtime` now hard-fails that case.

**Current severity:** Medium. It is acceptable through Phase 5 because the artifact is still structurally checked and the actual runtime path is validated, but this should not carry deep into provider work.

**Recommended next fix:** Before or during Phase 6, choose one canonical implementation path:

- selected plain `.mjs` runtime;
- removed scaffold `.ts` duplication;
- admitted canonical-runtime validation into the simplification matrix.

Do not keep long-term parallel implementations.

### Finding 4 — Validation is broad but still mostly static/domain-level

**Finding:** `npm run validate:all` now covers env, no-secrets, no-theater, locked copy, build, domain tests, phase validators, and route smoke. It does not yet prove real browser E2E, live provider calls, visual screenshots, or deployed behavior.

**Risk:** Someone could mistake a passing validator chain for full product proof.

**Current mitigation:** Status remains `STRUCTURALLY CHECKED — LOCAL VALIDATION REQUIRED`; Playwright Master Gauntlet remains required before COMPLETE once Network OS handoff exists.

**Recommended next fix:** Add real Playwright once the app moves beyond static file generation and provider work begins. Do not claim product COMPLETE from validator scripts alone.

### Finding 5 — The user journey is intuitive enough, but the AI step is one click removed

**Finding:** Founder completes `/practice`, then goes to `/story-card`, then manually clicks **Generate AI Pitch Story Card**.

**Risk:** Slight friction, but acceptable. It keeps Phase 3 local draft and Phase 4 AI generation cleanly separated.

**Recommended later UX improvement:** After local draft completion, the primary CTA can say **View and sharpen with AI** once LLM provider is configured. Do not enable this in a way that implies AI is available when keys are missing.

## Data Trace — Entire Founder Journey Through Phase 5

### 1. Entry: `/`

**User sees:** product name, founder line, brand line, CTA, AI Scooter disclosure, static avatar shell.

**Data collected:** none.

**State changed:** none.

**External calls:** none.

**No-theater boundary:** no claim of real Scooter, funding, review, voice, video, or Network OS handoff.

### 2. Practice: `/practice`

**User action:** founder answers seven prompts.

**Data collected:** seven pitch answers.

**State changed:** answers are stored in browser `localStorage` using `west-peek-pitch-lab.phase3.answers.v1`.

**External calls:** none.

**Validation:** each answer has min/max length; total AI input cap is enforced later server-side.

**No-theater boundary:** the live preview is labeled local draft and not AI-enhanced.

### 3. Local draft preview

**User sees:** local Pitch Story Card shell.

**Data source:** browser-local answers.

**State changed:** none beyond local answer storage.

**External calls:** none.

**No-theater boundary:** `aiEnhanced=false`, `shareEnabled=false`, and notice states AI/voice/avatar/email/Network OS are not active in the local draft.

### 4. Story Card: `/story-card`

**User sees:** local draft shell plus AI generation panel.

**Data source:** browser-local answers.

**State changed before AI click:** none.

**External calls before AI click:** none.

### 5. AI generation request

**User action:** clicks **Generate AI Pitch Story Card**.

**Browser sends:** founder answers to `/api/pitch/story-card`.

**Server validates:** required answers, min/max fields, total input cap.

**Provider route:** Gemini primary, OpenAI fallback when enabled/configured.

**Server prompt includes:** hard safety boundaries, West Peek copy, and mandatory approved Scooter Wisdom context.

**Server output requirement:** strict JSON shape for critique and Pitch Story Card.

**Success result:** `aiEnhanced=true`, `shareEnabled=false`, disclosure shown, provider name/attempts by name only.

**Failure result:** `ai_unavailable`, no placeholder story card, no fake AI output.

### 6. Scooter Wisdom trace

**Runtime source:** `content/scooter-wisdom/approved/approved-wisdom.json`.

**Runtime forbidden:** raw folder, fabricated Scooter quotes, vector retrieval, env override, optional mode switch.

**Prompt behavior:** AI prompt includes approved wisdom context and forbidden claims.

**Failure behavior:** invalid/missing approved wisdom fails closed.

### 7. Share boundary: `/share`

**User sees:** share inactive.

**Data collected:** none.

**External calls:** none.

**Network OS state:** none.

**No-theater boundary:** no CRM row, no contact creation, no human review implied.

### 8. Thank-you: `/thank-you`

**User sees:** static shell only.

**Data collected:** none.

**State changed:** none.

**No-theater boundary:** does not claim submission, review, email, or sharing.

## Common-Sense User Journey Verdict

The journey is understandable for a founder:

1. They understand the product.
2. They can practice without giving up email or consent.
3. They can create value before capture.
4. They can get AI coaching when configured.
5. They cannot accidentally submit to West Peek.
6. The app does not pretend Scooter, West Peek, or an investor has reviewed them.

## Main Simplicity Recommendations Before Phase 6

1. Keep `npm run validate:canonical-runtime` in `validate:all` before adding provider-heavy voice/avatar code.
2. Keep Cloudflare env plans phase-scoped by default.
3. Keep Scooter Wisdom non-optional and file-owned.
4. Do not add deck upload, auth, database, or vector retrieval before Network OS handoff proof.
5. Add real Playwright deep journey once provider and share workflows exist.

## Current Highest Honest Status

`STRUCTURALLY CHECKED — LOCAL VALIDATION REQUIRED`

Not proven yet:

- live Gemini call with real key;
- live OpenAI fallback with real key;
- Playwright browser E2E;
- visual screenshot proof;
- deployed Cloudflare smoke;
- ElevenLabs/HeyGen/MakeUGC provider behavior;
- Network OS handoff and readback.

## Phase 6 Follow-On Debt Check

Phase 6 preserves the canonical `.mjs` runtime path and does not reintroduce TypeScript scaffold drift. Provider integrations remain server-side contracts with honest unavailable states. The known future proof gap is persistent provider usage metering; it is intentionally not claimed in Phase 6.
