# Repo Validation Matrix — West Peek Pitch Lab

**Status:** CURRENT — Phase 5 + validation simplification + canonical runtime pass  
**Phase 1 Complexity:** Level 0 docs/contracts baseline  
**Target Product Complexity:** **Level 5** because West Peek Pitch Lab is a browser-facing, provider-integrated, consent/PII-adjacent founder product connected to Network OS deal-flow intake.


## Matrix Authority Addendum — Phase 5 Validation Simplification Pass

`_repo_validation_matrix.json` is now the machine-readable admission authority for package validation scripts. `npm run validate:matrix` hard-fails only when validation governance itself drifts: an added proof script is not classified, a hard-fail lacks production-risk rationale, or warning-only checks are accidentally promoted into `validate:all`.

Current-phase hard fails are limited to security, env contract, anti-theater, build, domain behavior, static route smoke, and current implemented phase contracts. Visual screenshots, Cloudflare apply/sync, live provider keys, and deployed smoke remain warning/deploy/complete gates until their phase actually requires them.

Future validators must be added to both this document and `_repo_validation_matrix.json` before they are added to `package.json`.


## Canonical Runtime Addendum — Phase 5 Debt Patch

The repo has chosen one implementation path for the current app: **plain `.mjs` runtime plus JSON contracts**. Duplicate TypeScript scaffold mirrors under `src/` are removed and forbidden by `npm run validate:canonical-runtime`.

Future TypeScript is allowed only as an intentional repo-wide migration to a real TypeScript build pipeline. It must replace the `.mjs` runtime path instead of running as parallel scaffold files.

## Required Target Proof Posture

| Proof area | Locked requirement |
|---|---|
| Playwright depth | **DEEP JOURNEY / OUTCOME E2E** |
| Master Gauntlet | **Required before full product COMPLETE after Phase 7 exists** |
| Deep Validation | **Required before COMPLETE once runtime code exists** |
| GitHub Actions | **Required if workflows exist** |
| Deployed smoke | **Required before deployed COMPLETE** |
| Postdeploy E2E | **Required for critical lanes once Network OS handoff exists** |
| No-theater gate | **Required every phase** |
| Env parity trace | **Required before browser/provider/deploy debugging and before production deploy** |

## Validation Standard

| Validator / Test | Command | Category | Severity | Production Risk | What It Proves | What It Does Not Prove | Failure Handling | Owner Decision Needed? |
|---|---|---|---|---|---|---|---|---|
| Phase 1 document presence | `npm run validate:phase1` | Docs / structure | HARD FAIL | Missing contracts cause implementation drift | Required Phase 1 docs exist | Does not prove runtime app behavior | Restore missing docs | No |
| Phase 2+ hostile review artifacts | `npm run validate:phase1` | Architecture / proof plan | HARD FAIL | Later implementation may under-test or ship theater | Validation simplification matrix, Master Gauntlet plan, and no-theater gates exist | Does not prove runtime behavior | Restore required docs | No |
| Locked copy guardrail | `npm run validate:phase1` | Product copy | HARD FAIL | Brand drift and unclear founder promise | Required brand lines appear | Does not prove visual placement | Restore locked copy | Yes if copy change requested |
| Canonical runtime guard | `npm run validate:canonical-runtime` | Runtime architecture | HARD FAIL | `.ts`/`.mjs` drift can approve one path while deploying another | Current source uses one canonical `.mjs` runtime path plus JSON contracts; no TypeScript scaffold files under `src/` | Does not prove live providers or browser visuals | Remove scaffold drift or intentionally migrate to a real TypeScript build | No |
| No duplicate CRM guardrail | `npm run validate:phase1` | Architecture | HARD FAIL | CRM duplication and data drift | Docs state Network OS remains CRM | Does not prove code integration | Restore guardrail | Yes if changing architecture |
| Consent guardrail | `npm run validate:phase1` | Privacy | HARD FAIL | Founder trust / PII risk | Docs require explicit share consent | Does not prove runtime enforcement | Restore guardrail | No |
| AI disclosure guardrail | `npm run validate:phase1` | Brand/legal | HARD FAIL | Misleading impersonation / review claims | Docs require AI Scooter disclosure | Does not prove UI copy | Restore guardrail | No |
| No-theater implementation gate | `npm run validate:phase1` | Architecture / quality | HARD FAIL | Hidden stubs, fake provider success, or placeholder production behavior | Repo contracts forbid production mocks/placeholders and fake success | Does not prove future code follows it | Fix docs/validators before code | No |
| Maximum Playwright depth plan | `npm run validate:phase1` | E2E planning | HARD FAIL | Browser flows may be under-tested | Master Gauntlet and deep journey/outcome E2E are locked | Does not run Playwright | Restore Playwright plan | No |
| No plaintext secrets | `npm run validate:no-secrets` | Security | HARD FAIL | Secret exposure | Real env files and common secret patterns are not present | Does not prove deployed secret config | Remove secret, rotate if real | Yes if secret found |
| Env contract validation | `npm run validate:env` | Env / secrets | HARD FAIL | Missing/drifting env map can break LLM, voice, avatar, Network OS handoff, or Cloudflare deployment | Registry exists, examples contain all keys, encrypted vault envelope exists, `.gitignore` blocks plaintext env/decrypted vault files | Does not prove real provider values or Cloudflare state | Fix registry/examples/vault/gitignore | No |
| Local env placeholder creation | `npm run env:create-local` | Env / local setup | STRONG WARNING before build, HARD FAIL before local runtime proof | Owner cannot reliably create `.env.local` | Script can generate `.env.local` from registry with safe placeholders | Does not prove real local values are filled | Fix script/registry | No |
| Restore local env from vault | `ENV_VAULT_PASSPHRASE=... npm run env:local:from-vault` | Env / recovery | HARD FAIL before local recovery proof | Owner cannot recreate `.env.local` from persistent encrypted source | Vault can restore local machine env without committing plaintext | Does not prove provider values are correct | Fix restore script/vault | No |
| Cloudflare env plan | `ENV_VAULT_PASSPHRASE=... npm run env:cloudflare:plan` | Deploy / env | STRONG WARNING until deploy, HARD FAIL before deploy | Cloudflare vars/secrets may be missing or dashboard-only | Generates names-only Cloudflare sync plan from vault/registry | Does not apply Cloudflare values | Add guarded apply step in deploy phase | Yes before real apply |
| Provider env registry coverage | `npm run validate:env` | Env / provider | HARD FAIL | Missing provider vars can break LLM, voice, avatar, or Cloudflare sync | Gemini, ElevenLabs, HeyGen, MakeUGC fallback, and cost guard env names exist | Does not prove provider credentials are valid | Add missing registry entries and regenerate env examples/vault | No |
| Canonical runtime sanity | `npm run validate:canonical-runtime` | Build/runtime | HARD FAIL | Parallel source paths create drift | No TypeScript scaffold under `src/`; runtime files are canonical | Does not prove behavior | Fix runtime path or migrate intentionally | No |
| Build | Phase 2+ command TBD | Build | HARD FAIL | Undeployable app | App builds locally | Does not prove deployed runtime | Fix build | No |
| Static route smoke | Phase 2+ Playwright | Browser / UI | HARD FAIL for Phase 2 completion | Public shell broken | Required static routes load | Does not prove product journey | Fix route/app shell | No |
| Visual smoke | Phase 2+ Playwright/screenshots | Visual trust | STRONG WARNING for iteration, HARD FAIL for public release if severe | Founder trust damaged by broken UI | Desktop/mobile screenshots exist and major layout not broken | Does not prove human approval | Fix layout or disclose human review needed | Owner for subjective design approval |
| Locked disclosure UI proof | Phase 2+ Playwright/validator | Compliance / trust | HARD FAIL | Misleading AI/persona/product claims | AI disclosure and no-guarantee language visible | Does not prove founder read it | Fix UI copy | No |
| Story Card domain tests | Phase 3+ command TBD | Product logic | HARD FAIL | Founder leaves without useful artifact | Pitch Story Card schema/output logic | Does not prove LLM quality | Fix logic/test | No |
| Consent tests | Phase 3+ command TBD | Privacy | HARD FAIL | Unauthorized data sharing | No share payload without explicit consent | Does not prove deployed backend | Fix consent logic | No |
| Non-AI practice Playwright | Phase 3+ Playwright | Browser E2E | HARD FAIL for Phase 3 completion | Founder cannot complete baseline practice | Founder completes guided flow and exits without sharing | Does not prove AI/provider/handoff | Fix flow | No |
| LLM provider success/failure tests | Phase 4+ command TBD | Provider / AI | HARD FAIL for LLM release | Blank/fake AI outcome | Success, missing key, timeout, malformed output handled safely | Does not prove long-term LLM quality | Fix provider/fallback/schema | No |
| Production mock isolation test | Phase 4+ command TBD | Anti-theater | HARD FAIL | Mock may masquerade as production | Test/local mocks cannot run silently in production mode | Does not prove provider quality | Fix provider guard | No |
| Scooter Wisdom prompt tests | Phase 5+ command TBD | AI behavior | HARD FAIL for persona release | Generic AI or unsafe persona claims | Approved Scooter boundaries included and forbidden claims blocked | Does not prove every possible output | Fix prompt/guardrails | Owner for persona changes |
| Approved-only wisdom validator | Phase 5+ command TBD | Content governance | HARD FAIL | Raw/unapproved Scooter material leaks into runtime | Only approved wisdom is used | Does not prove quality of approved wisdom | Fix content pipeline | Owner for approvals |
| Voice provider tests | Phase 6+ command TBD | Provider / voice | HARD FAIL if voice feature enabled | Fake or broken Scooter voice layer | ElevenLabs enabled/disabled/failure states are safe | Does not prove voice likeness quality | Fix provider/fallback | Owner for voice approval |
| Avatar provider tests | Phase 6+ command TBD | Provider / avatar | HARD FAIL if avatar dynamic feature enabled | Fake or broken avatar layer | HeyGen disabled/failure states and static fallback work | Does not prove render quality | Fix provider/fallback | Owner for visual approval |
| Cost guard tests | Phase 6+ command TBD | Cost control | HARD FAIL before dynamic paid provider calls | Paid renders can run away | Daily/monthly render caps block excessive usage | Does not prove provider billing accuracy | Fix guard/limits | Owner for limit changes |
| Network OS payload contract test | Phase 7+ command TBD | Integration | HARD FAIL | Bad intake records or CRM pollution | Payload maps to intake contract | Does not prove Network OS persistence | Fix mapping | No |
| Signed handoff security test | Phase 7+ command TBD | Security / integration | HARD FAIL | Public endpoint can be abused | Unsigned/invalid requests fail safely | Does not prove deployed config | Fix signature/auth | No |
| Network OS handoff E2E | Phase 7+ command TBD | Integration/E2E | HARD FAIL for COMPLETE | Submitted founders do not reach review queue | Opted-in submission appears as pending intake | Does not prove human follow-up | Fix handoff | No |
| No auto-contact creation test | Phase 7+ command TBD | CRM safety | HARD FAIL | CRM pollution / false relationship records | Pitch Lab creates only pending intake, not final contact | Does not prove reviewer later acts | Fix integration | No |
| Email card tests | Phase 8+ if enabled | Email / privacy | HARD FAIL if email enabled | Unauthorized or fake email result | Email consent and provider result are safe | Does not prove inbox deliverability | Fix provider/failure state | No |
| Master Gauntlet local headed run | Phase 9 command TBD | Browser E2E | HARD FAIL for product COMPLETE | Critical founder/user outcomes broken | Deep journey/outcome E2E with diagnostics | Does not prove deployed runtime | Fix journey/state/security | No |
| Deep Validation | Phase 9/10 command TBD | Non-browser validation | HARD FAIL before COMPLETE once runtime exists | Build/test/env/provider regressions missed | Selected non-Playwright layers pass from clean state | Does not prove browser behavior | Fix failures | No |
| Deployed smoke | Phase 10 command TBD | Deployment | HARD FAIL for deployed COMPLETE | Production deploy broken | Deployed app loads and critical routes respond | Does not prove all journeys | Fix deploy/runtime | No |
| Postdeploy critical-lane E2E | Phase 10 command TBD | Deployment / E2E | HARD FAIL after Network OS integration | Local behavior differs from production | Critical deployed founder/share lane works | Does not prove all optional features | Fix production/env/provider issue | No |
| GitHub Actions verification | `gh run list --limit 20` if Actions exist | CI/CD | HARD FAIL for CI-backed COMPLETE | CI failure hidden | Workflow status is known | Does not prove deployed product unless workflow does | Inspect/fix failed run | No |

## Required Future Proof Layers by Phase

- Phase 1: structural/docs validation, env validation, no-secrets validation.
- Phase 2: canonical runtime validation, build, static route smoke, visual smoke, disclosure/copy proof.
- Phase 3: domain tests for flow/story card state, consent tests, Playwright non-AI founder journey.
- Phase 4: LLM integration tests with safe failure handling and mock isolation.
- Phase 5: Scooter Wisdom approved-only and forbidden-claim tests.
- Phase 6: voice/avatar provider disabled/failure/cost-guard tests.
- Phase 7: Network OS handoff contract, security, persistence/readback, and no-auto-contact tests.
- Phase 8: email tests only if email feature enabled.
- Phase 9: local headed Playwright Master Gauntlet, Deep Validation, hostile review loop.
- Phase 10: ZIP reopen, deployed smoke, postdeploy critical-lane E2E, GitHub Actions if present.

## Completion Rule

No implementation phase may claim COMPLETE from surface proof alone.

Full product COMPLETE requires maximum target proof: build, validators, unit/domain tests, provider failure tests, Network OS integration proof, Master Gauntlet, deployed smoke where applicable, GitHub Actions verification if present, ZIP reopen, and no known fixable issues.

---

## Phase 3 Validation Addendum — Local Pitch Practice Flow

| Layer | Command | Required for Phase 3 | Proves | Does Not Prove |
|---|---:|---:|---|---|
| Phase 3 Domain Contracts | `npm run test:domain` | Yes | Question sequence, local validation, local card shape, inactive consent state | Browser rendering or provider integrations |
| Phase 3 Static Validation | `npm run validate:phase3` | Yes | Required Phase 3 files, locked questions, local card flags, built route text, no forbidden runtime claims | Live AI, email, Network OS handoff, visual screenshot proof |
| Route Smoke | `npm run smoke:routes` | Yes | Built static routes return required locked copy | Interactive browser workflow depth |
| Visual Smoke | `npm run smoke:visual` | Attempt if available | Screenshots if local Chromium is available | Product correctness by itself |

Phase 3 remains local-only. It is not proof of Gemini, ElevenLabs, HeyGen, MakeUGC, email, Network OS, or production deployment behavior.

## Phase 4 validation matrix addendum

Phase 4 is validated as a server-side LLM contract and fallback-router layer, not as full live provider proof.

Hard fail:
- `npm run validate:phase4`
- `npm run test:domain`
- `npm run validate:no-theater`
- `npm run validate:no-secrets`
- `npm run validate:env`
- `npm run build`
- `npm run smoke:routes`

Phase 4 behavioral proof included:
- valid answer payload passes AI request validation
- oversized payload fails before provider call
- explicit local/test provider returns schema-valid AI card for tests only
- Gemini-first/OpenAI-fallback routing order is deterministic
- OpenAI fallback can return a schema-valid card after Gemini fails
- missing configured Gemini/OpenAI keys return `ai_unavailable`
- unavailable AI result is not marked `aiEnhanced`
- unavailable AI result contains no placeholder story card
- malformed provider output fails schema validation
- AI disclosure includes no-investment-decision boundary
- Phase 4 result does not enable sharing

Not proven in Phase 4:
- live Gemini/OpenAI API calls with real keys
- deployed Cloudflare Pages Functions behavior
- browser visual screenshot proof
- Network OS handoff
- voice/video/email providers

---

## Phase 5 Validation Addendum — Scooter Wisdom Layer

Phase 5 requires:

- `npm run validate:phase5`
- `tests/domain/phase5-contracts.mjs`
- prompt contract includes Scooter Wisdom context;
- raw sources blocked from runtime;
- approved chunks only;
- no fabricated Scooter quotes;
- no vector DB in MVP;
- forbidden claims present;
- no new provider keys required.

Phase 5 does not prove live LLM quality or future Scooter interview approval.

## Phase 5 Patch — Non-Optional Scooter Wisdom Invariant

Scooter Wisdom is not a feature flag, mode, optional provider, or env-controlled switch. West Peek Pitch Lab cannot run its AI coaching identity without the approved Scooter Wisdom Layer. Runtime must always load approved wisdom from `content/scooter-wisdom/approved/approved-wisdom.json`; raw wisdom is never runtime material; vector/dynamic/raw modes are not available in MVP. Env vars must not turn Scooter Wisdom on/off, select a wisdom mode, or override the approved version.

## Phase 6 Validation Admission

`validate:phase6` is admitted as a current hard-fail validator. It proves the managed voice/avatar provider contract exists, that provider keys stay server-side, that disabled/missing providers fail safely, that static fallback remains available, and that request-level cost guards block oversized or disallowed avatar renders.

It does not prove live ElevenLabs, HeyGen, or MakeUGC account validity, media quality, persistent usage metering, or visual approval.


## Phase 7 Network OS handoff

Implemented consent-gated signed handoff from Pitch Lab to Network OS. Pitch Lab posts to `/api/pitch/share`; Network OS receives at `/api/intake/pitch-lab`. The handoff creates pending intake only, requires explicit consent, and forbids automatic contact creation. See `docs/PHASE_7_NETWORK_OS_HANDOFF_REVIEW.md`.


## Phase 9A Pitch Lab E2E / Completeness Review

Phase 9A hardens the founder journey before design overhaul: copy-card path, qualitative Story Strength Signals, no numeric/fundability scoring, no email feature, consented share only, and confirmed-submission-only thank-you behavior. See `docs/PHASE_9A_PITCH_LAB_E2E_AND_COMPLETENESS_REVIEW.md`.


## Phase 9B Design Overhaul
- Applied West Peek black/white/orange visual system.
- Added repo-owned West Peek logo and mark assets under `public/assets/brand/`.
- Locked product mantra to “Good products need good stories.” and retained brand mantra “Good people should meet good people.”
- Preserved Story Strength Signals, copy-card path, consent boundaries, no-email MVP scope, and no fake provider/media success.

## Phase 9B.1 — West Peek Design Parity Pass

Added after owner clarified that `westpeek.ventures` and `westpeek.live` are the preferred West Peek app-family references.

Hard-fail validation now includes:

- `npm run validate:phase9b1`
- `tests/domain/phase9b1-contracts.mjs` through `npm run test:domain`

This pass proves:

- the provided West Peek logo image is the canonical app logo asset;
- fabricated prior SVG logo/mark assets are not retained;
- black / white / restrained orange styling is present;
- Ventures-inspired editorial founder language is present;
- Live-inspired operating-system directness is documented;
- Story Card readability and consent/trust boundaries remain present;
- removed features such as email-me-card and public avatar render controls do not resurface.

This does not prove pixel-perfect parity or headed browser rendering. Those remain Phase 9D / local gauntlet concerns.

## Phase 9D Master Gauntlet Admission

| Validator / Test | Command | Category | Severity | Production Risk | What It Proves | What It Does Not Prove | Failure Handling | Owner Decision Needed? |
|---|---|---|---|---|---|---|---|---|
| Master Gauntlet wiring | `npm run validate:master-gauntlet` | master gauntlet / E2E proof harness | HARD FAIL CURRENT | Pitch Lab is Level 5 and cannot claim complete product proof without a capstone journey harness. | Gauntlet docs, Playwright config, spec, fixtures, official Scooter photo, ElevenLabs-first provider posture, required media moments, and no-theater assertions exist. | Does not prove headed browser execution, live ElevenLabs provider success, deployed Cloudflare runtime, or live Network OS persistence. | Restore missing gauntlet/provider/media proof harness before packaging. | No |

Phase 9D full product completion still requires the local/headed gauntlet run and live provider/env subset when keys/assets are available.

## Phase 9D Master Gauntlet Admission

| Validator / Test | Command | Category | Severity | Production Risk | What It Proves | What It Does Not Prove | Failure Handling | Owner Decision Needed? |
|---|---|---|---|---|---|---|---|---|
| Master Gauntlet wiring | `npm run validate:master-gauntlet` | master gauntlet / E2E proof harness | HARD FAIL CURRENT | Pitch Lab is Level 5 and cannot claim complete product proof without a capstone journey harness. | Gauntlet docs, Playwright config, spec, fixtures, official Scooter photo, ElevenLabs-first provider posture, required media moments, and no-theater assertions exist. | Does not prove headed browser execution, live ElevenLabs provider success, deployed Cloudflare runtime, or live Network OS persistence. | Restore missing gauntlet/provider/media proof harness before packaging. | No |

Phase 9D full product completion still requires the local/headed gauntlet run and live provider/env subset when keys/assets are available.


## Live gauntlet report runner

`gauntlet:live:report` and `gauntlet:live:report:headed` are admitted as warning/reporting commands, not `validate:all` hard-fails. They run real provider/browser/post-deploy lanes, redact secret-shaped output, and write one repair report under `tmp/live-gauntlet-report/`. Media proof accepts either an approved playable asset or a complete runtime generation/cache contract; committed clip files are optional fallbacks for reusable moments, not the only valid product state.
