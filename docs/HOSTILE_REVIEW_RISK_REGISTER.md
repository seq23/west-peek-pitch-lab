# Hostile Review Risk Register — West Peek Pitch Lab

**Status:** Folded into implementation plan

| Risk | Fix / Guardrail | Phase |
|---|---|---|
| Generic AI with Scooter's face | Scooter Wisdom Layer required | Phase 5 |
| Founder distrust / bait-and-switch capture | Value first, consented share second | Phase 3/7 |
| Avatar gimmick over real value | Product proof is Pitch Story Card quality | All |
| Legal/brand risk from likeness | Scooter approval + AI disclosure + no personal review claims | Phase 1/6 |
| Investment decision confusion | No investment decision, no funding guarantee, no review guarantee | Phase 1+ |
| Duplicate CRM | Network OS remains CRM; Pitch Lab only handoff source | Phase 1/7 |
| CRM pollution | Pending intake only; no auto-contact creation | Phase 7 |
| Sensitive founder data | Consent model, minimal capture, server-side provider calls | Phase 1+ |
| Provider/avatar failure | Static fallback and provider health | Phase 6 |
| Fake success states | Honest failure states for LLM/email/handoff | Phase 4/7/8 |
| Hidden production mocks | Mocks only in explicit local/test lane | Phase 4+ |
| Client-side secret exposure | Env contract; providers server-side only | Phase 1+ |
| Weak proof / surface-only validation | Domain, consent, payload, Playwright, and handoff tests | Phase 9 |
| Unclear internal routing | `pitch_lab` source and `pitch_practice` capture type | Phase 7 |

## Exit Condition

No build phase may proceed unless the relevant risk guardrails are represented in repo-owned docs, code, validators, or tests.

## Added Hostile Review Finding — Env Drift / Dashboard-Only Secrets

### Risk
The original Phase 1 artifact documented env vars but did not provide a deterministic way to create `.env.local`, persist the complete env set, or prepare Cloudflare sync. That would create dashboard-only drift and deployment fragility.

### Fix
Added deterministic env system:

- `config/env.registry.json` lists every env var.
- `npm run env:create-local` creates `.env.local` with safe placeholders.
- `secrets/pitch-lab.env.vault.enc` stores the full env set encrypted.
- `npm run env:cloudflare:plan` creates a Cloudflare env sync plan from the vault.
- `npm run validate:env` validates registry, examples, vault envelope, and gitignore safety.

### Remaining Boundary
Phase 1 does not apply secrets to Cloudflare. A later deploy-phase script may add guarded `--apply` behavior only after explicit approval.

## Added Hostile Review Finding — Avatar Provider Cost / Complexity Drift

### Risk
Open-source avatar rendering can consume large setup time while producing inconsistent output. Fully dynamic managed avatar video for every AI response can create cost runaway, latency, and brittle user experience.

### Fix
Locked managed-provider posture:

- ElevenLabs is the voice authority for Scooter's approved voice.
- HeyGen is the default managed avatar video provider.
- MakeUGC remains fallback only.
- Detailed coaching is text-supported, while talking AI Scooter is core at key moments.
- Voice can be used more often than video.
- Avatar video is limited to reusable or high-value moments.
- Dynamic avatar generation is disabled by default.
- Cost guards are required before dynamic provider usage.

### Remaining Boundary
Provider pricing/API behavior must be rechecked before final implementation. No implementation may assume unlimited video rendering.
