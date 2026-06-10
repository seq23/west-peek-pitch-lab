# Validation Simplification Matrix — West Peek Pitch Lab

**Status:** ACTIVE / ADMISSION AUTHORITY  
**Machine-readable companion:** `_repo_validation_matrix.json`  
**Current implemented phase:** Phase 5  
**Target product complexity:** Level 5

## Purpose

This matrix keeps validation thorough without making routine iteration miserable.

It answers three questions for every validator:

1. **Should this block delivery right now?**
2. **What production risk does it protect?**
3. **What does it prove — and what does it not prove?**

The matrix is the admission authority for future validators. No new validator, smoke test, CI gate, provider check, Playwright suite, or deploy check may be added unless it is first routed through this matrix or `_repo_validation_matrix.json`.

## Severity rules

| Severity | Blocks current ZIP delivery? | When used |
|---|---:|---|
| HARD_FAIL_CURRENT | Yes | Current-phase security, privacy, deployability, data integrity, critical journey, wrong artifact, fake success, broken build, required env contract |
| STRONG_WARNING_CURRENT | No, but must be disclosed | Important trust/quality/maintainability issue, visual proof gap, local environment limitation, non-critical drift risk |
| WARNING | No | Polish, optional cleanup, non-critical duplication, minor docs/copy improvement |
| INFO / NO VALIDATION | No | Future ideas, subjective style, optional enhancements, human review notes |
| HARD_FAIL_BEFORE_DEPLOY | Not now; yes before deploy | Cloudflare env apply, deployed smoke, production base URL, provider production config |
| HARD_FAIL_FOR_COMPLETE | Not now; yes before COMPLETE | Master Gauntlet, Network OS E2E, postdeploy critical-lane proof, provider live proof where claimed |

## Current hard-fail set

These are the only checks allowed to hard-fail `npm run validate:all` in Phase 5:

| Script | Why it may hard fail now |
|---|---|
| `validate:matrix` | Prevents unclassified validation and petty/theatrical gates |
| `validate:phase1` | Protects repo/product contracts from drift |
| `validate:env` | Protects env registry, secret boundaries, and deploy-scope sanity |
| `validate:no-secrets` | Prevents plaintext credential exposure |
| `validate:no-theater` | Blocks fake provider success, production mocks, and hidden placeholders |
| `validate:locked-copy` | Protects core product promise/disclosure anchors |
| `build` | Proves current static app can build |
| `test:domain` | Proves current domain contracts |
| `validate:phase2` | Proves static shell/trust anchors and no fake claims |
| `validate:phase3` | Proves local practice/card/share boundary |
| `validate:phase4` | Proves server-side LLM contract/fallback/unavailable state |
| `validate:phase5` | Proves mandatory approved-only Scooter Wisdom invariant |
| `smoke:routes` | Proves built static routes respond locally |

## Current warning-only checks

| Script | Severity now | Why it does not hard fail current ZIP delivery |
|---|---|---|
| `smoke:visual` | STRONG_WARNING_CURRENT | Chromium may be unavailable in sandbox; screenshots do not equal human visual approval |
| `env:create-local` | STRONG_WARNING_CURRENT; hard fail before live local provider proof | Local setup proof, not required for structural ZIP artifact |
| `env:local:from-vault` | STRONG_WARNING_CURRENT; hard fail before local live runtime proof | Recovery proof requires owner passphrase/context |
| `env:cloudflare:plan` | STRONG_WARNING_CURRENT; hard fail before deployment | Names-only deployment plan, not deploy proof |

## Anti-petty hard-fail rules

Validators must not hard fail on:

- subjective design preference
- exact non-critical wording
- cosmetic spacing/formatting
- optional docs polish
- transitive dependency warnings
- screenshot generation failure in a sandbox when product behavior was not claimed visually proven
- future-phase provider keys before the provider phase is enabled

Validators may hard fail on wording only when the wording is a locked brand/legal/trust boundary, such as:

- product name and founder line
- AI Scooter disclosure
- no investment/review/funding/meeting guarantee
- no fake Scooter/human review claim
- explicit consent before sharing

## Future validation routing

| Future feature | Required routing before implementation |
|---|---|
| ElevenLabs voice | provider disabled state, server-side key boundary, failure state, cost guard |
| HeyGen / MakeUGC avatar | provider disabled state, no fake render success, cost guard, fallback state |
| Network OS handoff | signed request, consent proof, pending intake, no auto-contact creation, readback/integration proof |
| Email card | separate email consent, provider failure, no fake sent state |
| Playwright Master Gauntlet | persona journey matrix, negative paths, provider failures, consent/share, mobile critical lane |
| Deployment | Cloudflare env scope, no placeholder production values, deployed smoke, postdeploy critical lane where safe |

## Final rule

**Every validator must know its severity before it exists.**

Phase sequencing is allowed. Validation theater is not. Petty hard-fails are not. Security/privacy/deploy/user-outcome risks still block.
